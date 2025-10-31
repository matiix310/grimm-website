CREATE OR REPLACE FUNCTION update_total_points() 
RETURNS VOID AS
$$
BEGIN
    INSERT INTO total_points (user_id, points)
    SELECT user_id, SUM(amount) AS total_points
    FROM points 
    GROUP BY user_id
    ON CONFLICT (user_id) 
    DO UPDATE SET points = EXCLUDED.points;
END;
$$ LANGUAGE plpgsql;