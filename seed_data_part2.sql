-- PART 2: task_progress + pr_reviews (run AFTER part 1)

-- Generate task_progress for every student-environment-task combo
DO $$
DECLARE
  r RECORD;
  s RECORD;
  t RECORD;
  task_num int;
  total_tasks int;
  student_rank int;
  cutoff int;
  stat text;
BEGIN
  -- Loop each environment participant
  FOR r IN SELECT ep.student_id, ep.environment_id
           FROM public.environment_participants ep
           WHERE ep.student_id IN (
             'a0000000-0000-4000-a000-000000000001','a0000000-0000-4000-a000-000000000002',
             'a0000000-0000-4000-a000-000000000003','a0000000-0000-4000-a000-000000000004',
             'a0000000-0000-4000-a000-000000000005','a0000000-0000-4000-a000-000000000006',
             'a0000000-0000-4000-a000-000000000007','a0000000-0000-4000-a000-000000000008',
             'a0000000-0000-4000-a000-000000000009','a0000000-0000-4000-a000-00000000000a'
           )
  LOOP
    SELECT count(*) INTO total_tasks FROM public.tasks WHERE environment_id = r.environment_id;
    -- Deterministic rank per student in env (1=star, 5=beginner)
    SELECT (row_number() OVER (ORDER BY ep.student_id))::int INTO student_rank
      FROM public.environment_participants ep
      WHERE ep.environment_id = r.environment_id
        AND ep.student_id = r.student_id;
    -- How many tasks approved based on rank
    cutoff := GREATEST(1, total_tasks - student_rank + 1);
    IF cutoff > total_tasks THEN cutoff := total_tasks; END IF;

    task_num := 0;
    FOR t IN SELECT task_id FROM public.tasks WHERE environment_id = r.environment_id ORDER BY task_order
    LOOP
      task_num := task_num + 1;
      IF task_num <= cutoff THEN stat := 'approved';
      ELSIF task_num = cutoff + 1 THEN stat := 'submitted';
      ELSIF task_num = cutoff + 2 THEN stat := 'in_progress';
      ELSIF task_num = cutoff + 3 THEN stat := 'unlocked';
      ELSE stat := 'locked';
      END IF;
      INSERT INTO public.task_progress (task_id, student_id, status, updated_at)
      VALUES (t.task_id, r.student_id, stat, now() - ((total_tasks - task_num) || ' days')::interval)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Generate pr_reviews for approved/submitted tasks
DO $$
DECLARE
  r RECORD;
  score int;
  verdict text;
BEGIN
  FOR r IN SELECT tp.task_id, tp.student_id, t.title as task_title, gr.repo_url
           FROM public.task_progress tp
           JOIN public.tasks t ON t.task_id = tp.task_id
           LEFT JOIN public.github_repos gr ON gr.student_id = tp.student_id AND gr.environment_id = t.environment_id
           WHERE tp.status IN ('approved','submitted')
             AND tp.student_id IN (
               'a0000000-0000-4000-a000-000000000001','a0000000-0000-4000-a000-000000000002',
               'a0000000-0000-4000-a000-000000000003','a0000000-0000-4000-a000-000000000004',
               'a0000000-0000-4000-a000-000000000005','a0000000-0000-4000-a000-000000000006',
               'a0000000-0000-4000-a000-000000000007','a0000000-0000-4000-a000-000000000008',
               'a0000000-0000-4000-a000-000000000009','a0000000-0000-4000-a000-00000000000a'
             )
  LOOP
    score := 60 + floor(random() * 40);
    IF score >= 80 THEN verdict := 'approved';
    ELSIF score >= 65 THEN verdict := 'changes_requested';
    ELSE verdict := 'rejected';
    END IF;
    INSERT INTO public.pr_reviews (task_id, student_id, pr_url, ai_score, repo_name, pr_number, pr_title, ai_verdict, ai_summary, ai_issues)
    VALUES (
      r.task_id, r.student_id,
      COALESCE(r.repo_url, 'https://github.com/demo/repo') || '/pull/' || (1 + floor(random()*50))::int,
      score,
      split_part(COALESCE(r.repo_url,'https://github.com/demo/repo'),'/',5),
      (1 + floor(random()*50))::int,
      'feat: ' || r.task_title,
      verdict,
      'Implementation covers the core requirements. Code quality is ' || CASE WHEN score>=80 THEN 'excellent' WHEN score>=70 THEN 'good' ELSE 'needs improvement' END || '.',
      '[{"type":"style","message":"Minor formatting issues"}]'::jsonb
    ) ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
