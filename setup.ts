import * as dotenv from 'dotenv'
import * as winston from 'winston'
import * as pg from 'pg'

dotenv.config();

winston.configure({
    level: 'debug',
    format: winston.format.combine(  // added Winston.format: any to index.d.ts
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.Console({
            colors: true,
            level: 'debug',
        }),
        new winston.transports.File({
            timestamp: true,
            filename: 'error.log',
            level: 'warn',
        }),
    ]
});

const {
    AUTH_HEADER,
    REFRESH_TOKEN,
    PG_USER,
    PG_PASSWORD,
    PG_DBNAME,
} = process.env;

export const secrets = {
    AUTH_HEADER: String(AUTH_HEADER),
    REFRESH_TOKEN: String(REFRESH_TOKEN),
}

export const log = winston;


export function dbConnectPool() {

    const pool = new pg.Pool({
        host: 'localhost',
        database: PG_DBNAME,
        user: PG_USER,
        password: PG_PASSWORD,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    })

    return pool;
}

export function dbConnectClient() {
    const client = new pg.Client({
        database: PG_DBNAME,
        user: PG_USER,
        password: PG_PASSWORD,
    })
    return client;
}

// export { pg };
