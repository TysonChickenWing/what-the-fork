-- Run this in your Supabase SQL editor to set up the database

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Other',
  description text,
  ingredients text,
  steps text,
  prep_time text,
  cook_time text,
  author text not null,
  created_at timestamptz default now()
);

create table if not exists likes (
  recipe_id uuid references recipes(id) on delete cascade,
  user_name text not null,
  primary key (recipe_id, user_name)
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes(id) on delete cascade,
  author text not null,
  text text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security but allow all reads/writes (public cookbook)
alter table recipes enable row level security;
alter table likes enable row level security;
alter table comments enable row level security;

create policy "public read recipes" on recipes for select using (true);
create policy "public insert recipes" on recipes for insert with check (true);
create policy "public read likes" on likes for select using (true);
create policy "public insert likes" on likes for insert with check (true);
create policy "public delete likes" on likes for delete using (true);
create policy "public read comments" on comments for select using (true);
create policy "public insert comments" on comments for insert with check (true);

-- Enable realtime for live updates
alter publication supabase_realtime add table recipes;
alter publication supabase_realtime add table likes;
alter publication supabase_realtime add table comments;

-- Seed sample recipes
insert into recipes (id, title, category, description, ingredients, steps, prep_time, cook_time, author) values
(
  '00000000-0000-0000-0000-000000000001',
  'Homemade Peach Ice Cream',
  'Desserts & Baked Goods',
  'Fresh Georgia peaches churned into the creamiest summer ice cream. Egg-yolk custard base, real peach chunks folded in at the end.',
  '4 ripe peaches, 2 cups heavy cream, 1 cup whole milk, ¾ cup sugar, 4 egg yolks, 1 tsp vanilla, pinch of salt',
  '1. Peel and dice peaches, macerate with 2 tbsp sugar.
2. Whisk egg yolks with remaining sugar until pale.
3. Heat milk + cream to simmer, temper into yolks.
4. Cook custard to 170°F, chill overnight.
5. Churn in ice cream maker, fold in peaches last 2 min.
6. Freeze 4 hours before serving.',
  '30 min',
  '20 min + overnight chill',
  'Logan'
),
(
  '00000000-0000-0000-0000-000000000002',
  'Bacon Corn',
  'Sides & Comfort',
  'Logan''s original. Grilled corn, baked, cut off the cob and fried in bacon grease — then tossed with finely chopped bacon. Pure Southern.',
  '6 ears of corn, 6 strips thick-cut bacon, salt, black pepper',
  '1. Grill corn on cob until charred.
2. Bake at 375°F for 10 min.
3. Cut kernels off cob.
4. Fry bacon until crispy, remove and chop finely.
5. Fry corn in bacon grease over medium-high, stirring often.
6. Toss with chopped bacon, season to taste.',
  '15 min',
  '40 min',
  'Logan'
)
on conflict (id) do nothing;
