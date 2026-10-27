-- B-Global Network content schema. Dates are ISO text (YYYY-MM-DD) like the app's types.
-- Additive only: later migrations must stay compatible with the previously deployed code.

create table opportunities (
  id                text primary key,
  slug              text not null unique,
  status            text not null check (status in ('draft', 'published')),
  title             text not null,
  country           text not null default '',
  category          text not null default '',
  published_at      text,
  deadline          text not null default '' check (deadline = '' or deadline ~ '^\d{4}-\d{2}-\d{2}$'),
  short_description text not null default '',
  full_description  text not null default '',
  external_link     text not null default '',
  featured          boolean,
  cover_image       text,
  updated_at        timestamptz,
  created_at        timestamptz not null default now()
);

create table reels (
  id                                text primary key,
  slug                              text not null unique,
  status                            text not null check (status in ('draft', 'published')),
  title                             text not null,
  short_description                 text not null default '',
  instagram_url                     text not null default '',
  thumbnail                         text,
  tag                               text not null default '',
  featured                          boolean,
  published_at                      text not null default '' check (published_at = '' or published_at ~ '^\d{4}-\d{2}-\d{2}$'),
  legacy_related_opportunity_ids    text[],
  updated_at                        timestamptz,
  created_at                        timestamptz not null default now()
);

create table opportunity_reels (
  opportunity_id text not null references opportunities (id) on delete cascade,
  reel_id        text not null references reels (id) on delete cascade,
  position       integer not null default 0,
  primary key (opportunity_id, reel_id)
);
create index opportunity_reels_reel_idx on opportunity_reels (reel_id);

create table announcements (
  id           text primary key,
  slug         text not null unique,
  status       text not null check (status in ('draft', 'published')),
  title        text not null,
  content      text not null default '',
  published_at text not null default '' check (published_at = '' or published_at ~ '^\d{4}-\d{2}-\d{2}$'),
  featured     boolean,
  cover_image  text,
  link         text,
  updated_at   timestamptz,
  created_at   timestamptz not null default now()
);

create table site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
