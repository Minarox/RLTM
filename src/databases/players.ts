import { Database } from 'bun:sqlite';

export interface Player {
    name: string;
    uid: string;
    bot: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export class PlayersDatabase {
    private db: Database;

    constructor() {
        this.db = new Database('players.db');
        this.init()
            .then(() => console.log('Players database initialized'))
            .catch(console.error);
    }

    async init(): Promise<unknown> {
        return this.db.run(`
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                uid TEXT,
                bot BOOLEAN,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
           )
        `);
    }

    async getPlayers(): Promise<unknown> {
        return this.db.query(`
            SELECT *
            FROM players
        `).all();
    }

    async addPlayer(player: Player): Promise<unknown> {
        return this.db.query(`
            INSERT INTO books
                (name, uid, bot)
            VALUES
                (?, ?)
            RETURNING id
        `).get(player.name, player.uid) as Player;
    }
}
