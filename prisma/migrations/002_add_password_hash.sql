-- Add password_hash column to user table for authentication
ALTER TABLE "user" ADD COLUMN password_hash TEXT;
