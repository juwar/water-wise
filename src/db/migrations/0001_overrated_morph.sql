ALTER TABLE "credentials" RENAME COLUMN "email" TO "nik";--> statement-breakpoint
ALTER TABLE "credentials" DROP CONSTRAINT "credentials_email_unique";--> statement-breakpoint
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_nik_unique" UNIQUE("nik");