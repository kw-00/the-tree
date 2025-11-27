CREATE SCHEMA IF NOT EXISTS api;

/*
Functions meant to be called by server return JSONB
in the following format:
	{
		returnField1: SOMETYPE1,
		returnField2: SOMETYPE2,
		...
		httpStatus INT,
		status TEXT,
		message TEXT
	}

As for httpStatus and status, here are the possible values:
    200/SUCCESS — when everything goes right.
    409/PK_IN_USE — primary key is already in use.
    409/LOGIN_IN_USE — login is already in use.
    401/INVALID_CREDENTIALS — wrong username or password.
    401/REFRESH_TOKEN_EXPIRED — refresh token has expired.
    401/REFRESH_TOKEN_REUSE — refresh token has already been used.
    401/REFRESH_TOKEN_REVOKED — refresh token has been revoked.
	401/REFRESH_TOKEN_NOT_FOUND — refresh token does not exist.
    400/USER_NOT_FOUND — user does not exist.
    400/NULL_PARAMETER — parameter cannot be null.

Each function's documentation will feature the following in RETURNS:
	* returnField1 SOMETYPE1 — ...
	* returnField2 SOMETYPE2 — ...
	* ...
	* httpStatus/status — possible values

Functions starting with _ (e.g. api._function_name) are considered private and not for use by
server. They may return various values.
*/

/*
Registers a new user. Returns the ID of the newly registered user.

PARAMS:
	p_login
	p_password

RETURNS:
	* userId INT — the ID of the newly registered user.
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 409/LOGIN_IN_USE
*/
CREATE OR REPLACE FUNCTION api.register_user(
	p_login TEXT,
	p_password TEXT
)
RETURNS JSONB
AS
$function$
DECLARE
v_user_id INT;
BEGIN
	-- Return error if any parameter is null
	IF p_login IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', 'p_login')
		);
	ELSEIF p_password IS NULL THEN
		RETURN json_build_object(
			'status', 400,
			'errorCode', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', 'p_password')
		);
	END IF;

	-- Add a new user to the database
	INSERT INTO users (login, password) 
	VALUES (p_login, p_password)
	RETURNING id INTO v_user_id;

	RETURN json_build_object(
		'userId', v_user_id, 
		'status', 200,
		'status', 'SUCCESS',
		'message', 'Registration succeeded.'
	); 
EXCEPTION
	-- If login is already in use, error
	WHEN SQLSTATE '23505' THEN -- unique_violation
		RETURN json_build_object(
			'httpStatus', 409,
			'status', 'LOGIN_IN_USE',
			'message', format('Login of %L is already in use.', p_login)
		); 
END;
$function$
LANGUAGE plpgsql;


/*
PARAMS:
Authenticates a user. Returns the ID of the user if authentication is successful.

	* p_login
	* p_password
	
RETURNS:
	* userId INT — the ID of the user.
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 409/INVALID_CREDENTIALS
*/
CREATE OR REPLACE FUNCTION api.authenticate_user(
	p_login TEXT,
	p_password TEXT
)
RETURNS JSONB
AS
$function$
DECLARE
	v_user_id INT;
BEGIN
	-- Return error if any parameter is null
	IF p_login IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', 'p_login')
		);
	ELSEIF p_password IS NULL THEN
		RETURN json_build_object(
			'status', 400,
			'errorCode', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', 'p_password')
		);
	END IF;

	-- Fetch id from user that matches the given credentials
	SELECT id INTO v_user_id FROM users WHERE login = p_login AND password = p_password;
	-- If a match is found, success
	IF FOUND THEN
		RETURN json_build_object(
			'userId', v_user_id,
			'httpStatus', 200,
			'status', 'SUCCESS',
			'message', 'Authentication succeeded.'
		);
	-- If no match is found, error
	ELSE
		RETURN json_build_object(
			'httpStatus', 401,
			'status', 'INVALID_CREDENTIALS', 
			'message', format('Login failed for %L.', p_login)
		);
	END IF;
		
END;
$function$
LANGUAGE plpgsql;


/*
Checks whether a refresh token is valid.

PARAMS:
	* p_refresh_token_uuid

RETURNS:
	* userId INT — the ID of the user associated with the given token.
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 401/REFRESH_TOKEN_NOT_FOUND
		* 401/REFRESH_TOKEN_EXPIRED
		* 401/REFRESH_TOKEN_REUSE
		* 401/REFRESH_TOKEN_REVOKED
*/
CREATE OR REPLACE FUNCTION api.verify_refresh_token(
	p_refresh_token_uuid UUID
)
RETURNS JSONB --TABLE(userId INT, result TEXT, message TEXT)
AS
$function$
DECLARE
	v_user_id INT;
	v_expires_at TIMESTAMPTZ;
	v_status TEXT;
	v_now TIMESTAMPTZ;

	v_uuid UUID;
