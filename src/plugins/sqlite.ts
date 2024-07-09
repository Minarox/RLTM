import { Database } from 'bun:sqlite';

function sqlite(): Database {
    const db = new Database('rltm.sqlite');
    db.exec("PRAGMA journal_mode = WAL;");

    // Initialize the database
    db.run('CREATE TABLE IF NOT EXISTS players (id INTEGER PRIMARY KEY AUTOINCREMENT, uid TEXT, name TEXT)');

    return db;
}

export default sqlite;
