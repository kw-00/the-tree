-- Error codes explained:
-- P1*** — conflict
-- P2*** — authentication
-- P3*** — authorization
-- P4*** — not found
-- P5*** — illegal argument

CREATE SCHEMA IF NOT EXISTS utils;
DROP TABLE utils.exceptions;
CREATE TABLE utils.exceptions (
	code TEXT NOT NULL,
	name TEXT NOT NULL UNIQUE,
	message TEXT NOT NULL,
	CONSTRAINT pk_exceptions PRIMARY KEY (code)
);

INSERT INTO utils.exceptions (code, name, message)
VALUES
('P1000', 'pk_in_use', 'Primary key of % is already in use.'),
('P1001', 'login_in_use', 'Login "%" is already in use.'),
('P2000', 'authentication_failed', 'Wrong username or password.'),
('P3000', 'authorization_failed', 'Authorization failed.'),
('P3001', 'refresh_token_expired', 'Refresh token has expired.'),
('P3002', 'refresh_token_reuse', 'Refresh token has already been used.'),
('P3003', 'refresh_token_revoked', 'Refresh token has been revoked.'),
('P4001', 'user_not_found', 'User with id of % does not exist.'),
('P4002', 'refresh_token_not_found', 'Refresh token with uuid of % does not exist.'),
('P5001', 'null_parameter', 'Parameter % cannot be null.');


CREATE OR REPLACE FUNCTION utils.raise_custom_exception(
	p_code TEXT,
	p_message_arguments ANYARRAY
)
RETURNS VOID
LANGUAGE plpgsql
AS
$function$
DECLARE
	v_message TEXT;
	v_i INT;
BEGIN
	PERFORM utils.null_check(p_message_arguments, 'p_message_arguments');
	SELECT message INTO v_message
		FROM utils.exceptions
		WHERE code = p_code
		LIMIT 1;
		
	IF NOT FOUND THEN
		RAISE EXCEPTION 'Exception code is not among registered custom exceptions. Check the "exceptions" table.';
	END IF;
	
	FOR v_i IN 1..array_length(p_message_arguments, 1) LOOP
		IF v_message NOT LIKE '%\%%' THEN
			EXIT;
		END IF;

		IF p_message_arguments[v_i] IS NULL THEN
			v_message := replace(v_message, '%', 'NULL');
		ELSE
			v_message := replace(v_message, '%', p_message_arguments[v_i]::TEXT);
		END IF;
	END LOOP;

	RAISE EXCEPTION USING 
		ERRCODE = p_code,
		MESSAGE = v_message;
END;
$function$;

CREATE OR REPLACE FUNCTION utils.raise_custom_exception(
	p_code TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS
$function$
DECLARE
	v_message TEXT;
	v_i INT;
BEGIN
	SELECT message INTO v_message
		FROM utils.exceptions
		WHERE code = p_code
		LIMIT 1;
		
	IF NOT FOUND THEN
		RAISE EXCEPTION 'Exception code is not among registered custom exceptions. Check the "exceptions" table.';
	END IF;

	RAISE EXCEPTION USING 
		ERRCODE = p_code,
		MESSAGE = v_message;
END;
$function$;


CREATE OR REPLACE FUNCTION utils.null_check(
	p_parameter_value ANYELEMENT,
	p_parameter_name TEXT
)
RETURNS VOID
AS
$function$
BEGIN
	IF p_parameter_value IS NULL THEN
		PERFORM utils.raise_custom_exception('P5001', ARRAY[p_parameter_name]);
	ELSIF p_parameter_name IS NULL THEN
		PERFORM utils.raise_custom_exception('P5001', ARRAY['p_parameter_name']);
	END IF;
END;
$function$
LANGUAGE plpgsql;