BEGIN
	-- Check whether p_refresh_token_uuid is not null
	IF p_refresh_token_uuid IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'massage', format('Parameter %L cannot be NULL.', 'p_refresh_token_uuid')
		);
	END IF;

	-- Fetch id, expiry and status info for given token
	SELECT rt.user_id, rt.expires_at, rt.status INTO v_user_id, v_expires_at, v_status
	FROM refresh_tokens rt
	WHERE rt.uuid = p_refresh_token_uuid;

	SELECT now() INTO v_now;
	-- If there is no token matching the given UUID, error
	IF NOT FOUND THEN
		RETURN json_build_object(
			'httpStatus', 401,
			'status', 'REFRESH_TOKEN_NOT_FOUND',
			'message', 'Refresh token not found.'
		);
	-- If the token has expired, error
	ELSEIF v_expires_at < v_now THEN
		RETURN json_build_object(
			'httpStatus', 401,
			'status', 'REFRESH_TOKEN_EXPIRED',
			'message', 'Refresh token expired.'
		);
	-- If it has been revoked, error
	ELSIF v_status = 'revoked' THEN
		RETURN json_build_object(
			'httpStatus', 401,
			'status', 'REFRESH_TOKEN_REVOKED',
			'message', 'Refresh token has been revoked.'
		);
	END IF;

	-- Token exists, has not expired nor been revoked. But it may have been used.
	-- If it has not been used, set its status to 'used' while fetching its uuid
	UPDATE refresh_tokens
	SET status = 'used'
	WHERE uuid = p_refresh_token_uuid AND expires_at >= v_now AND status = 'default'
	RETURNING uuid INTO v_uuid;

	-- If token has been used before, revoke all tokens for user — the token may have been stolen.
	-- Then return error
	IF NOT FOUND THEN
		PERFORM api._revoke_tokens_for_user(v_user_id);
		RETURN json_build_object(
			'httpStatus', 401,
			'status', 'REFRESH_TOKEN_REUSE',
			'message', 'Refresh token has already been used. Revoked all tokens for user.'
		);
	END IF;

	-- If the token has not been used, token is valid — success
	RETURN json_build_object(
		'userId', v_user_id,
		'httpStatus', 200,
		'status', 'SUCCESS',
		'message', 'Refresh token valid.'
	);
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
	* refreshToken UUID — the UUID of the newly created token.
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
*/
CREATE OR REPLACE FUNCTION api.create_refresh_token(
	p_user_id INT,
	p_validity_period_seconds INT
)
RETURNS JSONB
AS
$function$
DECLARE
	v_token_uuid UUID;
	v_validity_interval INTERVAL;
	v_expires_at TIMESTAMPTZ;
BEGIN
	-- If any parameter is null, error
	IF p_user_id IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_user_id')
		);
	ELSEIF p_validity_period_seconds IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_validity_period_seconds')
		);
	END IF;

	-- Set token expiry time
	v_validity_interval := (p_validity_period_seconds || ' seconds')::INTERVAL;
	v_expires_at := now() + v_validity_interval;

	-- Create the token
	INSERT INTO refresh_tokens (user_id, expires_at) 
	VALUES (p_user_id, v_expires_at)
	RETURNING uuid 
	INTO v_token_uuid;

	-- If no exception occurs, success
	RETURN json_build_object(
		'refreshToken', v_token_uuid, 
		'httpStatus', 200,
		'status', 'SUCCESS',
		'message', 'Refresh token created.'
	);
EXCEPTION
	-- If token UUID happens to conflict with another, error
	WHEN SQLSTATE '23505' THEN -- unique_violation
		RETURN json_build_object(
			'httpStatus', 409,
			'status', 'PK_IN_USE',
			'message', 'Primary key already in use.'
		);
END;
$function$
LANGUAGE plpgsql;


