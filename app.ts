import moment from 'moment'
import * as superagent from 'superagent'
import * as cron from 'cron'
import * as pg from 'pg'

import { log, secrets, dbConnectPool, dbConnectClient } from './setup'
import * as myoauth from './oauth';

const url = 'https://api.fitbit.com';

let refresh_token = secrets.REFRESH_TOKEN; // initial token from .env, will be refreshed over time
let access_token = '';

let pgClient: pg.Client;

const agent = superagent.agent();

/**
 * TODO: utils.ts
 */
function todayFormatted() {
    const today = moment();
    const todayFormatted = today.format('YYYY-MM-DD');
    return todayFormatted;
}

async function getHeartData(today: string) {
    const resource = `/1/user/-/activities/heart/date/${today}/1d/1sec.json`;

    const heart_request = await agent.get(url + resource)
        .set('Authorization', `Bearer ${access_token}`);

    const heartData = heart_request.body['activities-heart-intraday'].dataset;
    return heartData;
}

async function insertHeartData(heartData: Array<{ time: string, value: number }>, today: string) {
    await pgClient.connect();

    let inserted = 0;

    for (const data of heartData) {

        const compoundDate = `${today}T${data.time}`;

        const query = 'INSERT INTO heartbpms (time, value) VALUES ($1, $2);';
        const values = [compoundDate, data.value];

        try {
            const res = await pgClient.query(query, values);
            inserted++;
        } catch (err) {
            // FIXME: gets err_1 in scope? but err is undefined???
            if (err.message.indexOf('Error: duplicate key value violates unique constraint "heartbpms_time_key"') == -1) {
                // log.error(err.stack); // FIXME: this could mask other db insertion errors!
                // I only want to hide the collisions on unique(time), as this ensures 1 value per unit of time when I re-ingest old values
                // NOTE: consider ingesting the last 2 days, and not just the last 1, can miss a small fragment at the end of the day!
            }
        }
    }
    log.info(`new values inserted: ${inserted} / ${heartData.length}`);

    await pgClient.end()
}

new cron.CronJob('0 * * * * *', async function () {
    pgClient = dbConnectClient();

    const today = todayFormatted();

    // FIXME: maybe not generate new tokens every time? /shrug
    // FIXME: unhandled promises not caughty properly here, but Error: Unauthorized usually means get new REFRESH_TOKEN
    [access_token, refresh_token] = await myoauth.refreshTokens(url, agent, refresh_token)
        .catch((err) => {
            log.error(err);
            return;
        });
    log.info('NEW REFRESH_TOKEN: ' + refresh_token);

    const heartData = await getHeartData(today);
    await insertHeartData(heartData, today);
}, null, true, null, null, true);