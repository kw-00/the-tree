CREATE SCHEMA IF NOT EXISTS api_auth;

/*
PARAMS:
Authenticates a user. Returns the ID of the user if authentication is successful.

	* p_login TEXT
	* p_password TEXT
	
RETURNS:
	* userId INT
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 409/INVALID_CREDENTIALS
*/
CREATE OR REPLACE FUNCTION api_auth.authenticate_user(
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
		RETURN api_utility.null_parameter_response('p_login');
	ELSIF p_password IS NULL THEN
		RETURN api_utility.null_parameter_response('p_password');
	END IF;

	-- Look for user that matches the given credentials
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


-- ==Refresh_tokens
/*
Checks whether a refresh token is valid.

PARAMS:
	* p_refresh_token_uuid UUID

RETURNS:
	* userId INT
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 401/REFRESH_TOKEN_NOT_FOUND
		* 401/REFRESH_TOKEN_EXPIRED
		* 401/REFRESH_TOKEN_REUSE
		* 401/REFRESH_TOKEN_REVOKED
*/
CREATE OR REPLACE FUNCTION api_auth.verify_refresh_token(
	p_refresh_token_uuid UUID
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
		RETURN api_utility.null_parameter_response('p_refresh_token_uuid');
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
			'message', format('Refresh token not found.')
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
		PERFORM api_auth._revoke_tokens_for_user(v_user_id);
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
		'message', 'Refresh token is valid.'
	);
END;
$function$
LANGUAGE plpgsql;


/*
Creates and returns a new refresh token for a user.

PARAMS:
	* p_user_id INT
	* p_validity_period_seconds INT — the validity period of 
		the refresh token to be created, in seconds

RETURNS:
	* refreshToken UUID — the UUID of the newly created token
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 404/USER_NOT_FOUND
		* 409/PK_IN_USE
*/
CREATE OR REPLACE FUNCTION api_auth.create_refresh_token(
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
		RETURN api_utility.null_parameter_response('p_user_id');
	ELSIF p_validity_period_seconds IS NULL THEN
		RETURN api_utility.null_parameter_response('p_validity_period_seconds');
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
		RETURN api_utility.pk_in_use_response();
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
CREATE OR REPLACE FUNCTION api_auth.revoke_refresh_token(
	p_refresh_token_uuid UUID
)
RETURNS JSONB
AS
$function$
BEGIN
	-- Check whether p_refresh_token_uuid is not null
	IF p_refresh_token_uuid IS NULL THEN
		RETURN api_utility.null_parameter_response('p_refresh_token_uuid');
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
CREATE OR REPLACE FUNCTION api_auth._revoke_tokens_for_user(
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