/*
Revokes the given refresh token.

PARAMS:
	* p_refresh_token_uuid — the refresh token to be revoked
		
RETURNS:
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
*/
CREATE OR REPLACE FUNCTION api.revoke_token(
	p_refresh_token_uuid UUID
)
RETURNS JSONB
AS
$function$
BEGIN
	-- Check whether p_refresh_token_uuid is not null
	IF p_refresh_token_uuid IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_refresh_token_uuid')
		);
	END IF;

	-- If token does not exist, success! No need to revoke it. Just return success response
	IF NOT EXISTS(SELECT 1 FROM refresh_tokens WHERE uuid = p_refresh_token_uuid) THEN
		RETURN json_build_object(
			'httpStatus', 200, 
			'status', 'SUCCESS', 
			'message', 'Refresh token already revoked.'
		);
	END IF;

	-- Otherwise, revoke the token and return success response
	UPDATE refresh_tokens
	SET status = 'revoked'
	WHERE uuid = p_refresh_token_uuid;
	RETURN json_build_object(
		'httpStatus', 200, 
		'status', 'SUCCESS', 
		'message', 'Refresh token revoked.'
	);
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
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 404/USER_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api.create_message(
	p_sender_id INT,
	p_recipient_id INT,
	p_content TEXT
)
RETURNS JSONB
AS
$function$
BEGIN
	-- If any parameter is null, error
	IF p_sender_id IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400, 
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_sender_id')
		);
	ELSEIF p_recipient_id IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400, 
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_recipient_id')
		);	
	ELSEIF p_content IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400, 
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_content')
		);
	END IF;

	-- Create message
	INSERT INTO messages (sender_id, recipient_id, content)
	VALUES (p_sender_id, p_recipient_id, p_content);
	RETURN json_build_object(
		'httpStatus', 200, 
		'status', 'SUCCESS',
		'message', 'Successfully created message.'
	);
EXCEPTION
	-- If sender or recipient with given ID does not exist, error
	WHEN SQLSTATE '23503' THEN -- foreign_key_violation
		IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_sender_id) THEN
			RETURN json_build_object(
				'httpStatus', 404, 
				'status', 'USER_NOT_FOUND',
				'message', format('User with ID of %L (sender) does not exist.', p_sender_id)
			);

		ELSE
			RETURN json_build_object(
				'httpStatus', 404, 
				'status', 'USER_NOT_FOUND',
				'message', format('User with ID of %L (recipient) does not exist.', p_recipient_id)
			);

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
	* connectedUsers {id INT, login TEXT}[]
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 404/USER_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api.find_connected_users(
	p_user_id INT
)
RETURNS JSONB
AS
$function$
DECLARE
	v_connected_users JSONB;
BEGIN
	-- If p_user_id is null, error
	IF p_user_id IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', p_user_id)
		);
	END IF;
		
	-- If user does not exist, error
	IF NOT EXISTS(SELECT 1 FROM users u WHERE u.id = p_user_id) THEN
		RETURN json_build_object(
			'httpStatus', 404,
			'status', 'USER_NOT_FOUND', 
			'message', format('User with ID of %L does not exist.', p_user_id)
		);
	END IF;

	-- Gather users connected to the given user
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
	INTO v_connected_users;

	-- Create and return json — success
	RETURN json_build_object(
			'connectedUsers', v_connected_users, 
			'httpStatus', 200,
			'result', 'SUCCESS', 
			'message', 'Successfully retrieved connected users.'
		);
	
END;
$function$
LANGUAGE plpgsql;


/*
Returns all messages between two users.

PARAMS:
	* p_user1_id
	* p_user2_id

RETURNS:
	* conversation: {senderId INT, senderLogin TEXT, content TEXT}[]
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 404/USER_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api.get_conversation(
	p_user1_id INT,
	p_user2_id INT
)
RETURNS JSONB --TABLE(senderId INT, senderLogin TEXT, content TEXT)
AS
$function$
DECLARE
	v_conversation JSONB;
BEGIN
	-- If either user id is null, error
	IF p_user1_id IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', p_user1_id)
		);
	ELSEIF p_user2_id IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', p_user2_id)
		);
	END IF;

	-- If either user does not exist, error
	IF NOT EXISTS(SELECT 1 FROM users u WHERE u.id = p_user1_id) THEN
		RETURN json_build_object(
			'httpStatus', 404,
			'status', 'USER_NOT_FOUND', 
			'message', format('User with ID of %L does not exist.', p_user1_id)
		);
	ELSEIF NOT EXISTS(SELECT 1 FROM users u WHERE u.id = p_user2_id) THEN
		RETURN json_build_object(
			'httpStatus', 404,
			'status', 'USER_NOT_FOUND', 
			'message', format('User with ID of %L does not exist.', p_user2_id)
		);
	END IF;

	-- Return json — success
	SELECT json_agg(row_to_json(messages)) FROM (
		SELECT m.sender_id, u.login, m.content
		FROM messages m
		INNER JOIN users u ON u.id = m.sender_id
		WHERE m.sender_id IN (p_user1_id, p_user2_id)
			AND m.recipient_id IN (p_user1_id, p_user2_id)
		ORDER BY m.created_at ASC
	) AS messages(senderId, senderLogin, content)
	INTO v_conversation;
	RETURN json_build_object(
		'conversation', v_conversation,
		'httpStatus', 200,
		'status', 'SUCCESS', 
		'message', 'Successfully retrieved conversation.'
	);
END;
$function$
LANGUAGE plpgsql;

