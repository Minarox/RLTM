export interface Client {
    ws: WebSocket;
    messages: any[];
    waitFor(predicate: (message: any) => boolean, timeout?: number): Promise<any>;
    send(message: unknown): void;
    closed: Promise<void>;
}

const sockets: WebSocket[] = []

export function connect(url: string, options?: any): Promise<Client> {
    const ws = new WebSocket(url, options)
    sockets.push(ws)

    const messages: any[] = []
    const waiters: Array<{ predicate: (message: any) => boolean, resolve: (message: any) => void }> = []

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        messages.push(message)
        waiters.filter((waiter) => waiter.predicate(message)).forEach((waiter) => waiter.resolve(message))
    }

    const closed = new Promise<void>((resolve) => ws.addEventListener('close', () => resolve()))

    const client: Client = {
        ws,
        messages,
        closed,
        waitFor(predicate, timeout = 1000) {
            const message = messages.find(predicate)
            if (message) return Promise.resolve(message)

            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => reject(new Error("Message not received")), timeout)
                waiters.push({ predicate, resolve: (message) => { clearTimeout(timer); resolve(message) } })
            })
        },
        send(message) {
            ws.send(JSON.stringify(message))
        }
    }

    return new Promise((resolve, reject) => {
        ws.onopen = () => resolve(client)
        ws.onerror = () => reject(new Error("Connection failed"))
    })
}

export function connectOverlay(slotId: string = 'DEFAULT', page: string = 'overlay'): Promise<Client> {
    return connect(`ws://localhost:3300/DEFAULT/${slotId}/${page}`)
}

export function connectPlugin(token: string = 'TOKEN-DEFAULT'): Promise<Client> {
    return connect(`ws://localhost:3300/?token=${token}`)
}

export async function closeSockets(): Promise<void> {
    sockets.splice(0).forEach((ws) => ws.close())
    await sleep(50)
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const adminHeaders = { Authorization: 'Bearer ADMIN-TOKEN', 'Content-Type': 'application/json' }
