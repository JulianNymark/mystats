import * as superagent from 'superagent';

import { secrets, log } from './setup';

export async function refreshTokens(
    url: string,
    agent: superagent.SuperAgent<superagent.SuperAgentRequest>,
    refreshToken: string
) {
    let refresh_request;
    try {
        refresh_request = await agent.post(url + '/oauth2/token')
            .set('Authorization', `${secrets.AUTH_HEADER}`)
            .send('grant_type=refresh_token')
            .send(`refresh_token=${refreshToken}`).catch((err) => {
                log.error(err);
                throw err;
            });
    } catch (err) {
        log.error(err);
        return err;
    }

    const { access_token, refresh_token } = refresh_request.body;
    return Promise.resolve([access_token, refresh_token]);
}
