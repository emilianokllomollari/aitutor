CREATE INDEX "idx_activity_logs_user_id_timestamp" ON "activity_logs" USING btree ("user_id","timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_activity_logs_team_id_timestamp" ON "activity_logs" USING btree ("team_id","timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_activity_logs_timestamp" ON "activity_logs" USING btree ("timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_invitations_team_id" ON "invitations" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_invitations_email" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_invitations_status" ON "invitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_invitations_invited_by" ON "invitations" USING btree ("invited_by");--> statement-breakpoint
CREATE INDEX "idx_password_reset_tokens_user_id" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_password_reset_tokens_expires_at" ON "password_reset_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_team_members_user_id" ON "team_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_team_members_team_id" ON "team_members" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_team_members_user_team" ON "team_members" USING btree ("user_id","team_id");--> statement-breakpoint
CREATE INDEX "idx_teams_stripe_customer_id" ON "teams" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "idx_teams_stripe_subscription_id" ON "teams" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "idx_users_id_deleted_at" ON "users" USING btree ("id","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_active" ON "users" USING btree ("id") WHERE deleted_at IS NULL;