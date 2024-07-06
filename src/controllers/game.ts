import { Elysia } from "elysia";

export default new Elysia({
    websocket: {
        perMessageDeflate: true,
        idleTimeout: 5
    }
})
    .ws('/', {
        beforeHandle({set, query}): string | void {
            query = Object.assign({}, query);
            if (!query.hasOwnProperty('token')) {
                throw (set.status = 'Unauthorized')
            }
        },
        message(_ws, message: any): void {
            if (message.topic === "players") {
                console.clear();
                console.log(message);
            }
        }
    })
