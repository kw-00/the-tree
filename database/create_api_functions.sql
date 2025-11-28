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
	409/USER_IN_CHAT
    401/INVALID_CREDENTIALS — wrong username or password.
    401/REFRESH_TOKEN_EXPIRED — refresh token has expired.
    401/REFRESH_TOKEN_REUSE — refresh token has already been used.
    401/REFRESH_TOKEN_REVOKED — refresh token has been revoked.
	401/REFRESH_TOKEN_NOT_FOUND — refresh token does not exist.
	403/NOT_IN_CHATROOM — user is not part of chatroom.
    404/USER_NOT_FOUND — user does not exist.
	404/CHATROOM_NOT_FOUND — chatroom does not exist.
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
	* userId INT — the ID of the newly registered user
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
	ELSIF p_password IS NULL THEN
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
	WHEN unique_violation THEN
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
	* userId INT — the ID of the user
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
	ELSIF p_password IS NULL THEN
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
	* userId INT — the ID of the user associated with the given token
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
	ELSIF v_expires_at < v_now THEN
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
	* refreshToken UUID — the UUID of the newly created token
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
	ELSIF p_validity_period_seconds IS NULL THEN
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
	WHEN unique_violation THEN
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
Adds users to a chatroom. Meant to be called on behalf of one user, who has to be
in the chat in order to add others.

PARAMS:
	* p_user_id — the ID of the user who will be added to the chatroom
	* p_chatroom_id — the ID of the chatroom
	* p_users_id — the IDs of the users who will be added

RETURNS:
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 403/NOT_IN_CHATROOM
		* 404/USER_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api.add_users_to_chatroom(
	p_user_id INT,
	p_user_ids INT[],
	p_chatroom_id INT

)
RETURNS JSONB
AS
$function$
BEGIN
	IF p_user_id IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400, 
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_user_id')
		);
	END IF;

	RETURN api._add_users_to_chatroom(p_user_ids, p_chatroom_id);
END;
$function$
LANGUAGE plpgsql;

