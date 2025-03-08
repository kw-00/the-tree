-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2025-02-09 14:36:34.07

-- foreign keys
ALTER TABLE messages
    DROP CONSTRAINT sender_id_to_messages;


ALTER TABLE messages
    DROP CONSTRAINT recipient_id_to_messages;


ALTER TABLE refresh_tokens
    DROP CONSTRAINT user_id_to_refresh_tokens;

-- tables
DROP TABLE messages;
DROP TABLE users;

DROP table refresh_tokens;

-- End of file.

