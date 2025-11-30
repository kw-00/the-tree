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
	409/BEFRIENDING_SELF — when user tries to befriend self.
    401/INVALID_CREDENTIALS — wrong username or password.
    401/REFRESH_TOKEN_EXPIRED — refresh token has expired.
    401/REFRESH_TOKEN_REUSE — refresh token has already been used.
    401/REFRESH_TOKEN_REVOKED — refresh token has been revoked.
	401/REFRESH_TOKEN_NOT_FOUND — refresh token does not exist.
	403/NOT_IN_CHATROOM — user is not part of chatroom.
	403/INVALID_FRIENDSHIP_CODE — friendship code is not valid.
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


Various secions are defined. To find a section, simply navigate to "==section_name"

Section names:
	* Users
	* Refresh_tokens
	* Friends
	* Chatrooms

*/

-- ==Users
/*
Registers a new user. Returns the ID of the newly registered user.

PARAMS:
	p_login
	p_password

RETURNS:
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
	VALUES (p_login, p_password);

	RETURN json_build_object(
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

	-- Look for user that matches the given credentials
	SELECT 1 FROM users WHERE login = p_login AND password = p_password;
	-- If a match is found, success
	IF FOUND THEN
		RETURN json_build_object(
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


-- ==Refresh_tokens
/*
Checks whether a refresh token is valid.

PARAMS:
	* p_refresh_token_uuid

RETURNS:
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 401/REFRESH_TOKEN_NOT_FOUND
		* 401/REFRESH_TOKEN_EXPIRED
		* 401/REFRESH_TOKEN_REUSE
		* 401/REFRESH_TOKEN_REVOKED
*/
CREATE OR REPLACE FUNCTION api.refresh_token(
	p_refresh_token_uuid UUID,
	p_validity_period_seconds INT
)
RETURNS JSONB
AS
$function$
DECLARE
	v_user_id INT;
	v_expires_at TIMESTAMPTZ;
	v_status TEXT;
	v_now TIMESTAMPTZ;

	v_uuid UUID;
BEGIN
	-- If any parameter is null, error
	IF p_refresh_token_uuid IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'massage', format('Parameter %L cannot be NULL.', 'p_refresh_token_uuid')
		);
	ELSIF p_validity_period_seconds IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_validity_period_seconds')
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
	RETURN api._create_refresh_token_by_id(v_user_id);
END;
$function$
LANGUAGE plpgsql;


/*
Creates and returns a new refresh token for a user.

PARAMS:
	* p_user_login
	* p_validity_period_seconds — the validity period of 
		the refresh token to be created, in seconds

RETURNS:
	* refreshToken UUID — the UUID of the newly created token
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 404/USER_NOT_FOUND
		* 409/PK_IN_USE
*/
CREATE OR REPLACE FUNCTION api.create_refresh_token_by_login(
	p_user_login TEXT,
	p_validity_period_seconds INT
)
RETURNS JSONB
AS
$function$
DECLARE
	v_user_id INT;
BEGIN
	-- If any parameter is null, error
	IF p_user_login IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_user_login')
		);
	ELSIF p_validity_period_seconds IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_validity_period_seconds')
		);
	END IF;

	SELECT id INTO v_user_id FROM users WHERE login = p_user_login;
	-- If there is no user with the given login, error
	IF NOT FOUND THEN
		RETURN json_build_object(
			'httpStatus', 404,
			'status', 'USER_NOT_FOUND',
			'message', format('User with login of "%L" does not exist.', p_login)
		);
	END IF;

	RETURN api._create_refresh_token_by_id(v_user_id);
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
		* 404/USER_NOT_FOUND
		* 409/PK_IN_USE
*/
CREATE OR REPLACE FUNCTION api._create_refresh_token_by_id(
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
	p_user_id TEXT
)
RETURNS VOID
AS
$function$
BEGIN
	
	UPDATE refresh_tokens
	SET status = 'revoked'
	FROM users u
	WHERE user_id = v_user_id;
END;
$function$
LANGUAGE plpgsql;


-- ==Friends

