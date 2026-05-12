-- ============================================================
-- CAREERSETU SEED DATA - PART 1
-- Run in Supabase SQL Editor. Safe: uses INSERT only, no deletes.
-- ============================================================

-- Fix environment_participants unique constraint (required for multiple students per env)
ALTER TABLE public.environment_participants DROP CONSTRAINT IF EXISTS environment_participants_environment_id_key;
ALTER TABLE public.environment_participants ADD CONSTRAINT environment_participants_env_student_unique UNIQUE (environment_id, student_id);

-- ============================================================
-- 1. AUTH USERS (10 dummy students)
-- ============================================================
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
  ('a0000000-0000-4000-a000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','aarav.sharma@demo.careersetu.in',crypt('Demo@12345',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"role":"student"}',now()-interval '30 days',now()),
  ('a0000000-0000-4000-a000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','priya.patel@demo.careersetu.in',crypt('Demo@12345',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"role":"student"}',now()-interval '28 days',now()),
  ('a0000000-0000-4000-a000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','rohan.gupta@demo.careersetu.in',crypt('Demo@12345',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"role":"student"}',now()-interval '26 days',now()),
  ('a0000000-0000-4000-a000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','ananya.singh@demo.careersetu.in',crypt('Demo@12345',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"role":"student"}',now()-interval '25 days',now()),
  ('a0000000-0000-4000-a000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','vikram.reddy@demo.careersetu.in',crypt('Demo@12345',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"role":"student"}',now()-interval '24 days',now()),
  ('a0000000-0000-4000-a000-000000000006','00000000-0000-0000-0000-000000000000','authenticated','authenticated','sneha.nair@demo.careersetu.in',crypt('Demo@12345',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"role":"student"}',now()-interval '22 days',now()),
  ('a0000000-0000-4000-a000-000000000007','00000000-0000-0000-0000-000000000000','authenticated','authenticated','arjun.mehta@demo.careersetu.in',crypt('Demo@12345',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"role":"student"}',now()-interval '20 days',now()),
  ('a0000000-0000-4000-a000-000000000008','00000000-0000-0000-0000-000000000000','authenticated','authenticated','kavya.iyer@demo.careersetu.in',crypt('Demo@12345',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"role":"student"}',now()-interval '18 days',now()),
  ('a0000000-0000-4000-a000-000000000009','00000000-0000-0000-0000-000000000000','authenticated','authenticated','rahul.verma@demo.careersetu.in',crypt('Demo@12345',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"role":"student"}',now()-interval '16 days',now()),
  ('a0000000-0000-4000-a000-00000000000a','00000000-0000-0000-0000-000000000000','authenticated','authenticated','diya.kapoor@demo.careersetu.in',crypt('Demo@12345',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"role":"student"}',now()-interval '14 days',now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. STUDENTS
-- ============================================================
INSERT INTO public.students (student_id, full_name, email, github_url, resume_url)
VALUES
  ('a0000000-0000-4000-a000-000000000001','Aarav Sharma','aarav.sharma@demo.careersetu.in','https://github.com/aaravsharma',NULL),
  ('a0000000-0000-4000-a000-000000000002','Priya Patel','priya.patel@demo.careersetu.in','https://github.com/priyapatel',NULL),
  ('a0000000-0000-4000-a000-000000000003','Rohan Gupta','rohan.gupta@demo.careersetu.in','https://github.com/rohangupta',NULL),
  ('a0000000-0000-4000-a000-000000000004','Ananya Singh','ananya.singh@demo.careersetu.in','https://github.com/ananyasingh',NULL),
  ('a0000000-0000-4000-a000-000000000005','Vikram Reddy','vikram.reddy@demo.careersetu.in','https://github.com/vikramreddy',NULL),
  ('a0000000-0000-4000-a000-000000000006','Sneha Nair','sneha.nair@demo.careersetu.in','https://github.com/snehanair',NULL),
  ('a0000000-0000-4000-a000-000000000007','Arjun Mehta','arjun.mehta@demo.careersetu.in','https://github.com/arjunmehta',NULL),
  ('a0000000-0000-4000-a000-000000000008','Kavya Iyer','kavya.iyer@demo.careersetu.in','https://github.com/kavyaiyer',NULL),
  ('a0000000-0000-4000-a000-000000000009','Rahul Verma','rahul.verma@demo.careersetu.in','https://github.com/rahulverma',NULL),
  ('a0000000-0000-4000-a000-00000000000a','Diya Kapoor','diya.kapoor@demo.careersetu.in','https://github.com/diyakapoor',NULL)
ON CONFLICT (student_id) DO NOTHING;

-- ============================================================
-- 3. ENVIRONMENT PARTICIPANTS
-- Env A = TaskFlow Pro (8c1d24ce) — s01-s05
-- Env B = Console CLI  (e5459247) — s03-s07
-- Env C = Expense CLI   (eeac289c) — s05-s09
-- Env D = EduTrack C++  (f51ae61e) — s06-s10
-- ============================================================
INSERT INTO public.environment_participants (environment_id, student_id)
VALUES
  -- TaskFlow Pro
  ('8c1d24ce-75ec-4cc0-81cd-b070963fc90a','a0000000-0000-4000-a000-000000000001'),
  ('8c1d24ce-75ec-4cc0-81cd-b070963fc90a','a0000000-0000-4000-a000-000000000002'),
  ('8c1d24ce-75ec-4cc0-81cd-b070963fc90a','a0000000-0000-4000-a000-000000000003'),
  ('8c1d24ce-75ec-4cc0-81cd-b070963fc90a','a0000000-0000-4000-a000-000000000004'),
  ('8c1d24ce-75ec-4cc0-81cd-b070963fc90a','a0000000-0000-4000-a000-000000000005'),
  -- Console CLI
  ('e5459247-2cfa-4a22-9d99-aa2e74dfab4e','a0000000-0000-4000-a000-000000000003'),
  ('e5459247-2cfa-4a22-9d99-aa2e74dfab4e','a0000000-0000-4000-a000-000000000004'),
  ('e5459247-2cfa-4a22-9d99-aa2e74dfab4e','a0000000-0000-4000-a000-000000000005'),
  ('e5459247-2cfa-4a22-9d99-aa2e74dfab4e','a0000000-0000-4000-a000-000000000006'),
  ('e5459247-2cfa-4a22-9d99-aa2e74dfab4e','a0000000-0000-4000-a000-000000000007'),
  -- Expense CLI
  ('eeac289c-b7d0-4ba3-ad13-80e1d07f9c38','a0000000-0000-4000-a000-000000000005'),
  ('eeac289c-b7d0-4ba3-ad13-80e1d07f9c38','a0000000-0000-4000-a000-000000000006'),
  ('eeac289c-b7d0-4ba3-ad13-80e1d07f9c38','a0000000-0000-4000-a000-000000000007'),
  ('eeac289c-b7d0-4ba3-ad13-80e1d07f9c38','a0000000-0000-4000-a000-000000000008'),
  ('eeac289c-b7d0-4ba3-ad13-80e1d07f9c38','a0000000-0000-4000-a000-000000000009'),
  -- EduTrack C++
  ('f51ae61e-218e-44fc-bea3-8e42e9ad8ece','a0000000-0000-4000-a000-000000000006'),
  ('f51ae61e-218e-44fc-bea3-8e42e9ad8ece','a0000000-0000-4000-a000-000000000007'),
  ('f51ae61e-218e-44fc-bea3-8e42e9ad8ece','a0000000-0000-4000-a000-000000000008'),
  ('f51ae61e-218e-44fc-bea3-8e42e9ad8ece','a0000000-0000-4000-a000-000000000009'),
  ('f51ae61e-218e-44fc-bea3-8e42e9ad8ece','a0000000-0000-4000-a000-00000000000a')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. GITHUB REPOS (one per student-environment pair)
-- ============================================================
INSERT INTO public.github_repos (student_id, environment_id, repo_url)
VALUES
  ('a0000000-0000-4000-a000-000000000001','8c1d24ce-75ec-4cc0-81cd-b070963fc90a','https://github.com/aaravsharma/taskflow-pro'),
  ('a0000000-0000-4000-a000-000000000002','8c1d24ce-75ec-4cc0-81cd-b070963fc90a','https://github.com/priyapatel/taskflow-pro'),
  ('a0000000-0000-4000-a000-000000000003','8c1d24ce-75ec-4cc0-81cd-b070963fc90a','https://github.com/rohangupta/taskflow-pro'),
  ('a0000000-0000-4000-a000-000000000004','8c1d24ce-75ec-4cc0-81cd-b070963fc90a','https://github.com/ananyasingh/taskflow-pro'),
  ('a0000000-0000-4000-a000-000000000005','8c1d24ce-75ec-4cc0-81cd-b070963fc90a','https://github.com/vikramreddy/taskflow-pro'),
  ('a0000000-0000-4000-a000-000000000003','e5459247-2cfa-4a22-9d99-aa2e74dfab4e','https://github.com/rohangupta/console-task-mgr'),
  ('a0000000-0000-4000-a000-000000000004','e5459247-2cfa-4a22-9d99-aa2e74dfab4e','https://github.com/ananyasingh/console-task-mgr'),
  ('a0000000-0000-4000-a000-000000000005','e5459247-2cfa-4a22-9d99-aa2e74dfab4e','https://github.com/vikramreddy/console-task-mgr'),
  ('a0000000-0000-4000-a000-000000000006','e5459247-2cfa-4a22-9d99-aa2e74dfab4e','https://github.com/snehanair/console-task-mgr'),
  ('a0000000-0000-4000-a000-000000000007','e5459247-2cfa-4a22-9d99-aa2e74dfab4e','https://github.com/arjunmehta/console-task-mgr'),
  ('a0000000-0000-4000-a000-000000000005','eeac289c-b7d0-4ba3-ad13-80e1d07f9c38','https://github.com/vikramreddy/expense-tracker'),
  ('a0000000-0000-4000-a000-000000000006','eeac289c-b7d0-4ba3-ad13-80e1d07f9c38','https://github.com/snehanair/expense-tracker'),
  ('a0000000-0000-4000-a000-000000000007','eeac289c-b7d0-4ba3-ad13-80e1d07f9c38','https://github.com/arjunmehta/expense-tracker'),
  ('a0000000-0000-4000-a000-000000000008','eeac289c-b7d0-4ba3-ad13-80e1d07f9c38','https://github.com/kavyaiyer/expense-tracker'),
  ('a0000000-0000-4000-a000-000000000009','eeac289c-b7d0-4ba3-ad13-80e1d07f9c38','https://github.com/rahulverma/expense-tracker'),
  ('a0000000-0000-4000-a000-000000000006','f51ae61e-218e-44fc-bea3-8e42e9ad8ece','https://github.com/snehanair/edutrack-cpp'),
  ('a0000000-0000-4000-a000-000000000007','f51ae61e-218e-44fc-bea3-8e42e9ad8ece','https://github.com/arjunmehta/edutrack-cpp'),
  ('a0000000-0000-4000-a000-000000000008','f51ae61e-218e-44fc-bea3-8e42e9ad8ece','https://github.com/kavyaiyer/edutrack-cpp'),
  ('a0000000-0000-4000-a000-000000000009','f51ae61e-218e-44fc-bea3-8e42e9ad8ece','https://github.com/rahulverma/edutrack-cpp'),
  ('a0000000-0000-4000-a000-00000000000a','f51ae61e-218e-44fc-bea3-8e42e9ad8ece','https://github.com/diyakapoor/edutrack-cpp');

-- ============================================================
-- 5. STUDENT SKILLS (3-5 per student)
-- ============================================================
INSERT INTO public.student_skills (student_id, skill_name, experience_level)
VALUES
  -- s01 Aarav
  ('a0000000-0000-4000-a000-000000000001','React','intermediate'),
  ('a0000000-0000-4000-a000-000000000001','JavaScript','advanced'),
  ('a0000000-0000-4000-a000-000000000001','MongoDB','intermediate'),
  ('a0000000-0000-4000-a000-000000000001','Python','beginner'),
  -- s02 Priya
  ('a0000000-0000-4000-a000-000000000002','React','beginner'),
  ('a0000000-0000-4000-a000-000000000002','CSS','intermediate'),
  ('a0000000-0000-4000-a000-000000000002','JavaScript','intermediate'),
  -- s03 Rohan
  ('a0000000-0000-4000-a000-000000000003','Python','advanced'),
  ('a0000000-0000-4000-a000-000000000003','React','intermediate'),
  ('a0000000-0000-4000-a000-000000000003','C#','beginner'),
  ('a0000000-0000-4000-a000-000000000003','Git','intermediate'),
  -- s04 Ananya
  ('a0000000-0000-4000-a000-000000000004','JavaScript','beginner'),
  ('a0000000-0000-4000-a000-000000000004','HTML','intermediate'),
  ('a0000000-0000-4000-a000-000000000004','C#','beginner'),
  -- s05 Vikram
  ('a0000000-0000-4000-a000-000000000005','Python','advanced'),
  ('a0000000-0000-4000-a000-000000000005','JavaScript','intermediate'),
  ('a0000000-0000-4000-a000-000000000005','React','intermediate'),
  ('a0000000-0000-4000-a000-000000000005','Node.js','beginner'),
  ('a0000000-0000-4000-a000-000000000005','MongoDB','beginner'),
  -- s06 Sneha
  ('a0000000-0000-4000-a000-000000000006','C#','intermediate'),
  ('a0000000-0000-4000-a000-000000000006','C++','intermediate'),
  ('a0000000-0000-4000-a000-000000000006','Python','beginner'),
  ('a0000000-0000-4000-a000-000000000006','Git','advanced'),
  -- s07 Arjun
  ('a0000000-0000-4000-a000-000000000007','JavaScript','advanced'),
  ('a0000000-0000-4000-a000-000000000007','Python','intermediate'),
  ('a0000000-0000-4000-a000-000000000007','C++','beginner'),
  ('a0000000-0000-4000-a000-000000000007','REST APIs','intermediate'),
  -- s08 Kavya
  ('a0000000-0000-4000-a000-000000000008','C++','advanced'),
  ('a0000000-0000-4000-a000-000000000008','Python','intermediate'),
  ('a0000000-0000-4000-a000-000000000008','Docker','beginner'),
  -- s09 Rahul
  ('a0000000-0000-4000-a000-000000000009','Python','intermediate'),
  ('a0000000-0000-4000-a000-000000000009','C++','beginner'),
  ('a0000000-0000-4000-a000-000000000009','Git','intermediate'),
  ('a0000000-0000-4000-a000-000000000009','REST APIs','beginner'),
  -- s10 Diya
  ('a0000000-0000-4000-a000-00000000000a','C++','advanced'),
  ('a0000000-0000-4000-a000-00000000000a','React','beginner'),
  ('a0000000-0000-4000-a000-00000000000a','JavaScript','intermediate'),
  ('a0000000-0000-4000-a000-00000000000a','TypeScript','beginner');