/*
Adds users in a chatroom.

PARAMS:
	* p_user_ids — the ids of the users who will be added to the chatroom
	* p_chatroom_id — the id of the chatroom

RETURNS:
	* added — list of users who were added
	* skipped — list of users who were found but skipped for whatever reason
	* notFound — list of user IDs which were found not to exist
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 404/USER_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api._add_users_to_chatroom(
	p_user_ids INT[],
	p_chatroom_id INT
)
RETURNS JSONB
AS
$function$
DECLARE
	v_added INT[];
	v_skipped INT[];
	v_not_found INT[];
BEGIN
	-- If p_chatroom is null, error
	IF p_chatroom_id IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400, 
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_chatroom_id')
		);	
	END IF;

	-- If chatroom does not exist, error
	IF NOT EXISTS (SELECT 1 FROM chatrooms WHERE id = p_chatroom_id) THEN
		RETURN json_build_object(
			'httpStatus', 404, 
			'status', 'USER_NOT_FOUND',
			'message', format('Chatroom with ID of %L does not exist.', p_chatroom_id)
		);
	END IF;

	-- Gather the user IDs among those to be added that actually exist
	-- and put them in a CTE
	WITH valid AS (
		SELECT id
		FROM UNNEST(p_user_ids) as ids_to_add(id)
		INNER JOIN users ON users.id = ids_to_add.id
	),
	-- Try to add those users to the chatroom
	-- and put those who were successfully added in a CTE
	inserted AS (
		INSERT INTO chatrooms_users (chatroom_id, user_id)
		SELECT p_chatroom_id, id FROM valid
		ON CONFLICT DO NOTHING
		RETURNING id
	)
	-- Now use the CTEs to fill arrays that will later be featured in the functions return value
	SELECT 
		-- Store users who were auccessfully added in an array
		(SELECT array_agg(inserted.id)), 
		-- Store those who exist but were not added in another array
		(SELECT array_agg(valid.id) FILTER (WHERE valid.id NOT IN (SELECT inserted.id FROM inserted))),
		-- Store the ones that do not exist in a separate one
		(
			SELECT array_agg(id) FILTER (WHERE id NOT IN (SELECT valid.id FROM valid) )
			FROM UNNEST(p_user_ids) AS id
		) 
		INTO 
		v_added,
		v_skipped,
		v_not_found;

	-- Return all the info
	RETURN json_build_object(
		'added', to_json(v_added),
		'skipped', to_json(v_skipped),
		'notFound', to_json(v_not_found),
		'httpStatus', 200, 
		'status', 'SUCCESS',
		'message', 'Successfully added user to chatroom.'
	);
END;
$function$
LANGUAGE plpgsql;

/*
Creates a chatroom and places users inside.

PARAMS:
	* p_user_ids — the users who will be added immediately after creation
	* name — the name of the chatroom.

RETURNS:
	* chatroomId — ID of the added chatroom
	* added — list of users who were added
	* skipped — list of users who were found but skipped for whatever reason
	* notFound — list of user IDs which were found not to exist
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 404/USER_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api.create_chatroom(
	p_name TEXT,
	p_user_ids INT[]
)
RETURNS JSONB
AS
$function$
DECLARE
	v_chatroom_id INT;
	v_chatroom_name TEXT;
	v_addition_result JSONB;
BEGIN
	-- Create chatroom
	INSERT INTO chatrooms (name) VALUES (p_name)
	RETURNING id, name INTO v_chatroom_id, v_chatroom_name;
	-- Add users
	SELECT api._add_users_to_chatroom(p_user_ids, v_chatroom_id) INTO v_addition_result;
	RETURN json_build_object('id', v_chatroom_id, 'name', v_chatroom_name) || v_addition_result; 
END;
$function$
LANGUAGE plpgsql;

/*
Finds all chatrooms the given user is in.

PARAMS:
	* p_user_id

RETURNS:
	* connectedChatrooms {id INT, name TEXT}[]
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 404/USER_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api.find_connected_chatrooms(
	p_user_id INT
)
RETURNS JSONB
AS
$function$
DECLARE
	v_connected_chatrooms JSONB;
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

	-- Gather chatrooms connected to the given user
	SELECT json_agg(row_to_json(connected_chatrooms)) 
	FROM (
		SELECT DISTINCT c.id, c.name
		FROM chatrooms c
		INNER JOIN chatrooms_users cu 
		ON cu.chatroom_id = c.id
		INNER JOIN users u
		ON u.id = cu.user_id
	) AS connected_chatrooms(id, name)
	INTO v_connected_chatrooms;

	-- Create and return json — success
	RETURN json_build_object(
			'connectedChatrooms', v_connected_chatrooms, 
			'httpStatus', 200,
			'result', 'SUCCESS', 
			'message', 'Successfully retrieved connected chatrooms.'
		);
	
END;
$function$
LANGUAGE plpgsql;

/*
Creates a message from a user in a chatroom.

PARAMS:
	* p_user_id
	* p_chatroom_id
	* p_content
	
RETURNS:
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 403/NOT_IN_CHATROOM
		* 404/USER_NOT_FOUND
		* 404/CHATROOM_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api.create_message(
	p_user_id INT,
	p_chatroom_id INT,
	p_content TEXT
)
RETURNS JSONB
AS
$function$
BEGIN
	-- If any parameter is null, error
	IF p_user_id IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400, 
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_user_id')
		);
	ELSIF p_chatroom_id IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400, 
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_chatroom_id')
		);	
	ELSIF p_content IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400, 
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_content')
		);
	END IF;
	
	-- If user or chatroom does not exist, error
	IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id) THEN
		RETURN json_build_object(
			'httpStatus', 404, 
			'status', 'USER_NOT_FOUND',
			'message', format('User with ID of %L does not exist.', p_user_id)
		);

	ELSE
		RETURN json_build_object(
			'httpStatus', 404, 
			'status', 'CHATROOM_NOT_FOUND',
			'message', format('Chatroom with ID of %L does not exist.', p_chatroom_id)
		);
	END IF;

	-- If user does not belong to the chatroom, error
	SELECT 1 FROM users u
	INNER JOIN chatrooms_users cu ON cu.user_id = u.id
	WHERE cu.chatroom_id = p_chatroom_id;
	IF NOT FOUND THEN
		RETURN json_build_object(
			'httpStatus', 403, 
			'status', 'NOT_IN_CHATROOM',
			'message', format('User with ID of %L is not in the chatroom..', p_user_id)
		);
	END IF;

	-- Create message
	INSERT INTO messages (user_id, chatroom_id, content)
	VALUES (p_user_id, p_chatroom_id, p_content);
	RETURN json_build_object(
		'httpStatus', 200, 
		'status', 'SUCCESS',
		'message', 'Successfully created message.'
	);
END;
$function$
LANGUAGE plpgsql;


/*
Returns all messages from a chatroom.

PARAMS:
	* p_chatroom_id

RETURNS:
	* conversation: {userId INT, userLogin, content TEXT}[]
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 404/CHATROOM_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api.get_conversation(
	p_chatroom_id INT,
	p_before TIMESTAMPTZ,
	p_after TIMESTAMPTZ,
	p_n_rows INT,
	p_descending BOOL
)
RETURNS JSONB --TABLE(senderId INT, senderLogin TEXT, content TEXT)
AS
$function$
DECLARE
	v_before TIMESTAMPTZ;
	v_after TIMESTAMPTZ;
	v_conversation JSONB;
BEGIN
	-- If p_chatroom_id is null, error
	IF p_chatroom_id IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', p_chatroom_id)
		);
	END IF;

	-- If p_n_rows is null, error
	IF p_n_rows IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', p_n_rows)
		);
	END IF;

	-- If p_descending is null, error
	IF p_descending IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', p_descending)
		);
	END IF;

	-- Initialize v_after with p_after or with an old timestamp if null
	IF p_after IS NULL THEN
		SELECT '2000-01-01 00:00:00+00'::TIMESTAMPTZ INTO v_after;
	ELSE
		SELECT p_after INTO v_after;
	END IF;

	-- Initialize v_before with p_before or with CURRENT_TIMESTAMP if null
	IF p_before IS NULL THEN
		SELECT CURRENT_TIMESTAMP INTO v_before;
	ELSE
		SELECT p_before INTO v_before;
	END IF;

	-- If chatroom does not exist, error
	IF NOT EXISTS(SELECT 1 FROM chatrooms c WHERE c.id = p_chatroom_id) THEN
		RETURN json_build_object(
			'httpStatus', 404,
			'status', 'CHATROOM_NOT_FOUND', 
			'message', format('Chatroom with ID of %L does not exist.', p_chatroom_id)
		);
	END IF;

	-- Return json — success
	SELECT json_agg(row_to_json(messages)) FROM (
		SELECT m.user_id, u.login, m.content
		FROM messages m
		INNER JOIN users u ON u.id = m.user_id
		WHERE m.chatroom_id = p_chatroom_id
			AND m.created_at <= v_before 
			AND m.created_at >= v_after
		ORDER BY
			CASE WHEN p_descending THEN created_at END DESC,
			CASE WHEN NOT p_descending THEN created_at END ASC
		FETCH FIRST p_n_rows ROWS ONLY
	) AS messages(userId, userLogin, content)
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

