-- How many games of each puzzle ended each way. No data about the players themselves.
CREATE TABLE IF NOT EXISTS results (
    date TEXT NOT NULL,     -- puzzle date, YYYY-MM-DD
    outcome TEXT NOT NULL,  -- 'win-0' to 'win-3' (number of mistakes) or 'loss'
    count INTEGER NOT NULL,
    PRIMARY KEY (date, outcome)
);
