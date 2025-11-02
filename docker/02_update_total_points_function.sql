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

    WITH ranked_points AS (
        SELECT user_id, DENSE_RANK() OVER (ORDER BY points DESC, user_id ASC) AS rank_value
        FROM ranking
    )
    UPDATE ranking
    SET rank = ranked_points.rank_value
    FROM ranked_points
    WHERE ranking.user_id = ranked_points.user_id
END;
$$ LANGUAGE plpgsql;