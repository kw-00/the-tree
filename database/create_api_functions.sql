CREATE SCHEMA IF NOT EXISTS api;
/*
Functions meant to be called by server return tables or JSONB
containing a "result" and "message" column/field.

Result codes:
    SUCCESS — when everything goes right.
    PK_IN_USE — primary key is already in use.
    LOGIN_IN_USE — login is already in use.
    INVALID_CREDENTIALS — wrong username or password.
    AUTHORIZATION_FAILED — authorization failed.
    REFRESH_TOKEN_EXPIRED — refresh token has expired.
    REFRESH_TOKEN_REUSE — refresh token has already been used.
    REFRESH_TOKEN_REVOKED — refresh token has been revoked.
    USER_NOT_FOUND — user does not exist.
    REFRESH_TOKEN_NOT_FOUND — refresh token does not exist.
    NULL_PARAMETER — parameter cannot be null.

Functions starting with _ (e.g. api._function_name) are considered private and not for use by
server. They may return various values.
*/

/*
Registers a new user. Throws an error if login is already taken.
Returns the ID of the newly registered user.

PARAMS:
	p_login
	p_password

RETURNS:
	TABLE
		* user_id INT — the ID of the newly registered user.
		* result TEXT
		* message TEXT
		
	Possible result values:
		* SUCCESS
		* NULL_PARAMETER
		* LOGIN_IN_USE
*/
CREATE OR REPLACE FUNCTION api.register_user(
	p_login TEXT,
	p_password TEXT
)
RETURNS TABLE(user_id INT, result TEXT, message TEXT)
AS
$function$
DECLARE
v_user_id INT;
BEGIN
	IF p_login IS NULL THEN
		RETURN QUERY SELECT -1, 'NULL_PARAMETER', format('Parameter %L cannot be NULL.', 'p_login');
		RETURN;
	ELSEIF p_password IS NULL THEN
		RETURN QUERY SELECT -1, 'NULL_PARAMETER', format('Parameter %L cannot be NULL.', 'p_password');
		RETURN;
	END IF;
	
	INSERT INTO users (login, password) 
	VALUES (p_login, p_password)
	RETURNING id INTO v_user_id;
	
	RETURN QUERY SELECT v_user_id, 'SUCCESS', 'Registration succeeded.';
EXCEPTION
	WHEN SQLSTATE '23505' THEN -- unique_violation
		RETURN QUERY SELECT -1, 'LOGIN_IN_USE', format('Login of %L is already in use.', p_login);
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
	TABLE
		* user_id INT — the ID of the newly registered user.
		* result TEXT
		* message TEXT
		
	Possible result values:
		* SUCCESS
		* NULL_PARAMETER
		* INVALID_CREDENTIALS
*/
CREATE OR REPLACE FUNCTION api.authenticate_user(
	p_login TEXT,
	p_password TEXT
)
RETURNS TABLE(user_id INT, result TEXT, message TEXT)
AS
$function$
DECLARE
	v_user_id INT;
BEGIN
	IF p_login IS NULL THEN
		RETURN QUERY SELECT -1, 'NULL_PARAMETER', format('Parameter %L cannot be NULL.', 'p_login');
		RETURN;
	ELSEIF p_password IS NULL THEN
		RETURN QUERY SELECT -1, 'NULL_PARAMETER', format('Parameter %L cannot be NULL.', 'p_password');
		RETURN;
	END IF;
	
	SELECT id INTO v_user_id FROM users WHERE login = p_login AND password = p_password;
	IF FOUND THEN
		RETURN QUERY SELECT v_user_id, 'SUCCESS', 'Authentication succeded.';
	ELSE
		RETURN QUERY SELECT -1, 'INVALID_CREDENTIALS', format('Login failed for %L.', p_login);
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
	TABLE
		* user_id INT — the ID of the user associated with the given token.
		* result TEXT
		* message TEXT
		
	Possible result values:
		* SUCCESS
		* NULL_PARAMETER
		* REFRESH_TOKEN_NOT_FOUND
		* REFRESH_TOKEN_EXPIRED
		* REFRESH_TOKEN_REUSE
		* REFRESH_TOKEN_REVOKED
*/
CREATE OR REPLACE FUNCTION api.verify_refresh_token(
	p_refresh_token_uuid UUID
)
RETURNS TABLE(user_id INT, result TEXT, message TEXT)
AS
$function$
DECLARE
	v_user_id INT;
	v_expires_at TIMESTAMPTZ;
	v_status TEXT;
	v_now TIMESTAMPTZ;

	v_uuid UUID;
