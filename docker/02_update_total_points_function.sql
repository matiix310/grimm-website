CREATE OR REPLACE FUNCTION update_ranking() 
RETURNS VOID AS
$$
BEGIN
    INSERT INTO ranking (rank, user_id, points)
    SELECT 0, p.user_id, SUM(p.amount) AS total_points
    FROM points p
    GROUP BY p.user_id
    ON CONFLICT (user_id)
    DO UPDATE SET points = EXCLUDED.points;

    UPDATE ranking r1
    SET rank = (
        SELECT row_number() over (
            ORDER BY points DESC
        )
        FROM ranking r2
        WHERE r1.user_id = r2.user_id
    );
END;
$$ LANGUAGE plpgsql;