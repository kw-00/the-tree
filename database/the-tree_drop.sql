-- foreign keys
ALTER TABLE messages
    DROP CONSTRAINT user_id_to_messages;

ALTER TABLE messages
    DROP CONSTRAINT chatroom_id_to_messages;

ALTER TABLE chatrooms_users
	DROP CONSTRAINT chatroom_id_to_chatrooms_users;

ALTER TABLE chatrooms_users
	DROP CONSTRAINT user_id_to_chatrooms_users;
	
ALTER TABLE refresh_tokens
    DROP CONSTRAINT user_id_to_refresh_tokens;

-- tables
DROP TABLE messages;
DROP TABLE chatrooms;
DROP TABLE chatrooms_users;
DROP TABLE users;
DROP table refresh_tokens;

