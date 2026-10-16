import { createClient } from "@supabase/supabase-js";

// Accept the Project URL even if it was copied with an API path or trailing slash
// (Supabase's API page shows "https://<ref>.supabase.co/rest/v1/").
export const normalizeSupabaseUrl = (u: string | undefined) =>
  u?.trim().replace(/\/(rest|auth)\/v1\/?$/, "").replace(/\/+$/, "") || undefined;

const url = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL as string | undefined);
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Client is null when env vars are not set — all persistence calls are no-ops
export const supabase = url && key ? createClient(url, key) : null;

export function getOrCreateUserId(): string {
  const K = "herbalance_user_id";
  let id = localStorage.getItem(K);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(K, id);
  }
  return id;
}

/*
  Run this SQL in your Supabase project (SQL editor) to create the required tables:

  -- User profiles
  create table profiles (
    id                   uuid primary key default gen_random_uuid(),
    user_id              text not null unique,
    full_name            text,
    age                  int,
    weight_kg            numeric,
    height_cm            numeric,
    activity_level       text,
    dietary_preference   text,
    cuisine_preferences  text[],
    food_allergies       text,
    fitness_level        text,
    workout_location     text,
    favourite_workouts   text[],
    conditions           text[],
    symptoms             text[],
    last_period_date     date,
    cycle_length         text,
    created_at           timestamptz default now(),
    updated_at           timestamptz default now()
  );

  create index on profiles (user_id);

  -- Diet plans
  create table diet_plans (
    id            uuid primary key default gen_random_uuid(),
    user_id       text not null,
    plan_duration int not null,
    created_at    timestamptz default now(),
    plan_data     jsonb not null,
    cuisines      text[]
  );

  create index on diet_plans (user_id, created_at desc);
*/
