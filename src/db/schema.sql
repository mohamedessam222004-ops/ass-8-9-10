CREATE TABLE IF NOT EXISTS public.users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "firstName" VARCHAR(25) NOT NULL,
    "lastName" VARCHAR(25) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT,
    phone TEXT,
    "DOB" TIMESTAMPTZ,
    "confirmEmail" TIMESTAMPTZ,
    image TEXT,
    "coverImage" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    gender INTEGER NOT NULL DEFAULT 0,
    role INTEGER NOT NULL DEFAULT 0,
    provider INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_first_name_length_check' AND conrelid = 'public.users'::regclass) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_first_name_length_check
        CHECK (char_length(trim("firstName")) BETWEEN 2 AND 25);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_last_name_length_check' AND conrelid = 'public.users'::regclass) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_last_name_length_check
        CHECK (char_length(trim("lastName")) BETWEEN 2 AND 25);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_email_lowercase_check' AND conrelid = 'public.users'::regclass) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_email_lowercase_check
        CHECK (email = lower(trim(email)));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_gender_enum_check' AND conrelid = 'public.users'::regclass) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_gender_enum_check
        CHECK (gender IN (0, 1));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_enum_check' AND conrelid = 'public.users'::regclass) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_role_enum_check
        CHECK (role IN (0, 1));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_provider_enum_check' AND conrelid = 'public.users'::regclass) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_provider_enum_check
        CHECK (provider IN (0, 1));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_password_provider_check' AND conrelid = 'public.users'::regclass) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_password_provider_check
        CHECK (provider <> 0 OR password IS NOT NULL);
    END IF;
END $$;


-- Mongoose used an unbounded String for phone; encrypted values are longer than the plain text.
ALTER TABLE public.users ALTER COLUMN phone TYPE TEXT USING phone::TEXT;
