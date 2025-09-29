# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Create a new project
4. Choose your organization and give your project a name
5. Set a database password (save this securely)
6. Choose a region close to your users
7. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL (starts with `https://`)
   - Anon public key (starts with `eyJ`)

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace the placeholder values with your actual Supabase credentials.

## 4. Create the Students Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  roles TEXT[] DEFAULT '{}',
  projects TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'newbie' CHECK (status IN ('newbie', 'experienced', 'active')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_status ON students(status);

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to insert their own data
CREATE POLICY "Users can insert their own data" ON students
  FOR INSERT WITH CHECK (true);

-- Create a policy that allows users to read their own data
CREATE POLICY "Users can read their own data" ON students
  FOR SELECT USING (true);

-- Create companies table
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo TEXT NOT NULL,
  description TEXT NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  rating DECIMAL(3,1) DEFAULT 0.0,
  total_projects INTEGER DEFAULT 0,
  active_projects INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for companies
CREATE INDEX idx_companies_company_id ON companies(company_id);
CREATE INDEX idx_companies_difficulty ON companies(difficulty);

-- Enable RLS for companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create policies for companies (public read access)
CREATE POLICY "Anyone can read companies" ON companies
  FOR SELECT USING (true);

-- Insert sample companies data
INSERT INTO companies (company_id, name, logo, description, required_skills, difficulty, rating, total_projects, active_projects) VALUES
('company_1', 'TechCorp Solutions', 'TC', 'Leading fintech company building next-gen payment solutions', ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL'], 'Intermediate', 4.8, 12, 8),
('company_2', 'InnovateLabs', 'IL', 'AI-first startup creating intelligent automation tools', ARRAY['Next.js', 'Python', 'AI/ML', 'MongoDB'], 'Advanced', 4.6, 8, 5),
('company_3', 'StartupHub', 'SH', 'Early-stage company building social commerce platform', ARRAY['React', 'Express', 'JavaScript', 'MySQL'], 'Beginner', 4.7, 6, 4);
```

## 5. Test the Setup

1. Start your development server: `npm run dev`
2. Go to the registration page
3. Fill out the form and submit
4. Check your Supabase dashboard to see if the data was inserted

## Security Notes

- The current implementation stores passwords as plain text for demo purposes
- In production, you should hash passwords using bcrypt or similar
- Consider implementing proper authentication with Supabase Auth
- The RLS policies are basic - customize them based on your security requirements
