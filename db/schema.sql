DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS parties;
DROP TABLE IF EXISTS voters;
DROP TABLE IF EXISTS votes;

CREATE TABLE parties (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT 
);

CREATE TABLE candidates (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    party_id INTEGER,
    industry_connected BOOLEAN NOT NULL,
    CONSTRAINT fk_party FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE SET NULL /* constraint. This allows us to flag the party_id field as an official foreign key and tells SQL 
    which table and field it references. We added ON DELETE SET NULL to tell SQL to set a candidate's party_id field to NULL if the corresponding row in parties is ever deleted. */
);

CREATE TABLE voters (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP /* In SQL, a DATETIME field's value will look something like 2020-01-01 13:00:00. That probably doesn't seem 
    very user-friendly, but the front-end team can take that value, convert it with JavaScript's Date() constructor, and display anything they want at that point. */
);

CREATE TABLE votes (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    voter_id INTEGER NOT NULL,
    candidate_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uc_voter UNIQUE (voter_id), /* uc_voter, signifies that the values inserted into the voter_id field must be unique. For example, whoever has a voter_id of 1 can only appear in this table once. */
    CONSTRAINT fk_voter FOREIGN KEY (voter_id) REFERENCES voters(id) ON DELETE CASCADE, /* Previously, ON DELETE SET NULL would set the record's field to NULL if the key from the reference table was deleted. 
    With ON DELETE CASCADE, deleting the reference key will also delete the entire row from this table. */
    CONSTRAINT fk_candidate FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);