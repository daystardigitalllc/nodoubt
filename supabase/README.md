# Supabase setup

The client uses only the publishable key. Never add a Supabase secret key to this repository or any shipped application.

## Apply the initial migration

1. Open the NoDoubt project in Supabase.
2. Open **SQL Editor**.
3. Create a new query.
4. Paste the contents of `migrations/20260928000000_initial_auth_and_moderation.sql`.
5. Run the query once.

## Assign the first owner

Register the project owner's account in NoDoubt and confirm its email. Then find that user in **Authentication > Users**, copy the user UUID, and run this in the SQL Editor after replacing the placeholder:

```sql
insert into public.user_roles (user_id, role, granted_by)
values ('OWNER_USER_UUID', 'owner', 'OWNER_USER_UUID')
on conflict (user_id, role) do nothing;
```

The owner can later grant reviewer and admin access through the application. The app must not use a secret key for role management.
