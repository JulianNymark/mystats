CREATE TABLE heartBPMs (
    heartBPM SERIAL PRIMARY KEY,
    time timestamptz NOT NULL,
    value integer NOT NULL,
    UNIQUE(time)
);