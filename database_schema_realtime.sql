-- Enhanced database schema for real-time functionality
-- Run this in your Supabase SQL editor

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category TEXT DEFAULT 'general',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    reported_by UUID REFERENCES auth.users(id),
    assigned_to UUID REFERENCES auth.users(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community messages table (enhanced)
CREATE TABLE IF NOT EXISTS public.community_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    type TEXT DEFAULT 'message' CHECK (type IN ('message', 'help_request', 'progress_report', 'system')),
    is_urgent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User presence tracking
CREATE TABLE IF NOT EXISTS public.user_presence (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task completion photos
CREATE TABLE IF NOT EXISTS public.task_completion_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task chat messages
CREATE TABLE IF NOT EXISTS public.task_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completion_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Users can view all tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Users can update assigned tasks" ON public.tasks FOR UPDATE USING (assigned_to = auth.uid());
CREATE POLICY "Admins can manage all tasks" ON public.tasks FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'supervisor')
    )
);

-- RLS Policies for community messages
CREATE POLICY "Users can view community messages" ON public.community_messages FOR SELECT USING (true);
CREATE POLICY "Users can send community messages" ON public.community_messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- RLS Policies for user presence
CREATE POLICY "Users can view all presence" ON public.user_presence FOR SELECT USING (true);
CREATE POLICY "Users can update own presence" ON public.user_presence FOR ALL USING (user_id = auth.uid());

-- RLS Policies for task completion photos
CREATE POLICY "Users can view task photos" ON public.task_completion_photos FOR SELECT USING (true);
CREATE POLICY "Users can upload photos for assigned tasks" ON public.task_completion_photos FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.tasks 
        WHERE id = task_id 
        AND assigned_to = auth.uid()
    )
);

-- RLS Policies for task messages
CREATE POLICY "Users can view task messages" ON public.task_messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.tasks 
        WHERE id = task_id 
        AND (assigned_to = auth.uid() OR reported_by = auth.uid())
    )
);
CREATE POLICY "Users can send task messages" ON public.task_messages FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.tasks 
        WHERE id = task_id 
        AND (assigned_to = auth.uid() OR reported_by = auth.uid())
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_community_messages_created_at ON public.community_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_user_presence_is_online ON public.user_presence(is_online);
CREATE INDEX IF NOT EXISTS idx_task_messages_task_id ON public.task_messages(task_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_presence_updated_at BEFORE UPDATE ON public.user_presence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();