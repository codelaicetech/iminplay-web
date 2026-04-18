-- ============================================
-- Demo seed — 12 approved Cape Town games
-- ============================================
-- Gives the /app feed something credible to show first visitors
-- instead of the "no games yet" empty state. Re-runnable: if you
-- want a fresh set, admin-delete the old ones first.
--
-- Host = first admin (should be you). All games are approved + open,
-- spread across the next 14 days with realistic times and mixed
-- sports, skill levels, and locations.
-- ============================================

DO $$
DECLARE
  v_creator uuid;
  -- Anchor to *today* in Cape Town timezone so times map cleanly to
  -- local clock hours regardless of when this runs.
  v_today date := (now() AT TIME ZONE 'Africa/Johannesburg')::date;
BEGIN
  SELECT user_id INTO v_creator
    FROM admins
    ORDER BY granted_at ASC
    LIMIT 1;

  IF v_creator IS NULL THEN
    RAISE EXCEPTION
      'No admin found. Bootstrap one via 20260417_admin_and_reports.sql first.';
  END IF;

  INSERT INTO games
    (creator_id, sport, title, description, location_name, city, date_time,
     duration_minutes, max_players, skill_level, approval_status, status)
  VALUES
    -- Day +1
    (v_creator, 'football', 'Sunset 7-a-side at Mouille',
     'Casual 7-a-side on the Mouille Point pitch. Bring a light and a dark shirt.',
     'Mouille Point Park', 'Cape Town',
     ((v_today + interval '1 day 17 hours 30 minutes')::timestamp)
       AT TIME ZONE 'Africa/Johannesburg',
     90, 14, 'any', 'approved', 'open'),

    (v_creator, 'padel', 'Padel after-work doubles',
     'Doubles round-robin on the new courts. All levels welcome — we rotate partners.',
     'Virgin Active V&A Waterfront', 'Cape Town',
     ((v_today + interval '1 day 18 hours 30 minutes')::timestamp)
       AT TIME ZONE 'Africa/Johannesburg',
     75, 4, 'intermediate', 'approved', 'open'),

    -- Day +2
    (v_creator, 'basketball', 'Lunchtime hoops',
     'Quick pickup 5-on-5 during the lunch break. Court shoes only, no running shoes.',
     'Green Point Urban Park', 'Cape Town',
     ((v_today + interval '2 days 12 hours 30 minutes')::timestamp)
       AT TIME ZONE 'Africa/Johannesburg',
     60, 10, 'intermediate', 'approved', 'open'),

    (v_creator, 'tennis', 'Evening tennis knock-up',
     'Casual singles / shared court. Balls provided. Beginners welcome.',
     'Claremont Tennis Club', 'Cape Town',
     ((v_today + interval '2 days 18 hours')::timestamp)
       AT TIME ZONE 'Africa/Johannesburg',
     60, 4, 'beginner', 'approved', 'open'),

    -- Day +3
    (v_creator, 'running', 'Sea Point promenade 5K',
     'Easy-paced 5K along the Sea Point promenade. Coffee after at Vovo Telo.',
     'Sea Point Promenade', 'Cape Town',
     ((v_today + interval '3 days 6 hours 30 minutes')::timestamp)
       AT TIME ZONE 'Africa/Johannesburg',
     45, 20, 'any', 'approved', 'open'),

    (v_creator, 'football', 'Thursday 5-a-side',
     'Regular Thursday 5-a-side. Fast-paced but friendly.',
     'Cape Town Stadium training fields', 'Cape Town',
     ((v_today + interval '3 days 17 hours 30 minutes')::timestamp)
       AT TIME ZONE 'Africa/Johannesburg',
     60, 10, 'intermediate', 'approved', 'open'),

    -- Day +5 (likely Saturday)
    (v_creator, 'football', 'Saturday morning 5-a-side',
     'Weekly Saturday kickabout. Mix of abilities — team captains pick on the day.',
     'Green Point Urban Park', 'Cape Town',
     ((v_today + interval '5 days 8 hours')::timestamp)
       AT TIME ZONE 'Africa/Johannesburg',
     90, 10, 'any', 'approved', 'open'),

    (v_creator, 'padel', 'Padel Royale Doubles',
     'Weekend doubles tournament warm-up. Bring a partner or find one on the day.',
     'Virgin Active V&A Waterfront', 'Cape Town',
     ((v_today + interval '5 days 14 hours')::timestamp)
       AT TIME ZONE 'Africa/Johannesburg',
     90, 4, 'advanced', 'approved', 'open'),

    (v_creator, 'cricket', 'Park cricket, 6-a-side',
     'Tennis-ball cricket on the oval. Bring sunscreen — we start under the blue.',
     'De Waal Park', 'Cape Town',
     ((v_today + interval '5 days 10 hours')::timestamp)
       AT TIME ZONE 'Africa/Johannesburg',
     120, 12, 'any', 'approved', 'open'),

    -- Day +6 (likely Sunday)
    (v_creator, 'running', 'Sunday Constantia trail run',
     'Relaxed 8-10K along the Constantia Greenbelt. Trail shoes recommended.',
     'Alphen Common, Constantia', 'Cape Town',
     ((v_today + interval '6 days 7 hours')::timestamp)
       AT TIME ZONE 'Africa/Johannesburg',
     90, 15, 'intermediate', 'approved', 'open'),

    (v_creator, 'cycling', 'Chapmans Peak ride',
     'Classic Sea Point → Chapmans Peak → Noordhoek loop. Moderate pace, regroup at the top.',
     'Chapman''s Peak Drive', 'Cape Town',
     ((v_today + interval '6 days 8 hours 30 minutes')::timestamp)
       AT TIME ZONE 'Africa/Johannesburg',
     180, 15, 'advanced', 'approved', 'open'),

    -- Day +10
    (v_creator, 'volleyball', 'Beach volleyball at Camps Bay',
     'Doubles on the sand. Sunset games — bring water.',
     'Camps Bay Beach', 'Cape Town',
     ((v_today + interval '10 days 17 hours')::timestamp)
       AT TIME ZONE 'Africa/Johannesburg',
     90, 8, 'any', 'approved', 'open');
END $$;

-- Verify distribution
SELECT sport, COUNT(*) AS games
FROM games
WHERE approval_status = 'approved'
  AND date_time > now()
GROUP BY sport
ORDER BY games DESC, sport;
