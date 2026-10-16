-- Lets a signed-in user permanently delete their own account.
-- Run once in Supabase → SQL Editor → New query → paste → Run.
--
-- Deleting the auth.users row cascades to profiles, diet_plans and workout_logs
-- (all declared with "on delete cascade" in schema.sql), so every trace of the user goes.
-- SECURITY DEFINER runs it with the function owner's rights; auth.uid() pins it to the
-- caller, so nobody can delete anyone else.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
