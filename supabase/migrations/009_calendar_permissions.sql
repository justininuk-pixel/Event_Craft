-- Grant table-level read/write permissions on public.calendar_events
GRANT ALL PRIVILEGES ON TABLE public.calendar_events TO postgres, anon, authenticated, service_role;

-- Grant table-level read/write permissions on public.saved_themes
GRANT ALL PRIVILEGES ON TABLE public.saved_themes TO postgres, anon, authenticated, service_role;

-- Grant table-level read/write permissions on public.card_collaborators
GRANT ALL PRIVILEGES ON TABLE public.card_collaborators TO postgres, anon, authenticated, service_role;

-- Grant table-level read/write permissions on public.card_comments
GRANT ALL PRIVILEGES ON TABLE public.card_comments TO postgres, anon, authenticated, service_role;