BEGIN
	IF p_refresh_token_uuid IS NULL THEN
		RETURN QUERY SELECT -1, 'NULL_PARAMETER', format('Parameter %L cannot be NULL.', 'p_refresh_token_uuid');
		RETURN;
	END IF;

	SELECT rt.user_id, rt.expires_at, rt.status INTO v_user_id, v_expires_at, v_status
	FROM refresh_tokens rt
	WHERE rt.uuid = p_refresh_token_uuid;

	SELECT now() INTO v_now;
	IF NOT FOUND THEN
		RETURN QUERY SELECT -1, 'REFRESH_TOKEN_NOT_FOUND', 'Refresh token not found.';
		RETURN;
	ELSEIF v_expires_at < v_now THEN
		RETURN QUERY SELECT -1, 'REFRESH_TOKEN_EXPIRED', 'Refresh token expired.';
		RETURN;
	ELSIF v_status = 'revoked' THEN
		RETURN QUERY SELECT -1, 'REFRESH_TOKEN_REVOKED', 'Refresh token has been revoked.';
		RETURN;
	END IF;

	UPDATE refresh_tokens
	SET status = 'used'
	WHERE uuid = p_refresh_token_uuid AND expires_at >= v_now AND status = 'default'
	RETURNING uuid INTO v_uuid;

	IF NOT FOUND THEN
		RETURN QUERY SELECT -1, 'REFRESH_TOKEN_REUSE', 'Refresh token has already been used. ' ||
			'Revoking all related tokens.';
		PERFORM api._revoke_tokens_for_user(v_user_id);
		RETURN;
	END IF;
	
	RETURN QUERY SELECT v_user_id, 'SUCCESS', 'Refresh token valid.';
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
	TABLE
		* refresh_token_uuid UUID — the UUID of the newly created token.
		* result TEXT
		* message TEXT)
		
	Possible result values:
		* SUCCESS
		* NULL_PARAMETER
		* PK_IN_USE
*/
CREATE OR REPLACE FUNCTION api.create_refresh_token(
	p_user_id INT,
	p_validity_period_seconds INT
)
RETURNS TABLE(refresh_token_uuid UUID, result TEXT, message TEXT)
AS
$function$
DECLARE
	v_token_uuid UUID;
	v_validity_interval INTERVAL;
	v_expires_at TIMESTAMPTZ;
BEGIN
	IF p_user_id IS NULL THEN
		RETURN QUERY SELECT '00000000-0000-0000-0000-000000000000'::UUID, 
			'NULL_PARAMETER', format('Parameter %L cannot be NULL.', 'p_user_id');
		RETURN;
	ELSEIF p_validity_period_seconds IS NULL THEN
		RETURN QUERY SELECT '00000000-0000-0000-0000-000000000000'::UUID, 
			'NULL_PARAMETER', format('Parameter %L cannot be NULL.', 'p_validity_period_seconds');
		RETURN;	
	END IF;

	v_validity_interval := (p_validity_period_seconds || ' seconds')::INTERVAL;
	v_expires_at := now() + v_validity_interval;
	INSERT INTO refresh_tokens (user_id, expires_at) 
	VALUES (p_user_id, v_expires_at)
	RETURNING uuid 
	INTO v_token_uuid;

	RETURN QUERY SELECT v_token_uuid, 'SUCCESS', 'Refresh token created.';
EXCEPTION
	WHEN SQLSTATE '23505' THEN -- unique_violation
		RETURN QUERY SELECT '00000000-0000-0000-0000-000000000000'::UUID, 
			'PK_IN_USE', 'Primary key already in use.';
END;
$function$
LANGUAGE plpgsql;

/*
Revokes the given refresh token.

PARAMS:
	* p_refresh_token_uuid — the refresh token to be revoked

RETURNS:
	TABLE
		* result TEXT
		* message TEXT)
		
	Possible result values:
		* SUCCESS
		* NULL_PARAMETER
		* REFRESH_TOKEN_NOT_FOUND
*/

CREATE OR REPLACE FUNCTION api.revoke_token(
	p_refresh_token_uuid UUID
)
RETURNS TABLE(result TEXT, message TEXT)
AS
$function$
BEGIN
	IF NOT EXISTS(SELECT 1 FROM refresh_tokens WHERE uuid = p_refresh_token_uuid) THEN
		RETURN QUERY SELECT 'REFRESH_TOKEN_NOT_FOUND', 'Refresh token not found.';
	END IF;
	
	UPDATE refresh_tokens
	SET status = 'revoked'
	WHERE uuid = p_refresh_token_uuid;
	RETURN QUERY SELECT 'SUCCESS', 'Refresh token revoked.';
END;
$function$
LANGUAGE plpgsql;


/*
Revokes all tokens for the given user.

PARAMS:
	* p_user_id — the user in question

RETURNS VOID
*/
CREATE OR REPLACE FUNCTION api._revoke_tokens_for_user(
	p_user_id INT
)
RETURNS VOID
AS
$function$
DECLARE
	v_user_id INT;
BEGIN
	
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

