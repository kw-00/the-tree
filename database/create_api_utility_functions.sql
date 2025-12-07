CREATE SCHEMA IF NOT EXISTS api_utility;


CREATE OR REPLACE FUNCTION api_utility.null_parameter_response(
    p_name TEXT
)
RETURNS JSONB
AS
$function$
BEGIN
    RETURN json_build_object(
        'httpStatus', 400,
        'status', 'NULL_PARAMETER', 
        'message', format('Parameter %L cannot be NULL.', p_name)
    );
END;
$function$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION api_utility.record_exists(
    p_id INT,
    p_id_column TEXT,
    p_table_name TEXT
)
RETURNS BOOL
AS
$function$
DECLARE
    v_result BOOL;
BEGIN
    EXECUTE format('SELECT EXISTS (SELECT 1 FROM %I WHERE %I = $1)', p_table_name, p_id_column)
    INTO v_result
    USING p_id;
    RETURN v_result;
END;
$function$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION api_utility.user_exists(
    p_id INT
)
RETURNS BOOL
AS
$function$
BEGIN
    RETURN api_utility.record_exists(p_id, 'id', 'users');
END;
$function$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION api_utility.chatroom_exists(
    p_id INT
)
RETURNS BOOL
AS
$function$
BEGIN
    RETURN api_utility.record_exists(p_id, 'id', 'chatrooms');
END    
$function$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION api_utility.user_not_found_response(
    p_id INT
)
RETURNS JSONB
AS
$function$
BEGIN
    RETURN json_build_object(
        'httpStatus', 404,
        'status', 'USER_NOT_FOUND',
        'message', format('User with ID of %L does not exist.', p_id)
    );
END    
$function$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION api_utility.chatroom_not_found_response(
    p_id INT
)
RETURNS JSONB
AS
$function$
BEGIN
    RETURN json_build_object(
        'httpStatus', 404,
        'status', 'CHATROOM_NOT_FOUND',
        'message', format('Chatroom with ID of %L does not exist.', p_id)
    );
END    
$function$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION api_utility.pk_in_use_response()
RETURNS JSONB
AS
$function$
BEGIN
    RETURN json_build_object(
        'httpStatus', 409,
        'status', 'PK_IN_USE',
        'message', 'Primary key already in use.'
    );
END    
$function$
LANGUAGE plpgsql;
