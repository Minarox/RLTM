import { compression } from 'elysia-compression'

export default compression({
    type: 'gzip',
    options: {
        level: 9,
        memLevel: 9
    }
});
