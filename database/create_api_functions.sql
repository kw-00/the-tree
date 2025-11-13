CREATE SCHEMA IF NOT EXISTS api;


/*
Registers a new user. Throws an error if login is already taken.
Returns the ID of the newly registered user.

PARAMS:
	p_login
	p_password

RETURNS:
	* The ID of the newly registered user.

RAISES:
	* P1001 login_in_use
	
*/
CREATE OR REPLACE FUNCTION api.register_user(
	p_login TEXT,
	p_password TEXT
)
RETURNS INT
AS
$function$
DECLARE
v_user_id INT;
BEGIN
	PERFORM utils.null_check(p_login, 'p_login');
	PERFORM utils.null_check(p_password, 'p_password');
	
	INSERT INTO users (login, password) 
	VALUES (p_login, p_password)
	RETURNING id INTO v_user_id;
	
	RETURN v_user_id;
EXCEPTION
	WHEN SQLSTATE '23505' THEN -- unique_violation
		PERFORM utils.raise_custom_exception('P1001', ARRAY[p_login]);
END;
$function$
LANGUAGE plpgsql;




/*
PARAMS:
Authenticates a user. Throws an error when login and password do not match
any user. Returns the ID of the user if authentication is successful.

	* p_login
	* p_password
	
RETURNS:
	* The ID of the user matching the given login and password.

RAISES:
	* P2000 authentication_failed — if no match is found
		for the given login and password.
*/
CREATE OR REPLACE FUNCTION api.authenticate_user(
	p_login TEXT,
	p_password TEXT
)
RETURNS INT
AS
$function$
DECLARE
	v_user_id INT;
BEGIN
	PERFORM utils.null_check(p_login, 'p_login');
	PERFORM utils.null_check(p_password, 'p_password');
	
	SELECT id INTO v_user_id FROM users WHERE login = p_login AND password = p_password;
	IF FOUND THEN
		RETURN v_user_id;
	ELSE
		PERFORM utils.raise_custom_exception('P2000');
	END IF;
		
END;
$function$
LANGUAGE plpgsql;

/*
Checks whether a refresh token is valid.
Expired, used or revoked refresh tokens cause
an error to be thrown.

PARAMS:
	* p_refresh_token_uuid

RETURNS:
	* The ID of the user associated with the given token uuid.

RAISES:
	* P3000 authorization_failed — if the given refresh token 
		was not found in the database.
	* P3001 refresh_token_expired — if the given refresh token
		is expired.
*/
CREATE OR REPLACE FUNCTION api.verify_refresh_token(
	p_refresh_token_uuid UUID
)
RETURNS INT
AS
$function$
DECLARE
	v_user_id INT;
	v_expires_at TIMESTAMPTZ;
	v_status TEXT;
BEGIN
	PERFORM utils.null_check(p_refresh_token_uuid, 'p_refresh_token_uuid');

	SELECT rt.user_id, rt.expires_at, rt.status INTO v_user_id, v_expires_at, v_status
	FROM refresh_tokens rt
	WHERE rt.uuid = p_refresh_token_uuid;

	IF v_user_id IS NULL THEN
		PERFORM utils.raise_custom_exception('P3000');
	ELSEIF v_expires_at < now() THEN
		PERFORM utils.raise_custom_exception('P3001');
	ELSIF v_status = 'used' THEN
		PERFORM utils.raise_custom_exception('P3002');
	ELSIF v_status = 'revoked' THEN
		PERFORM utils.raise_custom_exception('P3003');
	END IF;

	UPDATE refresh_tokens
	SET status = 'used'
	WHERE uuid = p_refresh_token_uuid;
	
	RETURN v_user_id;
END;
$function$
LANGUAGE plpgsql;


/*
Creates and returns a new refresh token for a user.

PARAMS:
	* p_user_id
	* p_validity_period_seconds — the validity period of 
		the refresh token to be created, in seconds

RETURNS:
	* The UUID of the newly created refresh token.

RAISES:
	* P1000 pk_in_use — if the UUID of the newly created token 
		happens to be in use.
*/
CREATE OR REPLACE FUNCTION api.create_refresh_token(
	p_user_id INT,
	p_validity_period_seconds INT
)
RETURNS UUID
AS
$function$
DECLARE
	v_token_uuid UUID;
	v_validity_interval INTERVAL;
	v_expires_at TIMESTAMPTZ;
BEGIN
	PERFORM utils.null_check(p_user_id, 'p_user_id');
	PERFORM utils.null_check(p_validity_period_seconds, 'p_validity_period_seconds');

	v_validity_interval := (p_validity_period_seconds || ' seconds')::INTERVAL;
	v_expires_at := now() + v_validity_interval;
	INSERT INTO refresh_tokens (user_id, expires_at) 
	VALUES (p_user_id, v_expires_at)
	RETURNING uuid 
	INTO v_token_uuid;

	RETURN v_token_uuid;
