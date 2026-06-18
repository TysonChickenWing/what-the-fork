-- Run this in your Supabase SQL editor to rename the author
-- from "Logan" to "Theisen" across all tables

update recipes set author = 'Theisen' where author = 'Logan';
update comments set author = 'Theisen' where author = 'Logan';
update likes set user_name = 'Theisen' where user_name = 'Logan';
update users set name = 'Theisen' where name = 'Logan';
