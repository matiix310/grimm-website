CREATE OR REPLACE FUNCTION update_ranking() 
RETURNS VOID AS
$$
BEGIN
    INSERT INTO ranking (rank, user_id, points)
    SELECT 
        0 AS rank, 
        u.id as user_id, 
        COALESCE(SUM(p.amount), 0) AS total_points
    FROM 
        (SELECT id FROM public.user) u
    LEFT JOIN 
        points p ON u.id = p.user_id
    GROUP BY 
        u.id
    ON CONFLICT (user_id)
    DO UPDATE SET points = COALESCE(EXCLUDED.points, 0);

    DELETE FROM ranking r WHERE r.user_id IN (SELECT id FROM public.user u WHERE u.banned OR u.username IS NOT NULL);

    WITH ranked_points AS (
        SELECT 
            user_id, 
            DENSE_RANK() OVER (
                ORDER BY 
                    points DESC, 
                    (SELECT MAX(created_at) FROM points WHERE user_id = ranking.user_id) ASC
            ) AS rank_value
        FROM 
            ranking
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