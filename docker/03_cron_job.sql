SELECT cron.schedule('*/5 * * * *', 
  $$
    SELECT update_total_points();
  $$
);