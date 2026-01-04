-- Supabase Database Setup for Mindbody App

-- 1. Create Members Table
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('Active', 'Expired', 'Pending')) DEFAULT 'Active',
  total_sessions INTEGER DEFAULT 0,
  remaining_sessions INTEGER DEFAULT 0,
  last_visit TEXT DEFAULT '-',
  join_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Classes Table (Templates)
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  category TEXT CHECK (category IN ('Yoga', 'Pilates', 'HIIT', 'Strength')),
  color_theme TEXT, -- Tailwind classes like "bg-indigo-100 border-indigo-200 text-indigo-700"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Class Sessions Table (Actual instances on the calendar)
CREATE TABLE IF NOT EXISTS class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES class_sessions(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('Registered', 'Checked-in', 'No-show')) DEFAULT 'Registered',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, member_id)
);

-- 5. Seed Data
-- Insert mock members
INSERT INTO members (name, email, status, remaining_sessions, total_sessions, join_date, last_visit)
VALUES 
('Alex Chen', 'alex.chen@example.com', 'Active', 6, 10, '2023-10-12', '2024-01-02'),
('Emily Wilson', 'emily.w@example.com', 'Active', 2, 12, '2023-08-05', '2024-01-03'),
('James Rodriguez', 'james.r@demo.com', 'Expired', 0, 10, '2023-01-15', '2023-12-20');

-- Insert class templates
INSERT INTO classes (name, teacher_name, category, color_theme)
VALUES 
('Hatha Yoga Flow', 'Sarah J.', 'Yoga', 'bg-indigo-100 border-indigo-200 text-indigo-700'),
('Reformers Intro', 'Mike T.', 'Pilates', 'bg-emerald-100 border-emerald-200 text-emerald-700'),
('Power HIIT', 'Anna W.', 'HIIT', 'bg-orange-100 border-orange-200 text-orange-700');

-- Insert class sessions (assuming today is around 2024-01-04)
-- Note: You might need to adjust dates based on when you run this
INSERT INTO class_sessions (class_id, start_time, duration_minutes, capacity)
SELECT id, CURRENT_DATE + interval '8 hours', 60, 20 FROM classes WHERE name = 'Hatha Yoga Flow';

INSERT INTO class_sessions (class_id, start_time, duration_minutes, capacity)
SELECT id, CURRENT_DATE + interval '10 hours', 45, 10 FROM classes WHERE name = 'Reformers Intro';

-- Enable Row Level Security (RLS) - Basic public access for demo
-- In a real app, you would restrict this to authenticated users
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON members FOR ALL USING (true);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON classes FOR ALL USING (true);

ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON class_sessions FOR ALL USING (true);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON bookings FOR ALL USING (true);
