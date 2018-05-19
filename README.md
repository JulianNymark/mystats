# how to:

## configuration:

### secrets

1. create a `personal` Oauth application at fitbit.com
1. get `REFRESH_TOKEN` and `AUTH_HEADER` from here https://dev.fitbit.com/apps/oauthinteractivetutorial
1. create a file called `.env` with the following content (replacing your personal Oauth values):

```
REFRESH_TOKEN=<your_refresh_token_here>
AUTH_HEADER=Basic <your_auth_header_here>
PG_USER=<your_pg_username>
PG_PASSWORD=<your_pg_password>
PG_DBNAME=<your_pg_dbname>

```
### postgres

set up a postgres DB with the appropriate user, db, password, permissions... etc (must match the values you entered in your `.env` file)

the schema used is in `tableschema.sql`

## running

assuming you have all the above in order! simply run:

```
npm run start
```