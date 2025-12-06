CREATE SCHEMA IF NOT EXISTS core;
ALTER DATABASE thetreedb SET search_path TO 'core';
-- tables

-- Table: messages
CREATE TABLE messages (
    id SERIAL  NOT NULL,
    user_id INT  NOT NULL,
    chatroom_id INT NOT NULL,
    content TEXT  NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT posts_pk PRIMARY KEY (id)
);


-- Table: chatrooms
CREATE TABLE chatrooms (
	id SERIAL NOT NULL,
	name TEXT DEFAULT NULL,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT chatrooms_pk PRIMARY KEY (id)
);

-- Table: chatrooms_users
CREATE TABLE chatrooms_users (
	chatroom_id INT NOT NULL,
	user_id INT NOT NULL,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT messages_chatrooms_pk PRIMARY KEY (chatroom_id, user_id)
);


-- Table: users
CREATE TABLE users (
    id SERIAL  NOT NULL,
    login TEXT  NOT NULL UNIQUE,
    password TEXT  NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pk PRIMARY KEY (id)
);

-- Table: friends
CREATE TABLE friends (
	user1_id INT NOT NULL,
	user2_id INT NOT NULL,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT friends_pk PRIMARY KEY (user1_id, user2_id)
);

-- Table: friendship codes
CREATE TABLE friendship_codes (
	id SERIAL NOT NULL,
	user_id INT NOT NULL,
	code TEXT NOT NULL,
	revoked BOOL DEFAULT FALSE,
	expires_at TIMESTAMPTZ DEFAULT NULL,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT friendship_codes_pk PRIMARY KEY (id)
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

-- Reference: user_id_to_messages (table: messages)
ALTER TABLE messages ADD CONSTRAINT user_id_to_messages
    FOREIGN KEY (user_id)
    REFERENCES users (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: chatroom_id_to_messages (table: messages)
ALTER TABLE messages ADD CONSTRAINT chatroom_id_to_messages
    FOREIGN KEY (chatroom_id)
    REFERENCES chatrooms (id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

-- Reference: chatroom_id_to_chatrooms_users
ALTER TABLE chatrooms_users ADD CONSTRAINT chatroom_id_to_chatrooms_users
	FOREIGN KEY (chatroom_id)
	REFERENCES chatrooms (id)
	NOT DEFERRABLE
	INITIALLY IMMEDIATE
;

-- Reference: user_id_to_chatrooms_users
ALTER TABLE chatrooms_users ADD CONSTRAINT user_id_to_chatrooms_users
	FOREIGN KEY (user_id)
	REFERENCES users (id)
	NOT DEFERRABLE
	INITIALLY IMMEDIATE
;

-- Reference: user_id_to_friends_1
ALTER TABLE friends ADD CONSTRAINT user_id_to_friends_1
	FOREIGN KEY (user1_id) 
	REFERENCES users (id)
	NOT DEFERRABLE
	INITIALLY IMMEDIATE
;

-- Reference: user_id_to_friends_2
ALTER TABLE friends ADD CONSTRAINT user_id_to_friends_2
	FOREIGN KEY (user2_id)
	REFERENCES users (id)
	NOT DEFERRABLE
	INITIALLY IMMEDIATE
;

-- Reference: friends_user1_id_user2_id_unique
ALTER TABLE friends ADD CONSTRAINT user1_id_user2_id_unique
	UNIQUE(user1_id, user2_id)
	NOT DEFERRABLE
	INITIALLY IMMEDIATE
;

-- Reference: friends_id_order
ALTER TABLE friends ADD CONSTRAINT friends_id_order
	CHECK (user1_id < user2_id)
	NOT DEFERRABLE
	INITIALLY IMMEDIATE
;

-- Reference: user_id_to_friendship_codes
ALTER TABLE friendship_codes ADD CONSTRAINT user_id_to_friendship_codes
	FOREIGN KEY (user_id)
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

