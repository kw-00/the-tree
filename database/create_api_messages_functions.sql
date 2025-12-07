CREATE SCHEMA IF NOT EXISTS api_messages;


/*
Creates a message from a user in a chatroom.

PARAMS:
	* p_user_id INT
	* p_chatroom_id INT
	* p_content TEXT
	
RETURNS:
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 403/NOT_IN_CHATROOM
		* 404/USER_NOT_FOUND
		* 404/CHATROOM_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api_messages.create_message(
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
		RETURN api_utility.null_parameter_response('p_user_id');
	ELSIF p_chatroom_id IS NULL THEN
		RETURN api_utility.null_parameter_response('p_chatroom_id');	
	ELSIF p_content IS NULL THEN
		RETURN api_utility.null_parameter_response('p_c0ntent');
	END IF;
	
	-- If user or chatroom does not exist, error
	IF NOT api_utility.user_exists(p_user_id) THEN
		RETURN api_utility.user_not_found_response(p_user_id);
	ELSIF NOT api_utility.chatroom_exists(p_chatroom_id) THEN
		RETURN api_utility.chatroom_not_found_response(p_chatroom_id);
	END IF;

	-- If user does not belong to the chatroom, error
	IF NOT EXISTS (
		SELECT 1 FROM users u
		INNER JOIN chatrooms_users cu ON cu.user_id = u.id
		WHERE cu.chatroom_id = p_chatroom_id AND u.id = p_user_id
	) THEN
		RETURN json_build_object(
			'httpStatus', 403, 
			'status', 'NOT_IN_CHATROOM',
			'message', format('User with ID of %L is not in the chatroom.', p_user_id)
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
	* p_user_id INT
	* p_chatroom_id INT
	* p_before TIMESTAMPTZ | NULL — may be NULL, in that case an old date is used.
	* p_after TIMESTAMPTZ  NULL — may be NULL — then CURRENT_TIMESTAMP is used.
	* p_n_rows INT
	* p_descending BOOL

RETURNS:
	* conversation: {userId INT, userLogin TEXT, content TEXT}[]
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 404/CHATROOM_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api_messages.get_conversation(
	p_user_id INT,
	p_chatroom_id INT,
	p_before TIMESTAMPTZ,
	p_after TIMESTAMPTZ,
	p_n_rows INT,
	p_descending BOOL
)
RETURNS JSONB
AS
$function$
DECLARE
	v_conversation JSONB;
BEGIN
	-- If p_user_id or p_chatroom_id is null, error
	IF p_user_id IS NULL THEN
		RETURN api_utility.null_parameter_response('p_user_id');
	ELSIF p_chatroom_id IS NULL THEN
		RETURN api_utility.null_parameter_response('p_chatroom_id');
	END IF;

	-- If chatroom does not exist, error
	IF NOT api_utility.chatroom_exists(p_chatroom_id) THEN
		RETURN api_utility.chatroom_not_found_response(p_chatroom_id);
	END IF;

	-- If user is not in the chatroom, error
	IF NOT EXISTS (
		SELECT 1 FROM users u
		INNER JOIN chatrooms_users cu ON cu.user_id = u.id
		INNER JOIN chatrooms c ON c.id = cu.chatroom_id
		WHERE u.id = p_user_id
	) THEN
		RETURN json_build_object(
			'httpStatus', 403,
			'status', 'NOT_IN_CHATROOM', 
			'message', format('User with ID of %L is not in the chatroom.', p_user_id)
		);
	END IF;

	-- Return json — success
	SELECT json_agg(
		json_build_object(
			'userId', userId,
			'userLogin', userLogin,
			'content', content
		)
	) FROM (
		SELECT u.id, u.login, m.content
		FROM messages m
		INNER JOIN users u ON u.id = m.user_id
		WHERE m.chatroom_id = p_chatroom_id
			AND (p_before IS NULL OR m.created_at < p_before)
			AND (p_after IS NULL OR m.created_at > p_after)
		ORDER BY
			CASE WHEN p_descending THEN m.created_at END DESC,
			m.created_at ASC
		FETCH FIRST p_n_rows ROWS ONLY
	) AS messages(userId, userLogin, content)
	INTO v_conversation;
	RETURN json_build_object(
		'conversation', COALESCE(v_conversation, '[]'::JSONB),
		'httpStatus', 200,
		'status', 'SUCCESS', 
		'message', 'Successfully retrieved conversation.'
	);
END;
$function$
LANGUAGE plpgsql;