/*
Connects a user with another as friends.

PARAMS:
	* p_user_login TEXT — the login of the ACTIONuser using a friendship code.
	* p_login_to_befriend TEXT — the login of the user whose friendship code is being used.
	* p_friendship_code TEXT
	
RETURNS:
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 403/INVALID_FRIENDSHIP_CODE
		* 404/USER_NOT_FOUND
		* 409/BEFRIENDING_SELF
*/
CREATE OR REPLACE FUNCTION api._add_friend(
	p_user_login TEXT,
	p_login_to_befriend TEXT,
	p_friendship_code TEXT
)
RETURNS JSONB
AS
$function$
DECLARE
	v_user_id INT;
	v_user_to_befriend_id INT;
BEGIN
	-- If either user ID is null, error
	IF p_user_login IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', 'p_user_login')
		);
	ELSIF p_login_to_befriend IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', 'p_login_to_befriend')
		);
	ELSIF p_friendship_code IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', 'p_friendship_code')
		);
	END IF;
	
	-- If either user does not exist, error
	SELECT id INTO v_user_id FROM users WHERE login = p_user_login;
	IF NOT FOUND THEN
		RETURN json_build_object(
			'httpStatus', 404,
			'status', 'USER_NOT_FOUND', 
			'message', 'User does not exist.'
		);	
	END IF;
	SELECT id INTO v_user_to_befriend_id FROM users WHERE login = p_user_to_befriend;
	IF NOT FOUND THEN
		RETURN json_build_object(
			'httpStatus', 404,
			'status', 'USER_NOT_FOUND', 
			'message', 'User does not exist.'
		);	
	END IF;

	IF p_user_id = p_login_to_befriend_id THEN
		RETURN json_build_object(
			'httpStatus', 409,
			'status', 'BEFRIENDING_SELF', 
			'message', 'User cannot befriend self.'
		);	
	END IF;

	-- Check friendship code, returning error if not valid for user_to_befriend
	SELECT 1 FROM friendship_codes
	WHERE user_id = v_user_to_befriend_id AND expires_at > CURRENT_TIMESTAMP AND NOT revoked;
	IF NOT FOUND THEN
		RETURN json_build_object(
			'httpStatus', 403,
			'status', 'INVALID_FRIENDSHIP_CODE',
			'message', format('Frienship code of %L is invalid.', p_friendship_code)
		);
	END IF;

	-- Connect users as friends
	INSERT INTO friends (user1_id, user2_id)
	VALUES (MIN(v_user_id, v_user_to_befriend_id), MAX(v_user_id, v_user_to_befriend_id))
	ON CONFLICT (user1_id, user2_id) DO NOTHING;
	IF NOT FOUND THEN
		RETURN json_build_object(
			'httpStatus', 200,
			'status', 'SUCCESS',
			'message', 'Users are already friends.'
		);
	ELSE
		RETURN json_build_object(
			'httpStatus', 200,
			'status', 'SUCCESS',
			'message', 'Friendship established.'
		);
	END IF;

END;
$function$
LANGUAGE plpgsql;


