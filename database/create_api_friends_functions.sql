CREATE SCHEMA IF NOT EXISTS api_friends;


/*
Creates a friendship code.

PARAMS:
	* p_user_id INT — the ID of the user for which the code will be created.
	* p_CODE — the code itself.
	* p_expirY_date TIMESTAMPTZ | NULL 
	
RETURNS:
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 404/USER_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api_friends.create_friendship_code(
	p_user_id INT,
	p_code TEXT,
	p_expiry_date TIMESTAMPTZ
)
RETURNS JSONB
AS
$function$
BEGIN
	-- If p_user_id or p_code is null, error
	IF p_user_id IS NULL THEN
		RETURN api_utility.null_parameter_response('p_user_id');
	ELSIF p_code IS NULL THEN
		RETURN api_utility.null_parameter_response('p_code');
	END IF;

	-- If user does not exist, error
	IF NOT api_utility.user_exists(p_user_id) THEN
		RETURN api_utility.user_not_found_response(p_user_id);
	END IF;

	INSERT INTO friendship_codes (user_id, code, expires_at)
	VALUES (p_user_id, p_code, p_expiry_date);
END;
$function$
LANGUAGE plpgsql;


/*
Returns friendship codes for given user.

PARAMS:
	* p_user_id INT — the ID of the user for which the code was be created.
	* p_after TIMESTAMPTZ | NULL
	
RETURNS:
	* frienshipCodes {userId INT, code TEXT, expiresAt TIMESTAMPTZ}[]
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 403/INVALID_FRIENDSHIP_CODE
		* 404/USER_NOT_FOUND
		* 409/BEFRIENDING_SELF
*/
CREATE OR REPLACE FUNCTION api_friends.get_friendship_codes(
	p_user_id INT,
	p_before TIMESTAMPTZ,
	p_after TIMESTAMPTZ,
	p_n_rows INT,
	p_descending BOOL
)
RETURNS JSONB
AS
$function$
DECLARE
	v_frienshipCodes JSONB;
BEGIN
	-- If any parameter is null, error
	IF p_user_id IS NULL THEN
		RETURN api_utility.null_parameter_response('p_user_id');
	END IF;


	IF NOT api_utility.user_exists(p_user_id) THEN
		RETURN api_utility.user_not_found_response(p_user_id);
	END IF;

	SELECT json_agg(
		json_build_object(
			'userId', user_id,
			'code', code,
			'expiresAt', expires_at
		)
	)
	INTO v_frienshipCodes
	FROM friendship_codes
	WHERE user_id = p_user_id 
		AND NOT revoked
		AND expires_at > now()
		AND (p_before IS NULL OR created_at < p_before)
		AND (p_after IS NULL OR created_at > p_after)
	ORDER BY
		CASE WHEN p_descending THEN created_at END DESC,
		created_at ASC
	LIMIT p_n_rows;

	RETURN json_build_object(
		'frienshipCodes', COALAESCE(v_frienshipCodes, '[]'::JSONB),
		'httpStatus', 200,
		'status', 'SUCCESS',
		'message', 'Successfully retrieved friendship codes.'
	);


END;
$function$
LANGUAGE plpgsql;


/*
Connects a user with another as friends.

PARAMS:
	* p_user_id INT — the ID of the user using a friendship code.
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
CREATE OR REPLACE FUNCTION api_friends.add_friend(
	p_user_id INT,
	p_user_to_befriend_login TEXT,
	p_friendship_code TEXT
)
RETURNS JSONB
AS
$function$
DECLARE
	v_user_to_befriend_id INT;
BEGIN
	-- If any parameter is null, error
	IF p_user_id IS NULL THEN
		RETURN api_utility.null_parameter_response('p_user_id');
	ELSIF p_user_to_befriend_login IS NULL THEN
		RETURN api_utility.null_parameter_response('p_user_to_befriend_login');
	ELSIF p_friendship_code IS NULL THEN
		RETURN api_utility.null_parameter_response('p_friendship_code');
	END IF;
	
	-- If either user does not exist, error
	IF NOT api_utility.user_exists(p_user_id) THEN
		RETURN user_not_found_response(p_user_id);
	END IF;
	SELECT id INTO v_user_to_befriend_id FROM users WHERE login = p_user_to_befriend_login;
	IF NOT FOUND THEN
		RETURN json_build_object(
			'httpStatus', 404,
			'status', 'USER_NOT_FOUND', 
			'message', format('User with login of %L does not exist.', p_user_to_befriend_login)
		);	
	END IF;

	IF p_user_id = v_user_to_befriend_id THEN
		RETURN json_build_object(
			'httpStatus', 409,
			'status', 'BEFRIENDING_SELF', 
			'message', 'User cannot befriend self.'
		);	
	END IF;

	-- Check friendship code, returning error if not valid for user_to_befriend
	IF NOT EXISTS(
		SELECT 1 FROM friendship_codes
		WHERE user_id = v_user_to_befriend_id 
			AND expires_at > CURRENT_TIMESTAMP 
			AND NOT revoked
	) THEN
		RETURN json_build_object(
			'httpStatus', 403,
			'status', 'INVALID_FRIENDSHIP_CODE',
			'message', format('Frienship code of %L is invalid.', p_friendship_code)
		);
	END IF;

	-- Connect users as friends
	INSERT INTO friends (user1_id, user2_id)
	VALUES (MIN(p_user_id, v_user_to_befriend_id), MAX(p_user_id, v_user_to_befriend_id))
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
	* friends {id INT, login TEXT}[]
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 404/USER_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api_friends.get_friends(
	p_user_id INT,
	p_before TIMESTAMPTZ,
	p_after TIMESTAMPTZ,
	p_n_rows INT,
	p_descending BOOL
)
RETURNS JSONB
AS
$function$
DECLARE 
	v_friends JSONB;
BEGIN
	-- If user_id is NULL or user does not exist, error
	IF p_user_id IS NULL THEN
		RETURN api_utility.null_parameter_response('p_user_id');
	END IF;

	-- If user does not exist, error
	IF NOT api_utility.user_exists(p_user_id) THEN
		RETURN api_utility.user_not_found_response(p_user_id);
	END IF;

	-- Find friends and create JSON list
	SELECT json_agg(to_json(fl)) FROM (
		SELECT u.id, u.login FROM users u
		INNER JOIN friends f ON u.id IN (f.user1_id, f.user2_id)
		WHERE u.id != p_user_id AND p_user_id IN (f.user1_id, f.user2_id)
			AND (p_before IS NULL OR f.created_at < p_before)
			AND (p_after IS NULL OR f.created_at > p_after)
		ORDER BY
			CASE WHEN p_descending THEN f.created_at END DESC,
			f.created_at ASC
		LIMIT p_n_rows
	) AS fl(id, login)
	INTO v_friends;

	RETURN json_build_object(
		'friends', COALESCE(v_friends, '[]'::JSONB),
		'httpStatus', 200,
		'status', 'SUCCESS',
		'message', 'Successfully retrieved friends.'
	);
END;
$function$
LANGUAGE plpgsql;
