CREATE SCHEMA IF NOT EXISTS api_users;

/*
Registers a new user. Returns the ID of the newly registered user.

PARAMS:
	p_login TEXT
	p_password TEXT

RETURNS:
	* userId INT
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 409/LOGIN_IN_USE
*/
CREATE OR REPLACE FUNCTION api_users.register_user(
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
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', 'p_password')
		);
	END IF;

	-- Add a new user to the database
	INSERT INTO users (login, password) 
	VALUES (p_login, p_password)
	RETURNING id INTO v_user_id;

	RETURN json_build_object(
		'userId', v_user_id,
		'httpStatus', 200,
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
