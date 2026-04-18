-- ============================================
-- Seed — Sea Point Promenade 5K morning runs
-- ============================================
-- One game per day from 19 → 24 April 2026, all at 06:30 SAST
-- (Africa/Johannesburg). Host = first admin.
--
-- Pure SQL (no DO block) so Supabase's SQL editor parses it in a
-- single statement.
-- ============================================

INSERT INTO games (
  creator_id,
  sport,
  title,
  description,
  location_name,
  city,
  date_time,
  duration_minutes,
  max_players,
  skill_level,
  approval_status,
  status
)
SELECT
  (SELECT user_id FROM admins ORDER BY granted_at ASC LIMIT 1),
  'running',
  'Sea Point 5K · morning run',
  'Easy-paced 5K along the Sea Point Promenade. Meet at the lighthouse, coffee after at Vovo Telo. Same group every morning 19–24 April.',
  'Sea Point Promenade',
  'Cape Town',
  (d::timestamp + interval '6 hours 30 minutes') AT TIME ZONE 'Africa/Johannesburg',
  45,
  20,
  'any',
  'approved',
  'open'
FROM generate_series(
       date '2026-04-19',
       date '2026-04-24',
       interval '1 day'
     ) AS t(d);

-- Verify
SELECT
  to_char(date_time AT TIME ZONE 'Africa/Johannesburg', 'Dy DD Mon · HH24:MI')
    AS when_sast,
  title,
  location_name
FROM games
WHERE title = 'Sea Point 5K · morning run'
ORDER BY date_time;
