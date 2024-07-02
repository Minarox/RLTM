import { Elysia } from "elysia";

export default new Elysia({
    websocket: {
        perMessageDeflate: true
    }
})
    .ws('/', {
        beforeHandle({set, query}): string | void {
            query = Object.assign({}, query);
            if (!query.hasOwnProperty('token')) {
                throw (set.status = 'Unauthorized')
            }
        },
        message(ws, message): void {
            ws.send(message);
        }
    })
