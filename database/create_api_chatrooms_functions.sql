CREATE SCHEMA IF NOT EXISTS api_chatrooms;

/*
Adds users to a chatroom. Meant to be called on behalf of one user, who has to be
in the chat in order to add others.

PARAMS:
	* p_user_id INT — the ID of the user who will be added to the chatroom.
	* p_friend_ids INT[] — the IDs of the users who will be added.
	* p_chatroom_id INT — the ID of the chatroom.

RETURNS:
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 403/NOT_IN_CHATROOM
		* 404/USER_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api_chatrooms.add_friends_to_chatroom(
	p_user_id INT,
	p_friend_ids INT[],
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
	-- If p_user_id is null, error
	IF p_user_id IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400, 
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_user_id')
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

	-- If p_user_id does not exist, error
	IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id) THEN
		RETURN json_build_object(
			'httpStatus', 404, 
			'status', 'USER_NOT_FOUND',
			'message', format('User with ID of %L does not exist.', p_user_id)
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
	IF NOT EXISTS (
		SELECT 1 FROM users u 
		INNER JOIN chatrooms_users cu ON cu.user_id = u.id
		WHERE cu.chatroom_id = p_chatroom_id AND u.id = p_user_id
	) THEN
		RETURN json_build_object(
			'httpStatus', 403, 
			'status', 'NOT_IN_CHATROOM',
			'message', format('User with ID of %L does not belong to the chatroom.', p_user_id)
		);	
	END IF;


	-- Gather the user IDs among those to be added that actually exist
	-- and put them in a CTE
	WITH valid AS (
		SELECT id
		FROM UNNEST(p_friend_ids) as ids_to_add(id)
		INNER JOIN users u ON u.id = ids_to_add.id
		INNER JOIN friends f ON u.id IN (f.user1_id, f.user2_id) 
			AND p_user_id IN (f.user1_id, f.user2_id)
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
			FROM UNNEST(p_friend_ids) AS ids_to_add(id)
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
Creates a chatroom on behalf of a user and places that user inside.

PARAMS:
	* p_user_id INT — the login of the user creating the chat.
	* p_chatroom_name TEXT — the name of the chatroom.

RETURNS:
	* chatroomId — ID of the added chatroom
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 404/USER_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api_chatrooms.create_chatroom(
	p_user_id INT,
	p_chatroom_name TEXT
)
RETURNS JSONB
AS
$function$
DECLARE
	v_chatroom_id INT;
	v_chatroom_name TEXT;
BEGIN
	-- If p_user_id is null, error
	IF p_user_id IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400, 
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_user_id')
		);
	END IF;

	-- If p_chatroom_name is null, error
	IF p_chatroom_name IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400, 
			'status', 'NULL_PARAMETER',
			'message', format('Parameter %L cannot be NULL.', 'p_chatroom_name')
		);	
	END IF;

	-- If ID does not exist, error
	IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id) THEN
		RETURN json_build_object(
			'httpStatus', 404, 
			'status', 'USER_NOT_FOUND',
			'message', format('User with ID of %L does not exist.', p_user_id)
		);
	END IF;
	
	-- Create chatroom
	INSERT INTO chatrooms (name) VALUES (p_chatroom_name)
	RETURNING id, name INTO v_chatroom_id, v_chatroom_name;
	-- Add user to chatroom
	INSERT INTO chatrooms_users (chatroom_id, user_id) VALUES (v_chatroom_id, p_user_id);
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
	* p_user_id INT
	* p_after TIMESTAMPTZ | NULL — may be NULL, in that case an old date is used.

RETURNS:
	* connectedChatrooms {id INT, name TEXT}[]
	* httpStatus/status:
		* 200/SUCCESS
		* 400/NULL_PARAMETER
		* 404/USER_NOT_FOUND
*/
CREATE OR REPLACE FUNCTION api_chatrooms.get_connected_chatrooms(
	p_user_id INT,
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
	IF p_user_id IS NULL THEN
		RETURN json_build_object(
			'httpStatus', 400,
			'status', 'NULL_PARAMETER', 
			'message', format('Parameter %L cannot be NULL.', 'p_user_id')
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
	IF NOT EXISTS(SELECT 1 FROM users WHERE id = p_user_id) THEN
		RETURN json_build_object(
			'httpStatus', 404,
			'status', 'USER_NOT_FOUND', 
			'message', format('User with ID of %L does not exist.', p_user_id)
		);
	END IF;

	-- Gather chatrooms connected to the given user
	SELECT json_agg(
		json_build_object(
			'id', id,
			'name', name
		)
	) 
	FROM (
		SELECT c.id, c.name
		FROM chatrooms c
		INNER JOIN chatrooms_users cu ON cu.chatroom_id = c.id
		INNER JOIN users u ON u.id = cu.user_id
		WHERE c.created_at >= v_after AND u.id = p_user_id
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