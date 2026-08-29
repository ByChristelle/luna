-- Migration : Ajoute la colonne share_token a la table users si elle n'existe pas deja
-- (Base.metadata.create_all() ne modifie pas les tables existantes, on est oblige de le faire a la main)

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'share_token'
    ) THEN
        ALTER TABLE users
        ADD COLUMN share_token VARCHAR(255) NULL;

        CREATE UNIQUE INDEX IF NOT EXISTS ix_users_share_token
        ON users(share_token);
    END IF;
END $$;
