-- Add location column to tasks table if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'tasks' and column_name = 'location') then
    alter table tasks add column location text;
  end if;
end $$;
