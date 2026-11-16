CREATE OR REPLACE FUNCTION public.admin_email_reset_stuck(_queue text, _msg_id bigint, _action text DEFAULT 'release'::text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pgmq'
AS $function$
DECLARE payload jsonb; new_id bigint;
BEGIN
  IF NOT public.is_admin_or_editor(auth.uid()) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF _queue NOT IN ('auth_emails', 'transactional_emails') THEN RAISE EXCEPTION 'Invalid queue'; END IF;
  IF _action = 'release' THEN
    PERFORM pgmq.set_vt(_queue, _msg_id, 0);
    RETURN jsonb_build_object('ok', true, 'action', 'released');
  ELSIF _action = 'move_to_dlq' THEN
    IF _queue = 'auth_emails' THEN
      SELECT message INTO payload FROM pgmq.q_auth_emails WHERE msg_id = _msg_id;
    ELSE
      SELECT message INTO payload FROM pgmq.q_transactional_emails WHERE msg_id = _msg_id;
    END IF;
    IF payload IS NULL THEN RAISE EXCEPTION 'Message not found'; END IF;
    SELECT pgmq.send(_queue || '_dlq', payload || jsonb_build_object('manually_dlq_at', now())) INTO new_id;
    PERFORM pgmq.delete(_queue, _msg_id);
    RETURN jsonb_build_object('ok', true, 'action', 'moved_to_dlq', 'dlq_msg_id', new_id);
  ELSE
    RAISE EXCEPTION 'Invalid action';
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_email_requeue_dlq(_queue text, _msg_id bigint)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pgmq'
AS $function$
DECLARE payload jsonb; new_id bigint;
BEGIN
  IF NOT public.is_admin_or_editor(auth.uid()) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF _queue NOT IN ('auth_emails', 'transactional_emails') THEN RAISE EXCEPTION 'Invalid queue'; END IF;
  IF _queue = 'auth_emails' THEN
    SELECT message INTO payload FROM pgmq.q_auth_emails_dlq WHERE msg_id = _msg_id;
  ELSE
    SELECT message INTO payload FROM pgmq.q_transactional_emails_dlq WHERE msg_id = _msg_id;
  END IF;
  IF payload IS NULL THEN RAISE EXCEPTION 'Message not found in DLQ'; END IF;
  payload := payload || jsonb_build_object('requeued_at', now());
  SELECT pgmq.send(_queue, payload) INTO new_id;
  PERFORM pgmq.delete(_queue || '_dlq', _msg_id);
  RETURN jsonb_build_object('ok', true, 'new_msg_id', new_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_email_requeue_dlq_batch(_queue text, _msg_ids bigint[])
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pgmq'
AS $function$
DECLARE m bigint; payload jsonb; new_id bigint; requeued_count integer := 0; not_found_count integer := 0;
BEGIN
  IF NOT public.is_admin_or_editor(auth.uid()) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF _queue NOT IN ('auth_emails', 'transactional_emails') THEN RAISE EXCEPTION 'Invalid queue'; END IF;
  IF _msg_ids IS NULL OR array_length(_msg_ids, 1) IS NULL THEN
    RETURN jsonb_build_object('ok', true, 'requeued', 0, 'not_found', 0);
  END IF;
  FOREACH m IN ARRAY _msg_ids LOOP
    payload := NULL;
    IF _queue = 'auth_emails' THEN
      SELECT message INTO payload FROM pgmq.q_auth_emails_dlq WHERE msg_id = m;
    ELSE
      SELECT message INTO payload FROM pgmq.q_transactional_emails_dlq WHERE msg_id = m;
    END IF;
    IF payload IS NULL THEN not_found_count := not_found_count + 1; CONTINUE; END IF;
    payload := payload || jsonb_build_object('requeued_at', now());
    SELECT pgmq.send(_queue, payload) INTO new_id;
    PERFORM pgmq.delete(_queue || '_dlq', m);
    requeued_count := requeued_count + 1;
  END LOOP;
  RETURN jsonb_build_object('ok', true, 'requeued', requeued_count, 'not_found', not_found_count);
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_email_purge_dlq(_queue text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pgmq'
AS $function$
DECLARE removed integer := 0;
BEGIN
  IF NOT public.is_admin_or_editor(auth.uid()) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF _queue NOT IN ('auth_emails', 'transactional_emails') THEN RAISE EXCEPTION 'Invalid queue'; END IF;
  IF _queue = 'auth_emails' THEN
    SELECT count(*) INTO removed FROM pgmq.q_auth_emails_dlq;
  ELSE
    SELECT count(*) INTO removed FROM pgmq.q_transactional_emails_dlq;
  END IF;
  PERFORM pgmq.purge_queue(_queue || '_dlq');
  RETURN jsonb_build_object('ok', true, 'removed', removed);
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_email_dlq_list(_limit integer DEFAULT 50)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pgmq'
AS $function$
DECLARE lim integer := GREATEST(LEAST(_limit, 200), 1); a jsonb; t jsonb;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  SELECT COALESCE(jsonb_agg(jsonb_build_object('msg_id', msg_id, 'enqueued_at', enqueued_at, 'read_ct', read_ct,
    'recipient', message->>'to', 'template', COALESCE(message->>'template', message->>'template_name'),
    'subject', message->>'subject', 'message', message) ORDER BY enqueued_at DESC), '[]'::jsonb)
    INTO a FROM (SELECT * FROM pgmq.q_auth_emails_dlq ORDER BY enqueued_at DESC LIMIT lim) s;
  SELECT COALESCE(jsonb_agg(jsonb_build_object('msg_id', msg_id, 'enqueued_at', enqueued_at, 'read_ct', read_ct,
    'recipient', message->>'to', 'template', COALESCE(message->>'template', message->>'template_name'),
    'subject', message->>'subject', 'message', message) ORDER BY enqueued_at DESC), '[]'::jsonb)
    INTO t FROM (SELECT * FROM pgmq.q_transactional_emails_dlq ORDER BY enqueued_at DESC LIMIT lim) s;
  RETURN jsonb_build_object('queues',
    jsonb_build_object('queue','auth_emails','dlq','auth_emails_dlq','messages',a)
    || jsonb_build_object('queue','transactional_emails','dlq','transactional_emails_dlq','messages',t),
    'checked_at', now());
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_email_queue_health()
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pgmq'
AS $function$
DECLARE
  result jsonb := '[]'::jsonb; q text; pending_count bigint; dlq_count bigint;
  oldest_pending timestamptz; oldest_dlq timestamptz; last_err record;
  auth_templates text[] := ARRAY['auth_emails','invite','recovery','magic_link','signup',
    'email_change','email_change_current','email_change_new','reauthentication'];
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  FOR q IN SELECT unnest(ARRAY['auth_emails', 'transactional_emails']) LOOP
    IF q = 'auth_emails' THEN
      SELECT count(*), min(enqueued_at) INTO pending_count, oldest_pending FROM pgmq.q_auth_emails;
      SELECT count(*), min(enqueued_at) INTO dlq_count, oldest_dlq FROM pgmq.q_auth_emails_dlq;
    ELSE
      SELECT count(*), min(enqueued_at) INTO pending_count, oldest_pending FROM pgmq.q_transactional_emails;
      SELECT count(*), min(enqueued_at) INTO dlq_count, oldest_dlq FROM pgmq.q_transactional_emails_dlq;
    END IF;
    SELECT l.recipient_email, l.template_name, l.error_message, l.status, l.created_at INTO last_err
      FROM public.email_send_log l
      WHERE l.status IN ('failed', 'dlq', 'bounced')
        AND ((q = 'auth_emails' AND l.template_name = ANY(auth_templates))
          OR (q = 'transactional_emails' AND NOT (l.template_name = ANY(auth_templates))))
      ORDER BY l.created_at DESC LIMIT 1;
    result := result || jsonb_build_object('queue', q, 'pending', pending_count, 'dlq', dlq_count,
      'oldest_pending', oldest_pending, 'oldest_dlq', oldest_dlq,
      'last_error', CASE WHEN last_err.error_message IS NOT NULL THEN jsonb_build_object(
        'recipient', last_err.recipient_email, 'template', last_err.template_name,
        'status', last_err.status, 'error', last_err.error_message, 'at', last_err.created_at) ELSE NULL END);
  END LOOP;
  RETURN jsonb_build_object('queues', result, 'checked_at', now());
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_email_queue_messages(_queue text DEFAULT NULL::text, _kind text DEFAULT 'all'::text, _limit integer DEFAULT 100)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pgmq'
AS $function$
DECLARE
  result jsonb := '[]'::jsonb; q text; k text; queues text[]; kinds text[]; tbl text; rows jsonb;
  state_row record; lim integer := GREATEST(LEAST(_limit, 500), 1);
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  SELECT auth_email_ttl_minutes, transactional_email_ttl_minutes, max_attempts
    INTO state_row FROM public.email_send_state WHERE id = 1;
  IF _queue IS NULL OR _queue = 'all' THEN queues := ARRAY['auth_emails', 'transactional_emails'];
  ELSIF _queue IN ('auth_emails', 'transactional_emails') THEN queues := ARRAY[_queue];
  ELSE queues := ARRAY[]::text[]; END IF;
  IF _kind = 'active' THEN kinds := ARRAY['active'];
  ELSIF _kind = 'dlq' THEN kinds := ARRAY['dlq'];
  ELSE kinds := ARRAY['active', 'dlq']; END IF;
  FOREACH q IN ARRAY queues LOOP
    FOREACH k IN ARRAY kinds LOOP
      tbl := CASE WHEN k = 'active' THEN 'q_' || q ELSE 'q_' || q || '_dlq' END;
      SELECT COALESCE(jsonb_agg(jsonb_build_object('msg_id', s.msg_id, 'enqueued_at', s.enqueued_at, 'vt', s.vt,
        'read_ct', s.read_ct, 'recipient', s.message->>'to',
        'template', COALESCE(s.message->>'template', s.message->>'template_name'),
        'subject', s.message->>'subject', 'message', s.message) ORDER BY s.enqueued_at DESC), '[]'::jsonb)
      INTO rows FROM (
        SELECT * FROM (
          SELECT 'q_auth_emails' AS t, x.msg_id, x.enqueued_at, x.vt, x.read_ct, x.message FROM pgmq.q_auth_emails x
          UNION ALL SELECT 'q_auth_emails_dlq', x.msg_id, x.enqueued_at, x.vt, x.read_ct, x.message FROM pgmq.q_auth_emails_dlq x
          UNION ALL SELECT 'q_transactional_emails', x.msg_id, x.enqueued_at, x.vt, x.read_ct, x.message FROM pgmq.q_transactional_emails x
          UNION ALL SELECT 'q_transactional_emails_dlq', x.msg_id, x.enqueued_at, x.vt, x.read_ct, x.message FROM pgmq.q_transactional_emails_dlq x
        ) u WHERE u.t = tbl ORDER BY u.enqueued_at DESC LIMIT lim
      ) s;
      result := result || jsonb_build_array(jsonb_build_object('queue', q, 'kind', k, 'table', tbl, 'messages', rows));
    END LOOP;
  END LOOP;
  RETURN jsonb_build_object('queues', result,
    'auth_email_ttl_minutes', state_row.auth_email_ttl_minutes,
    'transactional_email_ttl_minutes', state_row.transactional_email_ttl_minutes,
    'max_attempts', state_row.max_attempts, 'checked_at', now());
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.admin_email_reset_stuck(text, bigint, text), public.admin_email_requeue_dlq(text, bigint),
  public.admin_email_requeue_dlq_batch(text, bigint[]), public.admin_email_purge_dlq(text), public.admin_email_dlq_list(integer),
  public.admin_email_queue_health(), public.admin_email_queue_messages(text, text, integer) FROM PUBLIC, anon;