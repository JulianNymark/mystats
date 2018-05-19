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
    REFRESH_TOKEN,
    AUTH_HEADER,
    PG_USER,
    PG_PASSWORD,
    PG_DBNAME,
} = process.env;

export const secrets = {
    REFRESH_TOKEN: String(REFRESH_TOKEN),
    AUTH_HEADER: String(AUTH_HEADER),
}

export const log = winston;


export function dbConnect() {
    const client = new pg.Client({
        database: PG_DBNAME,
        user: PG_USER,
        password: PG_PASSWORD,
    });

    return client;
}

// export { pg };
