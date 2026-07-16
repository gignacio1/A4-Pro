import { pgTable, text, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const servicesTable = pgTable("services", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  category: text("category"),
});

export const insertServiceSchema = createInsertSchema(servicesTable);
export type InsertService = z.infer<typeof insertServiceSchema>;
export type ServiceRow = typeof servicesTable.$inferSelect;
