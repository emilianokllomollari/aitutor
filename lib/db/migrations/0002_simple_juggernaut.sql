CREATE TABLE "vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL,
	"year" integer NOT NULL,
	"plate" varchar(20) NOT NULL,
	"registration_exp" timestamp NOT NULL,
	"engine" integer,
	"fuel_type" varchar(50) NOT NULL,
	"gearbox" varchar(50) NOT NULL,
	"seats" integer,
	"kilometers" integer NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_plate_unique" UNIQUE("plate")
);
--> statement-breakpoint
CREATE INDEX "idx_vehicles_plate" ON "vehicles" USING btree ("plate");