EXCEPTION
	WHEN SQLSTATE '23505' THEN -- unique_violation
		PERFORM utils.raise_custom_exception('P1000', ARRAY[v_token_uuid]);
END;
$function$
LANGUAGE plpgsql;

/*
Revokes all tokens that share a user with the given
refresh token.

PARAMS:
	* p_refresh_token_uuid — the refresh token in question

RETURNS VOID

RAISES:
	* P4002 'refresh_token_not_found' — when the refresh token does not exist.
*/
CREATE OR REPLACE FUNCTION api.revoke_related_tokens(
	p_refresh_token_uuid UUID
)
RETURNS VOID
AS
$function$
DECLARE
	v_user_id INT;
BEGIN
	SELECT user_id INTO v_user_id FROM refresh_tokens WHERE uuid = p_refresh_token_uuid;
	IF v_user_id IS NULL THEN
		PERFORM utils.raise_custom_error('P4002', ARRAY[p_refresh_token_uuid]);
	END IF;
	UPDATE refresh_tokens
	SET status = 'revoked'
	WHERE user_id = v_user_id;
END;
$function$
LANGUAGE plpgsql;


/*
Creates a message between sender and receiver, 
saving it in the database.

PARAMS:
	* p_sender_id
	* p_recipient_id
	* p_content

RETURNS VOID

RAISES:
	* P4001 user_not_found — if there is no user matching
		the given sender or recipient IDs.

*/
CREATE OR REPLACE FUNCTION api.create_message(
	p_sender_id INT,
	p_recipient_id INT,
	p_content TEXT
)
RETURNS VOID
AS
$function$
DECLARE
	v_unused_id INT;
BEGIN
	PERFORM utils.null_check(p_sender_id, 'p_sender_id');
	PERFORM utils.null_check(p_recipient_id, 'p_recipient_id');
	PERFORM utils.null_check(p_content, 'p_content');
	
	INSERT INTO messages (sender_id, recipient_id, content)
	VALUES (p_sender_id, p_recipient_id, p_content);
EXCEPTION
	WHEN SQLSTATE '23503' THEN -- foreign_key_violation
		IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_sender_id) THEN
			PERFORM utils.raise_custom_error('P4001', ARRAY[p_sender_id]);
		ELSE
			PERFORM utils.raise_custom_error('P4001', ARRAY[p_recipient_id]);
		END IF;
END;
$function$
LANGUAGE plpgsql;



/*
Finds all users that have messaged or been messaged by 
any given user.

PARAMS:
	* p_user_id — the user for whom we're trying to find 
		other users that messaged or received a message from them.

RETURNS:
	* The ID and login of every user that messaged or was messaged by the given one.

RAISES:
	* 4001 user_not_found — when there is no user with the given ID.
	
*/
CREATE OR REPLACE FUNCTION api.find_connected_users(
	p_user_id INT
)
RETURNS TABLE(id INT, login TEXT)
AS
$function$
DECLARE
BEGIN
	PERFORM utils.null_check(p_user_id, 'p_user_id');

	IF NOT EXISTS(SELECT 1 FROM users u WHERE u.id = p_user_id) THEN
		PERFORM utils.raise_custom_error('4001', ARRAY[p_user_id]);
	END IF;

	RETURN QUERY SELECT DISTINCT u.id, u.login
	FROM users u
	INNER JOIN messages m 
	ON u.id IN (m.sender_id, m.recipient_id)
		AND p_user_id IN (m.sender_id, m.recipient_id)
	ORDER BY login ASC;
	
END;
$function$
LANGUAGE plpgsql;

/*
Returns all messages between two users.

PARAMS:
	* p_user1_id
	* p_user2_id

RETURNS:
	* A table containing the sender and content of each message
		between the given users.

RAISES:
	* P4001 user_not_found — when one of the users does not exist.
*/
CREATE OR REPLACE FUNCTION api.get_conversation(
	p_user1_id INT,
	p_user2_id INT
)
RETURNS TABLE(sender_id INT, content TEXT)
AS
$function$
BEGIN
	PERFORM utils.null_check(p_user1_id, 'p_user1_id');
	PERFORM utils.null_check(p_user2_id, 'p_user2_id');
		
	IF NOT EXISTS (SELECT 1 FROM users u WHERE id = p_user1_id) THEN
		PERFORM utils.raise_custom_exception('P4001', ARRAY[p_user1_id]);
	ELSIF NOT EXISTS (SELECT 1 FROM USERS WHERE id = p_user2_id) THEN
		PERFORM utils.raise_custom_exception('P4001', ARRAY[p_user2_id]);
	END IF;
	
	RETURN QUERY SELECT m.sender_id, m.content
	FROM messages m
	WHERE m.sender_id IN (p_user1_id, p_user2_id)
		AND m.recipient_id IN (p_user1_id, p_user2_id)
	ORDER BY created_at DESC;
END;
$function$
LANGUAGE plpgsql;

