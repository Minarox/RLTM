import { Elysia } from "elysia";

export default new Elysia({
    websocket: {
        perMessageDeflate: true,
        idleTimeout: 60
    }
})
    .ws('/', {
        beforeHandle({set, query}): string | void {
            query = Object.assign({}, query);
            if (!query.hasOwnProperty('token')) {
                throw (set.status = 'Unauthorized')
            }
        },
        message(_ws, message): void {
            console.log(message);
        }
    })
