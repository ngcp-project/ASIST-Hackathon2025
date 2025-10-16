-- 0001_seed.sql
-- Seed sample programs and membership plans for quick UI testing

-- Sample Membership Plans
insert into public.membership_plans (name, duration, duration_months, active)
values
  ('Annual Member (12 mo)', 'GENERIC', 12, true),
  ('Fall 2025 Semester Pass', 'SPECIFIC', null, true);

-- Backfill dates for SPECIFIC plan to match the current semester window
update public.membership_plans
set start_date = date_trunc('month', now())::date,
    end_date = (date_trunc('month', now()) + interval '4 months')::date - 1
where name = 'Fall 2025 Semester Pass';

-- Sample Programs
-- A public workshop published now, starts in 7 days
insert into public.programs (
  title, description, location, capacity,
  start_at, end_at, visibility, publish_at,
  waiver_url, price_public, price_student, price_member
) values (
  'Intro to Robotics Workshop',
  'Hands-on beginner workshop covering basic robotics concepts and building a simple bot.',
  'Makerspace Lab A',
  20,
  now() + interval '7 days',
  now() + interval '7 days' + interval '2 hours',
  'PUBLIC',
  now() - interval '1 day',
  null,
  3000,
  1500,
  1000
);

-- A members-only evening lab published now, starts in 10 days
insert into public.programs (
  title, description, location, capacity,
  start_at, end_at, visibility, publish_at,
  waiver_url, price_public, price_student, price_member
) values (
  'Members Lab Night',
  'Open lab time with staff support. Members only.',
  'Makerspace Lab B',
  12,
  now() + interval '10 days',
  now() + interval '10 days' + interval '3 hours',
  'MEMBERS_ONLY',
  now() - interval '1 hour',
  null,
  0,
  0,
  0
);

-- A student-only event published now, starts in 14 days
insert into public.programs (
  title, description, location, capacity,
  start_at, end_at, visibility, publish_at,
  waiver_url, price_public, price_student, price_member
) values (
  'Student Design Sprint',
  'Collaborative design sprint for students — fast-paced prototyping and presentations.',
  'Innovation Hub',
  30,
  now() + interval '14 days',
  now() + interval '14 days' + interval '4 hours',
  'STUDENTS_ONLY',
  now() - interval '1 hour',
  null,
  2000,
  1000,
  2000
);

-- Done
