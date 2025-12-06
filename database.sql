CREATE OR REPLACE FUNCTION public.admin_courses_add(
	in_title character varying,
	in_price numeric,
	in_description character varying,
	in_is_free boolean,
	in_instructor character varying,
	in_original_price numeric,
	in_badge character varying,
	in_category character varying)
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
  new_id TEXT;
BEGIN
  new_id := generate_table_id('CRS', 'seq_courses');

  INSERT INTO courses(id,title,price,description,is_free,instructor,original_price,badge,category)
  VALUES(new_id,in_title,in_price,in_description,in_is_free,in_instructor,in_original_price,in_badge,in_category);

  RETURN new_id;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.admin_courses_get_modules_by_course(
	in_course_id character varying)
    RETURNS TABLE(module_id character varying, title character varying, module_position integer, create_at timestamp without time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
    RETURN QUERY
    SELECT
        id,
        module_title as title,
        position AS module_position,
        created_at AS create_at
    FROM course_modules
    WHERE course_id = in_course_id
    ORDER BY position;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.admin_courses_get_videos_by_module(
	in_module_id character varying)
    RETURNS TABLE(video_id character varying, title character varying, url text, video_duration integer, video_description text, videos_position integer, create_at timestamp without time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
    RETURN QUERY
    SELECT
        id AS video_id,
        video_title AS title,
        video_url AS url,
        duration AS video_duration,
        description AS video_description,   -- FIXED
        position AS videos_position,
        created_at AS create_at
    FROM videos
    WHERE module_id = in_module_id
    ORDER BY position;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.admin_courses_insert_course(
	in_title character varying,
	in_price numeric,
	in_description character varying,
	in_is_free boolean,
	in_instructor character varying,
	in_original_price numeric,
	in_badge character varying,
	in_category character varying,
	in_thumbnail_url character varying)
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
  new_id character varying;
BEGIN
   new_id := generate_table_id('CRS', 'seq_courses');
   
   INSERT INTO courses(
        id, title, price, description, is_free, 
        instructor, original_price, badge, category, 
        thumbnail_url, created_at, updated_at
    )
    VALUES (
        new_id, in_title, in_price, in_description, in_is_free,
        in_instructor, in_original_price, in_badge, in_category,
        in_thumbnail_url, NOW(), NOW()
    );
		
    RETURN new_id;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.admin_courses_insert_modules(
	p_course_id text,
	p_module_title text,
	p_position integer)
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
  new_id text;
BEGIN
   new_id := generate_table_id('MOD', 'seq_modules');
   
   INSERT INTO course_modules(
        id, course_id, module_title, position, created_at, updated_at
   )
   VALUES (
        new_id,        -- use generated id
        p_course_id,
        p_module_title,
        p_position,
        NOW(),
        NOW()
   );
		
   RETURN new_id;

END;
$BODY$;

CREATE OR REPLACE FUNCTION public.admin_courses_insert_videos(
	in_module_id character varying,
	in_title character varying,
	in_url character varying,
	in_duration integer,
	in_description character varying,
	in_position integer)
    RETURNS character varying
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
  new_id text;
BEGIN
   new_id := generate_table_id('VID', 'seq_videos');
   
        INSERT INTO videos(
            id, module_id, video_title, video_url, duration, 
            description, position ,created_at, updated_at
        )
        VALUES (
            new_id, in_module_id, in_title, in_url, in_duration,
            in_description, in_position, NOW(), NOW()
        );
		
      RETURN new_id;

END;
$BODY$;

CREATE OR REPLACE FUNCTION public.admin_courses_select_all(
	)
    RETURNS TABLE(id character varying, title character varying, price numeric, description text, is_free boolean, instructor character varying, original_price numeric, badge character varying, category character varying, thumbnail_url character varying, created_at timestamp without time zone, updated_at timestamp without time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.title,
        c.price,
        c.description,
        c.is_free,
        c.instructor,
        c.original_price,
        c.badge,
        c.category,
        c.thumbnail_url,
        c.created_at,
        c.updated_at
    FROM courses c
    ORDER BY c.created_at DESC;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.admin_courses_update_module(
	in_id text,
	in_module_title text,
	in_position integer)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
   updated_rows integer;
BEGIN
    UPDATE course_modules
    SET 
        module_title = in_module_title,
        position      = in_position,
        updated_at    = NOW()
    WHERE id = in_id;

    -- IMPORTANT: Get how many rows were updated
    GET DIAGNOSTICS updated_rows = ROW_COUNT;

    IF updated_rows = 1 THEN
        RETURN TRUE;  -- updated successfully
    ELSE
        RETURN FALSE; -- module not found / not updated
    END IF;
END;
$BODY$;


CREATE OR REPLACE FUNCTION public.admin_courses_update_videos(
	in_id character varying,
	in_title character varying,
	in_url text,
	in_duration integer,
	in_description text,
	in_position integer)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    updated_count INT;
BEGIN
    UPDATE videos
    SET 
        video_title = in_title,
        video_url   = in_url,
        duration    = in_duration,
        description = in_description,
        position    = in_position,
        updated_at  = NOW()
    WHERE id = in_id;

    GET DIAGNOSTICS updated_count = ROW_COUNT;

    IF updated_count > 0 THEN
        RETURN TRUE;   -- Video updated
    ELSE
        RETURN FALSE;  -- No video found with given ID
    END IF;
END;
$BODY$;


CREATE OR REPLACE FUNCTION public.admin_courses_updation_course(
	in_id character varying,
	in_title character varying,
	in_price numeric,
	in_description character varying,
	in_is_free boolean,
	in_instructor character varying,
	in_original_price numeric,
	in_badge character varying,
	in_category character varying,
	in_thumbnail_url character varying)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
   updated_rows integer;
BEGIN
    UPDATE courses
    SET 
        title = in_title,
        price = in_price,
        description = in_description,
        is_free = in_is_free,
        instructor = in_instructor,
        original_price = in_original_price,
        badge = in_badge,
        category = in_category,
        thumbnail_url = in_thumbnail_url,
        updated_at = NOW()
    WHERE id = in_id
    RETURNING 1 INTO updated_rows;

    IF updated_rows = 1 THEN
        RETURN TRUE;  -- updated successfully
    ELSE
        RETURN FALSE; -- course not found
    END IF;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.admin_dashboard_count(
	)
    RETURNS json
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    result JSON;

    total_students INT;
    total_courses INT;
    total_modules INT;
    total_videos INT;

    most_purchase_course_name VARCHAR;
    most_purchase_course_price NUMERIC;
    most_purchase_course_user_count INT;
    avg_purchase_price NUMERIC;

    total_free_courses INT;
    total_paid_courses INT;

    total_free_purchase INT;
    total_paid_purchase INT;

BEGIN
    -- 1. Total Students
    SELECT COUNT(*) INTO total_students FROM users;

    -- 2. Total Courses
    SELECT COUNT(*) INTO total_courses FROM courses;

    -- 3. Total Modules
    SELECT COUNT(*) INTO total_modules FROM course_modules;

    -- 4. Total Videos
    SELECT COUNT(*) INTO total_videos FROM videos;

    -- 5. Most Purchased Course (using orders table)
    SELECT 
        c.title,
        c.price,
        COUNT(od.user_id) AS user_count
    INTO 
        most_purchase_course_name,
        most_purchase_course_price,
        most_purchase_course_user_count
    FROM orders od
    JOIN courses c ON od.course_id = c.id
    WHERE od.status = 'success'
    GROUP BY c.id
    ORDER BY COUNT(od.user_id) DESC
    LIMIT 1;

    -- 6. Average purchase price (paid only)
    SELECT 
        COALESCE(AVG(od.amount), 0)
    INTO avg_purchase_price
    FROM orders od
    JOIN courses c ON od.course_id = c.id
    WHERE c.is_free = false
    AND od.status = 'success';

    -- 7. Total free + paid courses
    SELECT
        COUNT(*) FILTER (WHERE is_free = true),
        COUNT(*) FILTER (WHERE is_free = false)
    INTO total_free_courses, total_paid_courses
    FROM courses;

-- 8. Total free-course purchases & paid-course purchases
    SELECT 
        COUNT(*) FILTER (WHERE c.is_free = true),
        COUNT(*) FILTER (WHERE c.is_free = false)
    INTO 
		total_free_purchase,
		total_paid_purchase
    FROM user_courses uc
    JOIN courses c ON uc.course_id = c.id;

    -- Build JSON Output
    result := json_build_object(
        'total_students', total_students,
        'total_courses', total_courses,
        'total_modules', total_modules,
        'total_videos', total_videos,

        'most_purchased_course', json_build_object(
            'name', most_purchase_course_name,
            'price', most_purchase_course_price,
            'purchase_user_count', most_purchase_course_user_count
        ),

        'average_purchase_price', avg_purchase_price,
        'total_free_courses', total_free_courses,
        'total_paid_courses', total_paid_courses,
        'total_free_course_purchases', total_free_purchase,
        'total_paid_course_purchases', total_paid_purchase
    );

    RETURN result;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.admin_login_get_password_by_mobile_no(
	in_mobile_no bigint,
	OUT password text)
    RETURNS SETOF text 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
DECLARE SQL varchar;
DECLARE user_row record;

BEGIN
	--SELECT * FROM login_get_password_by_mobile_no(9033302459);
	
	SQL= 'SELECT password from admins where mobile= $1';
     EXECUTE SQL INTO user_row USING in_mobile_no;
	
     IF user_row IS NULL THEN
		RAISE EXCEPTION 'Wrong Mobile Number.' USING ERRCODE='22222';
     END IF;

     RETURN  QUERY EXECUTE 'select (' || quote_literal(user_row.password) || ')::text as password';
      
END;
$BODY$;


CREATE OR REPLACE FUNCTION public.admin_login_get_password_by_mobile_no(
	in_mobile_no character varying,
	OUT password text)
    RETURNS SETOF text 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
DECLARE SQL varchar;
DECLARE user_row record;

BEGIN
	--SELECT * FROM login_get_password_by_mobile_no(955899328);
	
	SQL= 'SELECT password from admins where mobile= $1';
     EXECUTE SQL INTO user_row USING in_mobile_no;
	
     IF user_row IS NULL THEN
		RAISE EXCEPTION 'Wrong Mobile Number.' USING ERRCODE='22222';
     END IF;

     RETURN  QUERY EXECUTE 'select (' || quote_literal(user_row.password) || ')::text as password';
      
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.admin_login_get_user_by_mobile_no(
	in_mobile_no character varying,
	OUT id integer,
	OUT name character varying,
	OUT mobile character varying,
	OUT email character varying)
    RETURNS SETOF record 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
DECLARE SQL varchar;
 row_count integer;
BEGIN
	--SELECT * FROM login_get_user_by_mobile_no(9033302459)
		
	SQL= 'SELECT id,name,mobile,email
			FROM admins 
		 	WHERE mobile=$1';
	
     RETURN  QUERY EXECUTE SQL USING in_mobile_no;

	 				-- check how many rows were returned
    GET DIAGNOSTICS row_count = ROW_COUNT;

    IF row_count = 0 THEN
        RAISE EXCEPTION 'No records found for the given filters.' USING ERRCODE='22222';
    END IF;
	
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.admin_products_delete(
	in_id character varying)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
BEGIN
    DELETE FROM products
    WHERE id = in_id;

    IF NOT FOUND THEN
        RETURN FALSE; -- No row deleted
    END IF;

    RETURN TRUE; -- Successfully deleted
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.admin_products_get_all(
	in_limit integer DEFAULT 20,
	in_offset integer DEFAULT 0)
    RETURNS TABLE(id character varying, title character varying, slug character varying, description text, category character varying, sub_category character varying, price numeric, discount_price numeric, is_free boolean, thumbnail_url text, language character varying, created_at timestamp with time zone, updated_at timestamp with time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.slug,
        p.description,
        p.category,
        p.sub_category,
        p.price,
        p.discount_price,
        p.is_free,
        p.thumbnail_url,
        p.language,
        p.created_at,
        p.updated_at
    FROM products p
    ORDER BY p.created_at DESC
    LIMIT in_limit
    OFFSET in_offset;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.admin_products_insert(
	in_title character varying,
	in_slug character varying,
	in_description text,
	in_category character varying,
	in_sub_category character varying,
	in_price numeric,
	in_discount_price numeric,
	in_is_free boolean,
	in_thumbnail_url text,
	in_language character varying)
    RETURNS character varying
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    new_id character varying;
BEGIN
    new_id := generate_table_id('PRO','seq_products');

    INSERT INTO products (
        id, title, slug, description, category, sub_category,
        price, discount_price, is_free,
        thumbnail_url, language
    )
    VALUES (
        new_id, in_title, in_slug, in_description, in_category, in_sub_category,
        in_price, in_discount_price, in_is_free,
        in_thumbnail_url, in_language
    );

    RETURN new_id;
END;
$BODY$;


CREATE OR REPLACE FUNCTION public.admin_products_update(
	in_id character varying,
	in_title character varying,
	in_slug character varying,
	in_description text,
	in_category character varying,
	in_sub_category character varying,
	in_price numeric,
	in_discount_price numeric,
	in_is_free boolean,
	in_thumbnail_url text,
	in_language character varying)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
BEGIN
    UPDATE products
    SET 
        title = in_title,
        slug = in_slug,
        description = in_description,
        category = in_category,
        sub_category = in_sub_category,
        price = in_price,
        discount_price = in_discount_price,
        is_free = in_is_free,
        thumbnail_url = in_thumbnail_url,
        language = in_language
    WHERE id = in_id;

    IF NOT FOUND THEN
        RETURN FALSE; -- No row updated
    END IF;

    RETURN TRUE; -- Successfully updated
END;
$BODY$;


CREATE OR REPLACE FUNCTION public.auth_user_login(
	_email_or_mobile character varying)
    RETURNS TABLE(id character varying, fullname character varying, email character varying, mobile character varying, image_url character varying, password character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.fullname,
        u.email,
        u.mobile,
        u.image_url,
        u.password    
    FROM users u
    WHERE 
        (u.email = _email_or_mobile OR u.mobile = _email_or_mobile);  -- secure password match

    -- If no records found → throw error
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid email/mobile or password';
    END IF;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.check_google_id(
	in_googleid character varying)
    RETURNS TABLE(id character varying, fullname character varying, email character varying, mobile character varying, google_id character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.fullname,
        u.email,
        u.mobile,
        u.google_id
    FROM users u
    WHERE u.google_id = in_googleid;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.check_user_exists(
	p_email character varying,
	p_mobile character varying)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    exists_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO exists_count
    FROM users
    WHERE email = p_email 
       OR mobile = p_mobile;

    IF exists_count > 0 THEN
        RETURN TRUE;   -- user exists
    ELSE
        RETURN FALSE;  -- user not exists
    END IF;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.fn_activate_user_course(
	_user_id text,
	_course_id text,
	_days integer)
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
  new_id TEXT;
BEGIN
  new_id := generate_table_id('UCR', 'seq_user_courses');

  INSERT INTO user_courses(id,user_id,course_id,access_start,access_end)
  VALUES(new_id,_user_id,_course_id,NOW(), NOW() + (_days || ' days')::interval);

  RETURN new_id;
END;
$BODY$;


CREATE OR REPLACE FUNCTION public.fn_add_course(
	_title text,
	_price numeric,
	_description text,
	_is_free boolean)
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
  new_id TEXT;
BEGIN
  new_id := generate_table_id('CRS', 'seq_courses');

  INSERT INTO courses(id,title,price,description,is_free)
  VALUES(new_id,_title,_price,_description,_is_free);

  RETURN new_id;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.fn_add_module(
	_course_id text,
	_module_title text)
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
  new_id TEXT;
BEGIN
  new_id := generate_table_id('MODS', 'seq_modules');

  INSERT INTO course_modules(id,course_id,module_title)
  VALUES(new_id,_course_id,_module_title);

  RETURN new_id;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.fn_add_video(
	_module_id text,
	_video_title text,
	_video_url text,
	_duration integer)
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
  new_id TEXT;
BEGIN
  new_id := generate_table_id('VID', 'seq_videos');

  INSERT INTO videos(id,module_id,video_title,video_url,duration)
  VALUES(new_id,_module_id,_video_title,_video_url,_duration);

  RETURN new_id;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.fn_create_order(
	in_user_id text,
	in_course_id text,
	in_amount numeric,
	in_payment_id character varying)
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
  new_id TEXT;
BEGIN
  new_id := generate_table_id('ORD', 'seq_orders');

  INSERT INTO orders(id,user_id,course_id,amount,status,payment_id)
  VALUES(new_id,in_user_id,in_course_id,in_amount,status,in_payment_id);

  RETURN new_id;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.fn_purchase_course(
	_user_id character varying,
	_course_id character varying,
	_payment_status character varying)
    RETURNS character varying
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    v_course_price NUMERIC;
    v_is_free BOOLEAN;
    v_existing_end TIMESTAMP;
    v_order_id CHARACTER VARYING;
    v_user_course_id CHARACTER VARYING;
BEGIN
    -- Get course info
    SELECT price, is_free
    INTO v_course_price, v_is_free
    FROM courses
    WHERE id = _course_id;

    IF v_course_price IS NULL THEN
        RETURN 'Course not found';
    END IF;

    -- Check existing access
    SELECT access_end
    INTO v_existing_end
    FROM user_courses
    WHERE user_id = _user_id
      AND course_id = _course_id
    ORDER BY access_end DESC
    LIMIT 1;

    -- Rule 4: Already active, don't allow repurchase
    IF v_existing_end IS NOT NULL AND v_existing_end > NOW() THEN
        RETURN 'You already have access to this course until ' || v_existing_end;
    END IF;

    -----------------------------------------------------------------
    -- CASE 1: FREE COURSE (auto access)
    -----------------------------------------------------------------
    IF v_is_free = TRUE THEN
        v_order_id := 'ORD' || LPAD(nextval('seq_orders')::CHARACTER VARYING, 6, '0');

        INSERT INTO orders(id, user_id, course_id, amount, status)
        VALUES (v_order_id, _user_id, _course_id, 0, 'success');

        v_user_course_id := 'UCR' || LPAD(nextval('seq_user_courses')::CHARACTER VARYING, 6, '0');

        INSERT INTO user_courses(id, user_id, course_id, access_start, access_end)
        VALUES (
            v_user_course_id,
            _user_id,
            _course_id,
            NOW(),
            NOW() + INTERVAL '365 days'
        );

        RETURN 'Free course access granted';
    END IF;

    -----------------------------------------------------------------
    -- CASE 2: PAID COURSE
    -----------------------------------------------------------------

    -- Create order
    v_order_id := 'ORD' || LPAD(nextval('seq_orders')::CHARACTER VARYING, 6, '0');

    INSERT INTO orders(id, user_id, course_id, amount, status)
    VALUES (
        v_order_id,
        _user_id,
        _course_id,
        v_course_price,
        _payment_status
    );

    -- If payment failed or pending → No access
    IF _payment_status <> 'success' THEN
        RETURN 'Order created but payment pending/failed';
    END IF;

    -- Payment success → Give access
    v_user_course_id := 'UCR' || LPAD(nextval('seq_user_courses')::CHARACTER VARYING, 6, '0');

    INSERT INTO user_courses(id, user_id, course_id, access_start, access_end)
    VALUES (
        v_user_course_id,
        _user_id,
        _course_id,
        NOW(),
        NOW() + INTERVAL '365 days'
    );

    RETURN 'Purchase successful. Access granted.';
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.fn_user_course_status(
	_user_id character varying)
    RETURNS TABLE(course_id character varying, title character varying, price numeric, instructor character varying, oldprice numeric, badge character varying, category character varying, is_free boolean, is_purchased boolean, order_status character varying, access_start timestamp without time zone, access_end timestamp without time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
    RETURN QUERY
    SELECT 
        c.id AS course_id,          -- 1
        c.title,                    -- 2
        c.price,                    -- 3
        c.instructor,               -- 4  ✔ CORRECT NOW
        c.original_price AS oldPrice,  -- 5
        c.badge,                    -- 6
        c.category,                 -- 7
        c.is_free,                  -- 8  ✔ moved here
        CASE 
            WHEN uc.id IS NOT NULL THEN TRUE
            ELSE FALSE
        END AS is_purchased,        -- 9
        COALESCE(o.status, 'not purchased') AS order_status, -- 10
        uc.access_start,            -- 11
        uc.access_end               -- 12
    FROM courses c

    LEFT JOIN LATERAL (
        SELECT *
        FROM orders
        WHERE orders.user_id = _user_id
          AND orders.course_id = c.id
        ORDER BY id DESC
        LIMIT 1
    ) o ON TRUE

    LEFT JOIN LATERAL (
        SELECT *
        FROM user_courses
        WHERE user_courses.user_id = _user_id
          AND user_courses.course_id = c.id
        ORDER BY access_end DESC
        LIMIT 1
    ) uc ON TRUE

    ORDER BY c.id;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.generate_stu_id_text(
	)
    RETURNS character varying
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    seq_num BIGINT;
BEGIN
    seq_num := nextval('users_id_seq');
    RETURN 'STU' || LPAD(seq_num::text, 6, '0');
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.generate_table_id(
	prefix text,
	seq_name text)
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
  new_id TEXT;
  seq_val INT;
BEGIN
  EXECUTE 'SELECT nextval(''' || seq_name || ''')' INTO seq_val;
  new_id := prefix || LPAD(seq_val::text, 6, '0');
  RETURN new_id;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.get_user_data(
	in_id character varying)
    RETURNS TABLE(id character varying, fullname character varying, email character varying, mobile character varying, created_at timestamp with time zone, google_id character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
    RETURN QUERY
    SELECT u.id, u.fullname, u.email, u.mobile, u.created_at, u.google_id
    FROM users u
    WHERE u.id = in_id
    ORDER BY u.created_at DESC;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.insert_password(
	in_password character varying,
	in_user_id character varying)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    user_exists BOOLEAN;
BEGIN
    -- check if user exists
    SELECT EXISTS(
        SELECT 1 FROM users WHERE id = in_user_id
    ) INTO user_exists;

    IF user_exists THEN
        -- update password
        UPDATE users 
        SET password = in_password
        WHERE id = in_user_id;

        RETURN TRUE;  -- password updated
    ELSE
        RETURN FALSE; -- user not found
    END IF;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.insert_user(
	in_fullname character varying,
	in_email character varying,
	in_mobile character varying,
	in_password character varying,
	in_google_id character varying)
    RETURNS TABLE(user_id character varying, user_name text, user_email text, user_mobile text, user_crated_at timestamp with time zone, user_google_id character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
  

    -- Insert user with generated ID
    INSERT INTO users(id, fullname, email, mobile, password,google_id)
    VALUES (generate_stu_id_text(), in_fullname, in_email, in_mobile, in_password,in_google_id)
    RETURNING 
        id,
        fullname,
        email,
        mobile,
        created_at,
		google_id
    INTO 
        user_id,
        user_name,
        user_email,
        user_mobile,
        user_crated_at,
		user_google_id;

    RETURN NEXT;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.student_course_purchase_status(
	in_user_id character varying)
    RETURNS TABLE(id character varying, title character varying, price numeric, description text, is_free boolean, instructor character varying, original_price numeric, badge character varying, category character varying, thumbnail_url character varying, order_status character varying, access_start timestamp without time zone, access_end timestamp without time zone, is_access_active boolean) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        c.price,
        c.description,
        c.is_free,
        c.instructor,
        c.original_price,
        c.badge,
        c.category,
        c.thumbnail_url,

        COALESCE(o.status, 'not purchased') AS order_status,
        uc.access_start,
        uc.access_end,

        (uc.access_end > NOW()) AS is_access_active
        
    FROM user_courses uc
    INNER JOIN courses c ON c.id = uc.course_id
    
    LEFT JOIN LATERAL (
        SELECT *
        FROM orders
        WHERE user_id = in_user_id
          AND course_id = c.id
        ORDER BY id DESC
        LIMIT 1
    ) o ON TRUE

    WHERE uc.user_id = in_user_id   -- ONLY purchased courses
    ORDER BY uc.access_end DESC;

END;
$BODY$;

CREATE OR REPLACE FUNCTION public.student_course_status(
	in_user_id character varying)
    RETURNS TABLE(id character varying, title character varying, price numeric, description text, is_free boolean, instructor character varying, original_price numeric, badge character varying, category character varying, thumbnail_url character varying, is_purchased boolean, order_status character varying, access_start timestamp without time zone, access_end timestamp without time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
    RETURN QUERY
    SELECT 
        c.id ,          -- 1
        c.title,                    -- 2
        c.price, 
		c.description,
		c.is_free,
        c.instructor,               -- 4  ✔ CORRECT NOW
        c.original_price ,  -- 5
        c.badge,                    -- 6
        c.category,                 -- 7
        c.thumbnail_url,                -- 8  ✔ moved here
        CASE 
            WHEN uc.id IS NOT NULL THEN TRUE
            ELSE FALSE
        END AS is_purchased,        -- 9
        COALESCE(o.status, 'not purchased') AS order_status, -- 10
        uc.access_start,            -- 11
        uc.access_end               -- 12
    FROM courses c

    LEFT JOIN LATERAL (
        SELECT *
        FROM orders
        WHERE orders.user_id = in_user_id
          AND orders.course_id = c.id
        ORDER BY id DESC
        LIMIT 1
    ) o ON TRUE

    LEFT JOIN LATERAL (
        SELECT *
        FROM user_courses
        WHERE user_courses.user_id = in_user_id
          AND user_courses.course_id = c.id
        ORDER BY access_end DESC
        LIMIT 1
    ) uc ON TRUE

    ORDER BY c.id;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.student_courses_base_module(
	in_user_id character varying,
	in_course_id character varying)
    RETURNS TABLE(module_id character varying, course_id character varying, module_title character varying, "position" integer, is_access_active boolean) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
DECLARE 
    v_access_end timestamp;
BEGIN
    -- Check purchased access (safe match)
    SELECT access_end
    INTO v_access_end
    FROM user_courses uc
    WHERE uc.user_id = in_user_id
      AND TRIM(LOWER(uc.course_id)) = TRIM(LOWER(in_course_id))
    ORDER BY uc.access_end DESC
    LIMIT 1;

    -- Active access
    IF v_access_end IS NOT NULL AND v_access_end > NOW() THEN
        RETURN QUERY
        SELECT 
            m.id,
            m.course_id,
            m.module_title,
            m.position,
            TRUE
        FROM course_modules m
        WHERE TRIM(LOWER(m.course_id)) = TRIM(LOWER(in_course_id))
        ORDER BY m.position;

        RETURN;
    END IF;

    -- Not purchased or expired
    RETURN QUERY
    SELECT 
        m.id,
        m.course_id,
        m.module_title,
        m.position,
        FALSE
    FROM course_modules m
    WHERE TRIM(LOWER(m.course_id)) = TRIM(LOWER(in_course_id))
    ORDER BY m.position;

END;
$BODY$;

CREATE OR REPLACE FUNCTION public.student_purchase_course(
	in_user_id character varying,
	in_course_id character varying,
	in_payment_id character varying,
	in_payment_status character varying)
    RETURNS character varying
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    v_course_price NUMERIC;
    v_is_free BOOLEAN;
    v_course_time INTEGER;
    v_existing_end TIMESTAMP;
    v_order_id CHARACTER VARYING;
    v_user_course_id CHARACTER VARYING;
    v_access_end TIMESTAMP;
BEGIN
    -- Fetch course info (price, free, course_time)
    SELECT price, is_free, course_time
    INTO v_course_price, v_is_free, v_course_time
    FROM courses
    WHERE id = in_course_id;

    IF v_course_price IS NULL THEN
        RETURN 'Course not found';
    END IF;

    -----------------------------------------------------------------
    -- CALCULATE ACCESS END BASED ON course_time
    -----------------------------------------------------------------
    IF v_course_time = 0 THEN
        -- Lifetime access
        v_access_end := NOW() + INTERVAL '100 years';
    ELSE
        -- Convert months into interval
        v_access_end := NOW() + (v_course_time || ' months')::INTERVAL;
    END IF;

    -----------------------------------------------------------------
    -- CHECK IF USER ALREADY HAS ACTIVE ACCESS
    -----------------------------------------------------------------
    SELECT access_end
    INTO v_existing_end
    FROM user_courses
    WHERE user_id = in_user_id
      AND course_id = in_course_id
    ORDER BY access_end DESC
    LIMIT 1;

    IF v_existing_end IS NOT NULL AND v_existing_end > NOW() THEN
        RETURN 'You already have access until ' || v_existing_end;
    END IF;

    -----------------------------------------------------------------
    -- CASE 1: FREE COURSE
    -----------------------------------------------------------------
    IF v_is_free = TRUE THEN
        v_user_course_id := generate_table_id('UCR', 'seq_user_courses');

        INSERT INTO user_courses(id, user_id, course_id, access_start, access_end)
        VALUES (
            v_user_course_id,
            in_user_id,
            in_course_id,
            NOW(),
            v_access_end
        );

        RETURN 'Free course access granted';
    END IF;

    -----------------------------------------------------------------
    -- CASE 2: PAID COURSE – Insert into orders
    -----------------------------------------------------------------
    v_order_id := generate_table_id('ORD', 'seq_orders');

    INSERT INTO orders(id, user_id, course_id, payment_id, amount, status)
    VALUES (
        v_order_id,
        in_user_id,
        in_course_id,
        in_payment_id,
        v_course_price,
        in_payment_status
    );

    -- If not paid → stop access
    IF in_payment_status <> 'paid' THEN
        RETURN 'Order created, payment pending or failed';
    END IF;

    -----------------------------------------------------------------
    -- Payment success → give course access
    -----------------------------------------------------------------
    v_user_course_id := generate_table_id('UCR', 'seq_user_courses');

    INSERT INTO user_courses(id, user_id, course_id, access_start, access_end)
    VALUES (
        v_user_course_id,
        in_user_id,
        in_course_id,
        NOW(),
        v_access_end
    );

    RETURN 'Purchase successful and access granted until ' || v_access_end;
END;
$BODY$;


CREATE OR REPLACE FUNCTION public.user_password_status(
	in_user_id character varying)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    result BOOLEAN;
BEGIN
    SELECT (password IS NOT NULL)
    INTO result
    FROM users
    WHERE id = in_user_id;

    RETURN result;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.user_purchase_course(
	in_user_id character varying,
	in_course_id character varying,
	in_payment_id character varying,
	in_payment_status character varying)
    RETURNS character varying
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    v_course_price NUMERIC;
    v_is_free BOOLEAN;
    v_existing_end TIMESTAMP;
    v_order_id CHARACTER VARYING;
    v_user_course_id CHARACTER VARYING;
BEGIN
    -- Fetch course info
    SELECT price, is_free
    INTO v_course_price, v_is_free
    FROM courses
    WHERE id = in_course_id;

    IF v_course_price IS NULL THEN
        RETURN 'Course not found';
    END IF;

    -- If user already has active access, block repurchase
    SELECT access_end
    INTO v_existing_end
    FROM user_courses
    WHERE user_id = in_user_id
      AND course_id = in_course_id
    ORDER BY access_end DESC
    LIMIT 1;

    IF v_existing_end IS NOT NULL AND v_existing_end > NOW() THEN
        RETURN 'You already have access until ' || v_existing_end;
    END IF;

    -----------------------------------------------------------------
    -- CASE 1: FREE COURSE → Only insert into user_courses
    -----------------------------------------------------------------
    IF v_is_free = TRUE THEN
        -- v_user_course_id := 'UCR' || LPAD(nextval('seq_user_courses')::VARCHAR, 6, '0');
         v_user_course_id  := generate_table_id('UCR', 'seq_user_courses');
		 
        INSERT INTO user_courses(id, user_id, course_id, access_start, access_end)
        VALUES (
            v_user_course_id,
            in_user_id,
            in_course_id,
            NOW(),
            NOW() + INTERVAL '365 days'
        );

        RETURN 'Free course access granted';
    END IF;

    -----------------------------------------------------------------
    -- CASE 2: PAID COURSE → Insert in orders ALWAYS
    -----------------------------------------------------------------
    -- v_order_id := 'ORD' || LPAD(nextval('seq_orders')::VARCHAR, 6, '0');
        v_order_id  := generate_table_id('ORD', 'seq_orders');
		
    INSERT INTO orders(id, user_id, course_id, payment_id, amount, status)
    VALUES (
        v_order_id,
        in_user_id,
        in_course_id,
        in_payment_id,
        v_course_price,
        in_payment_status
    );

    -- If payment failed or pending → DO NOT give access
    IF in_payment_status <> 'paid' THEN
        RETURN 'Order created, payment pending or failed';
    END IF;

    -----------------------------------------------------------------
    -- Payment success → insert into user_courses
    -----------------------------------------------------------------
    -- v_user_course_id := 'UCR' || LPAD(nextval('seq_user_courses')::VARCHAR, 6, '0');
      v_user_course_id  := generate_table_id('UCR', 'seq_user_courses');
	  
    INSERT INTO user_courses(id, user_id, course_id, access_start, access_end)
    VALUES (
        v_user_course_id,
        in_user_id,
        in_course_id,
        NOW(),
        NOW() + INTERVAL '365 days'
    );

    RETURN 'Purchase successful and access granted';
END;
$BODY$;

----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins
(
    id integer NOT NULL DEFAULT nextval('admins_id_seq'::regclass),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    email character varying COLLATE pg_catalog."default" NOT NULL,
    mobile character varying COLLATE pg_catalog."default" NOT NULL,
    password character varying COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT admins_pkey PRIMARY KEY (id),
    CONSTRAINT admins_email_key UNIQUE (name),
    CONSTRAINT admins_mobile_key UNIQUE (email)
)

CREATE TABLE IF NOT EXISTS public.course_modules
(
    id character varying(20) COLLATE pg_catalog."default" NOT NULL,
    course_id character varying(20) COLLATE pg_catalog."default",
    module_title character varying(255) COLLATE pg_catalog."default",
    "position" integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    CONSTRAINT course_modules_pkey PRIMARY KEY (id)
)

CREATE TABLE IF NOT EXISTS public.courses
(
    id character varying(20) COLLATE pg_catalog."default" NOT NULL,
    title character varying(255) COLLATE pg_catalog."default",
    price numeric(10,2),
    description text COLLATE pg_catalog."default",
    is_free boolean,
    instructor character varying COLLATE pg_catalog."default",
    original_price numeric(10,2),
    badge character varying COLLATE pg_catalog."default",
    category character varying COLLATE pg_catalog."default",
    thumbnail_url character varying COLLATE pg_catalog."default",
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    course_time integer DEFAULT 12,
    CONSTRAINT courses_pkey PRIMARY KEY (id)
)

CREATE TABLE IF NOT EXISTS public.orders
(
    id character varying(20) COLLATE pg_catalog."default" NOT NULL,
    user_id character varying(20) COLLATE pg_catalog."default",
    course_id character varying(20) COLLATE pg_catalog."default",
    amount numeric(10,2),
    status character varying(20) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT now(),
    payment_id character varying COLLATE pg_catalog."default",
)

CREATE TABLE IF NOT EXISTS public.products
(
    id character varying(20) COLLATE pg_catalog."default" NOT NULL,
    title character varying COLLATE pg_catalog."default",
    slug character varying COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    category character varying COLLATE pg_catalog."default",
    sub_category character varying COLLATE pg_catalog."default",
    price numeric(10,2),
    discount_price numeric(10,2),
    is_free boolean DEFAULT false,
    thumbnail_url text COLLATE pg_catalog."default",
    language character varying COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'::text),
    updated_at timestamp with time zone DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'::text),
    CONSTRAINT products_pkey PRIMARY KEY (id)
)

CREATE TABLE IF NOT EXISTS public.total_students
(
    count bigint
)


CREATE TABLE IF NOT EXISTS public.user_courses
(
    id character varying(20) COLLATE pg_catalog."default" NOT NULL,
    user_id character varying(20) COLLATE pg_catalog."default",
    course_id character varying(20) COLLATE pg_catalog."default",
    access_start timestamp without time zone,
    access_end timestamp without time zone,
    CONSTRAINT user_courses_pkey PRIMARY KEY (id),
    CONSTRAINT user_courses_user_id_course_id_key UNIQUE (user_id, course_id)
)

CREATE TABLE IF NOT EXISTS public.users
(
    id character varying(20) COLLATE pg_catalog."default" NOT NULL,
    fullname character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default",
    mobile character varying(30) COLLATE pg_catalog."default",
    password character varying(255) COLLATE pg_catalog."default",
    image_url character varying(255) COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()),
    google_id character varying(255) COLLATE pg_catalog."default",
    provider character varying(50) COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_mobile_key UNIQUE (mobile)
)

CREATE TABLE IF NOT EXISTS public.videos
(
    id character varying(20) COLLATE pg_catalog."default" NOT NULL,
    module_id character varying(20) COLLATE pg_catalog."default",
    video_title character varying(255) COLLATE pg_catalog."default",
    video_url text COLLATE pg_catalog."default",
    duration integer,
    description text COLLATE pg_catalog."default",
    "position" integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    CONSTRAINT videos_pkey PRIMARY KEY (id)
)

-----------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.admins_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

    CREATE SEQUENCE IF NOT EXISTS public.seq_courses
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

    CREATE SEQUENCE IF NOT EXISTS public.seq_modules
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

    CREATE SEQUENCE IF NOT EXISTS public.seq_orders
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

    CREATE SEQUENCE IF NOT EXISTS public.seq_products
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.seq_user_courses
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

    CREATE SEQUENCE IF NOT EXISTS public.seq_videos
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

    CREATE SEQUENCE IF NOT EXISTS public.users_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;


