CREATE SCHEMA IF NOT EXISTS core;
ALTER DATABASE thetreedb SET search_path TO 'core';
-- tables

-- Table: messages
CREATE TABLE messages (
    id SERIAL  NOT NULL,
    sender_id INT  NOT NULL,
    recipient_id INT NOT NULL,
    content TEXT  NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT posts_pk PRIMARY KEY (id)
);

-- Table: users
CREATE TABLE users (
    id SERIAL  NOT NULL,
    login TEXT  NOT NULL UNIQUE,
    password TEXT  NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pk PRIMARY KEY (id)
);

-- Table: refresh_tokens
CREATE TABLE refresh_tokens (
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id INT NOT NULL,
    status TEXT CHECK (status IN ('default', 'used', 'revoked')) DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT refresh_tokens_pk PRIMARY KEY (uuid)
);

-- foreign keys

-- Reference: sender_id_to_messages (table: messages)
ALTER TABLE messages ADD CONSTRAINT sender_id_to_messages
    FOREIGN KEY (sender_id)
    REFERENCES users (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: recipient_id_to_messages (table: messages)
ALTER TABLE messages ADD CONSTRAINT recipient_id_to_messages
    FOREIGN KEY (recipient_id)
    REFERENCES users (id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;


-- Reference: user_id_to_refresh_tokens (table: refresh_tokens)
ALTER TABLE refresh_tokens ADD CONSTRAINT user_id_to_refresh_tokens
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- End of file.