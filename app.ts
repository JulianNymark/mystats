import moment from 'moment'
import * as superagent from 'superagent'
import * as log from 'winston'
import * as pg from 'pg'
import * as dotenv from 'dotenv'
import * as cron from 'cron'

dotenv.config();

log.configure({
    level: 'debug',
    format: log.format.combine(  // added Winston.format: any to index.d.ts
        log.format.timestamp(),
        log.format.json(),
    ),
    transports: [
        new log.transports.Console({
            colors: true,
            level: 'debug',
        }),
        new log.transports.File({
            timestamp: true,
            filename: 'error.log',
            level: 'warn',
            // json: true,
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

const envs = `${REFRESH_TOKEN}, and ${AUTH_HEADER}`;

log.info(envs);

const today = moment();
const todayFormat = today.format('YYYY-MM-DD');

log.info(todayFormat);

log.warn('warn');
log.error('error');

