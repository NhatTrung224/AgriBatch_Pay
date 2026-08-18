CREATE INDEX "app_events_created_at_idx" ON "app_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "app_events_batch_id_idx" ON "app_events" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "batches_updated_at_idx" ON "batches" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "farmer_lots_batch_id_idx" ON "farmer_lots" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "wallet_interactions_created_at_idx" ON "wallet_interactions" USING btree ("created_at");