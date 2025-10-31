CREATE OR REPLACE FUNCTION update_ranking() 
RETURNS TABLE (
    rank int, user_id text, points int, updated_at timestamp, created_at timestamp
) AS
$$
#variable_conflict use_column
BEGIN
    INSERT INTO ranking (rank, user_id, points)
    SELECT 0, p.user_id, SUM(p.amount) AS total_points
    FROM points p
    GROUP BY p.user_id
    ON CONFLICT (user_id)
    DO UPDATE SET points = EXCLUDED.points;

    RETURN QUERY
    UPDATE ranking r1
    SET rank = (
        SELECT row_number() over (
            ORDER BY points DESC
        )
        FROM ranking r2
        WHERE r1.user_id = r2.user_id
    ) RETURNING r1.rank as rank, r1.user_id as user_id, r1.points as points, r1.updated_at as updated_at, r1.created_at as created_at;
END;
$$ LANGUAGE plpgsql;