RETURNS:
	TABLE
		* result TEXT
		* message TEXT

	Possible result values:
		* SUCCESS
		* NULL_PARAMETER
		* USER_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api.create_message(
	p_sender_id INT,
	p_recipient_id INT,
	p_content TEXT
)
RETURNS TABLE(result TEXT, message TEXT)
AS
$function$
BEGIN
	IF p_sender_id IS NULL THEN
		RETURN QUERY SELECT 'NULL_PARAMETER', format('Parameter %L cannot be NULL.', 'p_sender_id');
		RETURN;
	ELSEIF p_recipient_id IS NULL THEN
		RETURN QUERY SELECT 'NULL_PARAMETER', format('Parameter %L cannot be NULL.', 'p_recipient_id');
		RETURN;	
	ELSEIF p_content IS NULL THEN
		RETURN QUERY SELECT 'NULL_PARAMETER', format('Parameter %L cannot be NULL.', 'p_content');
		RETURN;
	END IF;
	
	INSERT INTO messages (sender_id, recipient_id, content)
	VALUES (p_sender_id, p_recipient_id, p_content);
EXCEPTION
	WHEN SQLSTATE '23503' THEN -- foreign_key_violation
		IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_sender_id) THEN
			RETURN QUERY SELECT 'USER_NOT_FOUND', format('User with ID of %L (sender) does not exist.', p_sender_id);
			RETURN;
		ELSE
			RETURN QUERY SELECT 'USER_NOT_FOUND', format('User with ID of %L (recipient) does not exist.', p_recipient_id);
			RETURN;
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
	JSONB {
		connected_users: {id INT, login TEXT}[],
		result TEXT,
		message: TEXT
	}
	Possible result values:
		* SUCCESS
		* NULL_PARAMETER
		* USER_NOT_FOUND
*/

drop function api.find_connected_users;
CREATE OR REPLACE FUNCTION api.find_connected_users(
	p_user_id INT
)
RETURNS JSONB
AS
$function$
DECLARE
	v_result JSONB;
BEGIN
	IF p_user_id IS NULL THEN
		RETURN (SELECT format('{"result": "NULL_PARAMETER", "message": "Parameter %L cannot be NULL."}', 
			'p_user_id')::JSONB);
	END IF;
		

	IF NOT EXISTS(SELECT 1 FROM users u WHERE u.id = p_user_id) THEN
		RETURN (SELECT format('{"result": "USER_NOT_FOUND", "message": "User with ID of %L does not exist."}', 
			p_user_id)::JSONB);
	END IF;

	SELECT json_agg(row_to_json(connected_users)) 
	FROM (
		SELECT DISTINCT u.id, u.login
		FROM users u
		INNER JOIN messages m 
		ON u.id IN (m.sender_id, m.recipient_id)
			AND p_user_id IN (m.sender_id, m.recipient_id)
		WHERE u.id != p_user_id
		ORDER BY login ASC
	) AS connected_users(id, login)
	INTO v_result;
	
	SELECT json_build_object('connected_users', v_result, 'result', 'SUCCESS', 'message', 
		'Successfully retrieved connected users.')
	INTO v_result;
	RETURN v_result;
	
END;
$function$
LANGUAGE plpgsql;

/*
Returns all messages between two users.

PARAMS:
	* p_user1_id
	* p_user2_id

RETURNS:
	JSONB {
		conversation: {sender_id INT, sender_login TEXT, content TEXT}[],
		result TEXT,
		message: TEXT
	}
	Possible result values:
		* SUCCESS
		* NULL_PARAMETER
		* USER_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api.get_conversation(
	p_user1_id INT,
	p_user2_id INT
)
RETURNS JSONB
AS
$function$
DECLARE
	v_result JSONB;
BEGIN
	IF p_user1_id IS NULL THEN
		RETURN (SELECT format('{"result": "NULL_PARAMETER", 
		"message": "Parameter %L cannot be NULL."}', 'p_user1_id'));
	ELSEIF p_user2_id IS NULL THEN
		RETURN (SELECT format('{"result": "NULL_PARAMETER", 
		"message": "Parameter %L cannot be NULL."}', 'p_user2_id'));
	END IF;
		
	IF NOT EXISTS (SELECT 1 FROM users u WHERE id = p_user1_id) THEN
		RETURN (SELECT format('{"result": "USER_NOT_FOUND", 
			"message": "User with ID of %L not found."}', p_user1_id));
	ELSIF NOT EXISTS (SELECT 1 FROM USERS WHERE id = p_user2_id) THEN
		RETURN (SELECT format('{"result": "USER_NOT_FOUND", 
			"message": "User with ID of %L not found."}', p_user2_id));
	END IF;

	SELECT json_agg(row_to_json(messages)) FROM (
		SELECT m.sender_id, u.login, m.content
		FROM messages m
		INNER JOIN users u ON u.id = m.sender_id
		WHERE m.sender_id IN (p_user1_id, p_user2_id)
			AND m.recipient_id IN (p_user1_id, p_user2_id)
		ORDER BY m.created_at ASC
	) AS messages(sender_id, sender_login, content)
	INTO v_result;
	SELECT json_build_object('conversation', v_result, 'result', 'SUCCESS', 
		'message', 'Successfully retrieved conversation.')
	INTO v_result;
	RETURN v_result;
END;
$function$
LANGUAGE plpgsql;

