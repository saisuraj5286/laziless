CREATE TABLE "laziless_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "laziless_session" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "laziless_user" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "laziless_user" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "laziless_session" ADD CONSTRAINT "laziless_session_user_id_laziless_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."laziless_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "laziless_session_user_id_idx" ON "laziless_session" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "laziless_user_username_idx" ON "laziless_user" USING btree ("username");