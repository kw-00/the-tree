-- foreign keys
ALTER TABLE messages
    DROP CONSTRAINT user_id_to_messages;

ALTER TABLE messages
    DROP CONSTRAINT chatroom_id_to_messages;

ALTER TABLE chatrooms_users
	DROP CONSTRAINT chatroom_id_to_chatrooms_users;

ALTER TABLE chatrooms_users
	DROP CONSTRAINT user_id_to_chatrooms_users;

ALTER TABLE friends 
	DROP CONSTRAINT user_id_to_friends_1;

ALTER TABLE friends 
	DROP CONSTRAINT user_id_to_friends_2;

ALTER TABLE friends 
	DROP CONSTRAINT user1_id_user2_id_unique;

ALTER TABLE friends
	DROP CONSTRAINT friends_id_order;

ALTER TABLE friendship_codes 
	DROP CONSTRAINT user_id_to_friendship_codes;

ALTER TABLE refresh_tokens
    DROP CONSTRAINT user_id_to_refresh_tokens;

-- tables
DROP TABLE messages;
DROP TABLE chatrooms;
DROP TABLE chatrooms_users;
DROP TABLE users;
DROP TABLE friends;
DROP TABLE friendship_codes;
DROP table refresh_tokens;

