-- Migration for Event Craft Collaboration Features

-- Collaborators table for editor collaboration
CREATE TABLE IF NOT EXISTS public.card_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id TEXT NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(card_id, user_id)
);

-- Comments table for editor collaboration
CREATE TABLE IF NOT EXISTS public.card_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id TEXT NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    x_percent NUMERIC NOT NULL,
    y_percent NUMERIC NOT NULL,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Realtime publication for comments and collaborators
ALTER PUBLICATION supabase_realtime ADD TABLE public.card_collaborators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.card_comments;

-- RLS Policies for Collaborators
ALTER TABLE public.card_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collaborators on their cards"
    ON public.card_collaborators FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.cards
            WHERE cards.id = card_collaborators.card_id
            AND (cards.user_id = auth.uid()::text OR card_collaborators.user_id = auth.uid())
        )
    );

CREATE POLICY "Card owners can manage collaborators"
    ON public.card_collaborators FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.cards
            WHERE cards.id = card_collaborators.card_id
            AND cards.user_id = auth.uid()::text
        )
    );

-- RLS Policies for Comments
ALTER TABLE public.card_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on their cards" 
    ON public.card_comments FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.cards 
            WHERE cards.id = card_comments.card_id 
            AND cards.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Collaborators can view comments" 
    ON public.card_comments FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.card_collaborators 
            WHERE card_collaborators.card_id = card_comments.card_id 
            AND card_collaborators.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert comments" 
    ON public.card_comments FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
    ON public.card_comments FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
    ON public.card_comments FOR DELETE 
    USING (auth.uid() = user_id);

-- Note: Live cursors use Supabase Realtime Broadcast / Presence, 
-- which does not require additional database tables, just client-side channels!