/*
Retrieves all friends of a user.

PARAMS:
	* p_user_login TEXT
	
RETURNS:
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 404/USER_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api.get_friends(
	p_user_login TEXT
)
RETURNS JSONB
AS
$function$
DECLARE 
	v_user_id INT;
	v_friends JSONB;
BEGIN
	-- If user_id is NULL or user does not exist, error
	IF p_user_login IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', 'p_user_login')
		);	
	END IF;

	-- Fetch user ID. If there is no match for p_user_login, error
	SELECT id INTO v_user_id FROM users WHERE login = p_user_login;
	IF NOT FOUND THEN
		RETURN json_build_object(
			'httpStatus', 404,
			'status', 'USER_NOT_FOUND', 
			'message', 'User does not exist.'
		);	
	END IF;

	-- Find friends and create JSON list
	SELECT json_agg(to_json(fl)) FROM (
		SELECT login FROM users u
		INNER JOIN friends f ON u.id IN (f.user1_id, f.user2_id)
		WHERE login != p_user_login AND v_user_id IN (F.user1_id, f.user2_id)
	) AS fl(login)
	INTO v_friends;

	RETURN json_build_object(
		'friends', v_friends,
		'httpStatus', 200,
		'status', 'SUCCESS',
		'message', 'Successfully retrieved friends.'
	);
END;
$function$
LANGUAGE plpgsql;


-- ==Chatrooms
/*
Adds users to a chatroom. Meant to be called on behalf of one user, who has to be
in the chat in order to add others.

PARAMS:
	* p_user_login — the login of the user who will be added to the chatroom
	* p_user_logins — the logins of the users who will be added
	* p_chatroom_id — the ID of the chatroom

RETURNS:
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 403/NOT_IN_CHATROOM
		* 404/USER_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api.add_users_to_chatroom(
	p_user_login TEXT,
	p_user_logins TEXT[],
	p_chatroom_id INT

)
RETURNS JSONB
AS
$function$
DECLARE
	v_user_id INT;
	v_added TEXT[];
	v_skipped TEXT[];
	v_not_found TEXT[];
BEGIN
	-- If p_user_login is null, error
	IF p_user_login IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400, 
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_user_login')
		);
	END IF;

	-- If p_chatroom is null, error
	IF p_chatroom_id IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400, 
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_chatroom_id')
		);	
	END IF;

	-- If login does not exist, error
	-- If it does, fetch the ID of the user to v_user_id
	SELECT id INTO v_user_id FROM users WHERE login = p_user_login;
	IF NOT FOUND THEN
		RETURN json_build_object(
			'httpStatus', 404, 
			'status', 'USER_NOT_FOUND',
			'message', format('User with login of %L does not exist.', p_user_login)
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

	-- If user is not in chatroom, error
	SELECT 1 FROM users u 
	INNER JOIN chatrooms_users cu ON cu.user_id = u.id
	WHERE cu.chatroom_id = p_chatroom_id AND u.login = p_user_login;
	IF NOT FOUND THEN
		RETURN json_build_object(
			'httpStatus', 403, 
			'status', 'NOT_IN_CHATROOM',
			'message', 'User does not belong to the chatroom'
		);	
	END IF;


	-- Gather the user IDs among those to be added that actually exist
	-- and put them in a CTE
	WITH valid AS (
		SELECT login
		FROM UNNEST(p_user_logins) as logins_to_add(login)
		INNER JOIN users u ON u.login = logins_to_add.login
		INNER JOIN friends f ON u.id IN (f.user1_id, f.user2_id) 
			AND v_user_id IN (f.user1_id, f.user2_id)
	),
	-- Try to add those users to the chatroom
	-- and put those who were successfully added in a CTE
	inserted AS (
		INSERT INTO chatrooms_users (chatroom_id, user_id)
		SELECT p_chatroom_id, id FROM (
			SELECT id, login FROM valid v 
			INNER JOIN users u ON u.login = v.login
		)
		ON CONFLICT DO NOTHING
		RETURNING login
	)
	-- Now use the CTEs to fill arrays that will later be featured in the functions return value
	SELECT 
		-- Store users who were auccessfully added in an array
		(SELECT array_agg(inserted.login)), 
		-- Store those who exist but were not added in another array
		(SELECT array_agg(valid.login) FILTER (WHERE valid.login NOT IN (SELECT inserted.login FROM inserted))),
		-- Store the ones that do not exist in a separate one
		(
			SELECT array_agg(login) FILTER (WHERE id NOT IN (SELECT valid.login FROM valid) )
			FROM UNNEST(p_user_logins) AS logins_to_add(login)
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
	* p_user_login — the login of the user creating the chat
	* p_name — the name of the chatroom.

RETURNS:
	* chatroomId — ID of the added chatroom
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 404/USER_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api.create_chatroom(
	p_user_login TEXT,
	p_name TEXT
)
RETURNS JSONB
AS
$function$
DECLARE
	v_chatroom_id INT;
	v_chatroom_name TEXT;
	v_user_id INT;
BEGIN
	-- If p_user_login is null, error
	IF p_user_login IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400, 
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_user_login')
		);
	END IF;

	-- If p_name is null, error
	IF p_name IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400, 
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_name')
		);	
	END IF;

	-- If login does not exist, error
	-- If it does, fetch the ID of the user to v_user_id
	SELECT id INTO v_user_id FROM users WHERE login = p_user_login;
	IF NOT FOUND THEN
		RETURN json_build_object(
			'httpStatus', 404, 
			'status', 'USER_NOT_FOUND',
			'message', format('User with login of %L does not exist.', p_user_login)
		);
	END IF;
	
	-- Create chatroom
	INSERT INTO chatrooms (name) VALUES (p_name)
	RETURNING id, name INTO v_chatroom_id, v_chatroom_name;
	-- Add user to chatroom
	INSERT INTO chatrooms_users (chatroom_id, user_id) VALUES (v_chatroom_id, v_user_id);
	-- Return result
	RETURN json_build_object(
		'chatroomId', v_chatroom_id,
		'httpStatus', 200,
		'status', 'SUCCESS',
		'message', 'chatroom created'
	);
END;
$function$
LANGUAGE plpgsql;

/*
Finds all chatrooms the given user is in.

PARAMS:
	* p_user_id
	* p_after INT — may be NULL, in that case an old date is used.

RETURNS:
	* connectedChatrooms {id INT, name TEXT}[]
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 404/USER_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api.get_connected_chatrooms(
	p_user_login TEXT,
	p_after TIMESTAMPTZ
)
RETURNS JSONB
AS
$function$
DECLARE
	v_after TIMESTAMPTZ;
	v_connected_chatrooms JSONB;
BEGIN
	-- If p_user_login is null, error
	IF p_user_login IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', 'p_user_login')
		);
	END IF;

	-- If p_after is null, initialize v_after with old date.
	-- Otherwise, initialize it with p_after
	IF p_after IS NULL THEN
		SELECT '2000-01-01 00:00:00+00' INTO v_after;
	ELSE
		SELECT p_after INTO v_after;
	END IF;
		
	-- If user does not exist, error
	IF NOT EXISTS(SELECT 1 FROM users u WHERE u.id = p_user_login) THEN
		RETURN json_build_object(
			'httpStatus', 404,
			'status', 'USER_NOT_FOUND', 
			'message', format('User with login of %L does not exist.', p_user_login)
		);
	END IF;

	-- Gather chatrooms connected to the given user
	SELECT json_agg(row_to_json(connected_chatrooms)) 
	FROM (
		SELECT c.id, c.name
		FROM chatrooms c
		INNER JOIN chatrooms_users cu ON cu.chatroom_id = c.id
		INNER JOIN users u ON u.id = cu.user_id
		WHERE c.created_at >= v_after AND u.login = p_user_login
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

	ELSIF NOT EXISTS (SELECT 1 FROM chatrooms WHERE id = p_chatroom_id) THEN
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
Returns all messages from a chatroom, on behalf of a given user.

PARAMS:
	* p_user_login
	* p_chatroom_id
	* p_before TIMESTAMPTZ — may be NULL, in that case an old date is used.
	* p_after TIMESTAMPTZ — may be NULL — then CURRENT_TIMESTAMP is used.
	* p_n_rows INT
	* p_descending BOOL — if NULL, this is initialized to FALSE.

RETURNS:
	* conversation: {userId INT, userLogin, content TEXT}[]
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 404/CHATROOM_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api.get_conversation(
	p_user_login TEXT,
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
	-- If p_user_login or p_chatroom_id is null, error
	IF p_chatroom_id IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', 'p_user_login')
		);
	ELSIF p_chatroom_id IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', 'p_chatroom_id')
		);
	END IF;

	-- If p_n_rows is null, error
	IF p_n_rows IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', 'p_n_rows')
		);
	END IF;

	-- If p_descending is null, error
	IF p_descending IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', 'p_descending')
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

	-- If user is not in the chatroom, error
	SELECT 1 FROM users u
	INNER JOIN chatrooms_users cu ON cu.user_id = u.id
	INNER JOIN chatrooms c ON c.id = cu.chatroom_id
	WHERE u.login = p_user_login;
	IF NOT FOUND THEN
		RETURN json_build_object(
			'httpStatus', 403,
			'status', 'NOT_IN_CHATROOM', 
			'message', format('User with login of %L is not in the chatroom.', p_user_id)
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

