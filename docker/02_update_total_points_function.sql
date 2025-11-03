CREATE OR REPLACE FUNCTION update_ranking() 
RETURNS VOID AS
$$
BEGIN
    INSERT INTO ranking (rank, user_id, points)
    SELECT 
        0 AS rank, 
        u.user_id, 
        COALESCE(SUM(p.amount), 0) AS total_points
    FROM 
        (SELECT DISTINCT user_id FROM points) u
    LEFT JOIN 
        points p ON u.user_id = p.user_id
    GROUP BY 
        u.user_id
    ON CONFLICT (user_id)
    DO UPDATE SET points = COALESCE(EXCLUDED.points, 0);

    WITH ranked_points AS (
        SELECT user_id, DENSE_RANK() OVER (ORDER BY points DESC, user_id ASC) AS rank_value
        FROM ranking
    )
    UPDATE ranking
    SET rank = ranked_points.rank_value
    FROM ranked_points
    WHERE ranking.user_id = ranked_points.user_id;

    UPDATE ranking
    SET points = 0
    WHERE user_id NOT IN (SELECT DISTINCT user_id FROM points);
END;
$$ LANGUAGE plpgsql;
