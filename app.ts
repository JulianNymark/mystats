import moment from 'moment'
import * as superagent from 'superagent'
import * as cron from 'cron'
import * as pg from 'pg'

import { secrets, log, dbConnect } from './setup'
import * as myoauth from './oauth';

const url = 'https://api.fitbit.com';

let access_token = '';
let pgclient: pg.Client;

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
    await pgclient.connect();

    let inserted = 0;

    for (const data of heartData) {

        const compoundDate = `${today}T${data.time}`;

        const query = 'INSERT INTO heartbpms (time, value) VALUES ($1, $2);';
        const values = [compoundDate, data.value];

        try {
            const res = await pgclient.query(query, values)
            inserted++;
        } catch (err) {
            if (err.message !== 'error: duplicate key value violates unique constraint "heartbpms_time_key"') {
                log.error(err.stack)
            }
        }
    }
    log.info(`new values inserted: ${inserted} / ${heartData.length}`);

    await pgclient.end()
}

// TODO: cron
async function main() {
    const today = todayFormatted();

    pgclient = await dbConnect();
    await myoauth.refreshAccessToken(url, agent);
    const heartData = await getHeartData(today);

    await insertHeartData(heartData, today);
}

main().catch((err) => {
    log.error(err)
});
