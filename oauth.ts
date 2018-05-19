import * as superagent from 'superagent';

import { secrets } from './setup';

// TODO: do the redirection URL request thing
// get top level token, cascade tokens down until 
// we have an access_token, then use it for requests.

export async function refreshAccessToken(url: string, agent: superagent.SuperAgent<superagent.SuperAgentRequest>) {
    const refresh_request = await agent.post(url + '/oauth2/token')
        .set('Authorization', `${secrets.AUTH_HEADER}`)
        .send('grant_type=refresh_token')
        .send(`refresh_token=${secrets.REFRESH_TOKEN}`);

    const access_token = refresh_request.body.access_token;
    return access_token;
}
