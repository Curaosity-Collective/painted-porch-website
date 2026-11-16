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
  RETURN jsonb_build_object('queues', jsonb_build_array(
    jsonb_build_object('queue','auth_emails','dlq','auth_emails_dlq','messages',a),
    jsonb_build_object('queue','transactional_emails','dlq','transactional_emails_dlq','messages',t)),
    'checked_at', now());
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.admin_email_dlq_list(integer) FROM PUBLIC, anon;