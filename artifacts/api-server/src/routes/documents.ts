import { Router, type IRouter } from "express";
import { db, documentsTable } from "@workspace/db";
import {
  ListDocumentsResponse,
  CreateDocumentBody,
  CreateDocumentResponse,
  UpdateDocumentBody,
  UpdateDocumentParams,
  UpdateDocumentResponse,
  DeleteDocumentParams,
} from "@workspace/api-zod";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

const router: IRouter = Router();

function rowToApi(row: typeof documentsTable.$inferSelect) {
  return {
    id: row.id,
    type: row.type,
    number: row.number,
    date: row.date,
    dueDate: row.dueDate ?? null,
    client: {
      name: row.clientName,
      document: row.clientDocument,
      phone: row.clientPhone,
      email: row.clientEmail,
      address: row.clientAddress,
    },
    items: row.items as object[],
    totalAmount: Number(row.totalAmount),
    discount: row.discount != null ? Number(row.discount) : null,
    observations: row.observations ?? null,
    status: row.status ?? null,
    equipment: row.equipment ?? null,
    serialNumber: row.serialNumber ?? null,
    defect: row.defect ?? null,
    solution: row.solution ?? null,
    technicalAnalysis: row.technicalAnalysis ?? null,
    conclusion: row.conclusion ?? null,
    responsavelTecnico: row.responsavelTecnico ?? null,
    registroProfissional: row.registroProfissional ?? null,
    receivedValue: row.receivedValue != null ? Number(row.receivedValue) : null,
    referringTo: row.referringTo ?? null,
    issuerName: row.issuerName ?? null,
    issuerDocument: row.issuerDocument ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

function bodyToRow(data: ReturnType<typeof CreateDocumentBody.parse>, id: string) {
  return {
    id,
    type: data.type,
    number: data.number,
    date: data.date,
    dueDate: data.dueDate ?? undefined,
    clientName: data.client.name,
    clientDocument: data.client.document,
    clientPhone: data.client.phone,
    clientEmail: data.client.email,
    clientAddress: data.client.address,
    items: data.items,
    totalAmount: String(data.totalAmount),
    discount: data.discount != null ? String(data.discount) : undefined,
    observations: data.observations ?? undefined,
    status: data.status ?? undefined,
    equipment: data.equipment ?? undefined,
    serialNumber: data.serialNumber ?? undefined,
    defect: data.defect ?? undefined,
    solution: data.solution ?? undefined,
    technicalAnalysis: data.technicalAnalysis ?? undefined,
    conclusion: data.conclusion ?? undefined,
    responsavelTecnico: data.responsavelTecnico ?? undefined,
    registroProfissional: data.registroProfissional ?? undefined,
    receivedValue: data.receivedValue != null ? String(data.receivedValue) : undefined,
    referringTo: data.referringTo ?? undefined,
    issuerName: data.issuerName ?? undefined,
    issuerDocument: data.issuerDocument ?? undefined,
  };
}

router.get("/documents", async (_req, res): Promise<void> => {
  const rows = await db.select().from(documentsTable).orderBy(desc(documentsTable.createdAt));
  res.json(ListDocumentsResponse.parse(rows.map(rowToApi)));
});

router.post("/documents", async (req, res): Promise<void> => {
  const parsed = CreateDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid document body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const id = parsed.data.id ?? randomUUID();
  const [row] = await db
    .insert(documentsTable)
    .values(bodyToRow(parsed.data, id))
    .returning();

  res.status(201).json(CreateDocumentResponse.parse(rowToApi(row)));
});

router.put("/documents/:id", async (req, res): Promise<void> => {
  const paramsParsed = UpdateDocumentParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const bodyParsed = UpdateDocumentBody.safeParse(req.body);
  if (!bodyParsed.success) {
    req.log.warn({ errors: bodyParsed.error.message }, "Invalid document body");
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const values = bodyToRow(bodyParsed.data, paramsParsed.data.id);
  const { id: _id, ...updateValues } = values;

  const [row] = await db
    .update(documentsTable)
    .set(updateValues)
    .where(eq(documentsTable.id, paramsParsed.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  res.json(UpdateDocumentResponse.parse(rowToApi(row)));
});

router.delete("/documents/:id", async (req, res): Promise<void> => {
  const paramsParsed = DeleteDocumentParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .delete(documentsTable)
    .where(eq(documentsTable.id, paramsParsed.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
