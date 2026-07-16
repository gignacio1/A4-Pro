import { pgTable, text, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const documentsTable = pgTable("documents", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // orcamento | ordem_servico | laudo_tecnico | recibo
  number: text("number").notNull(),
  date: text("date").notNull(),
  dueDate: text("due_date"),

  // Client info (denormalized for historical accuracy)
  clientName: text("client_name").notNull(),
  clientDocument: text("client_document").notNull().default(""),
  clientPhone: text("client_phone").notNull().default(""),
  clientEmail: text("client_email").notNull().default(""),
  clientAddress: text("client_address").notNull().default(""),

  // Items (stored as JSONB)
  items: jsonb("items").notNull().default([]),

  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  discount: numeric("discount", { precision: 10, scale: 2 }),
  observations: text("observations"),

  // Ordem de Serviço specific
  status: text("status"),
  equipment: text("equipment"),
  serialNumber: text("serial_number"),
  defect: text("defect"),
  solution: text("solution"),

  // Laudo Técnico specific
  technicalAnalysis: text("technical_analysis"),
  conclusion: text("conclusion"),
  responsavelTecnico: text("responsavel_tecnico"),
  registroProfissional: text("registro_profissional"),

  // Recibo specific
  receivedValue: numeric("received_value", { precision: 10, scale: 2 }),
  referringTo: text("referring_to"),
  issuerName: text("issuer_name"),
  issuerDocument: text("issuer_document"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documentsTable).omit({ createdAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type DocumentRow = typeof documentsTable.$inferSelect;
