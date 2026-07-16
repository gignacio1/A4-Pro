import { Router, type IRouter } from "express";
import { db, clientsTable } from "@workspace/db";
import {
  ListClientsResponse,
  CreateClientBody,
  CreateClientResponse,
  UpdateClientBody,
  UpdateClientParams,
  UpdateClientResponse,
  DeleteClientParams,
} from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router: IRouter = Router();

function rowToApi(row: typeof clientsTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    document: row.document,
    phone: row.phone,
    email: row.email,
    address: row.address,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/clients", async (_req, res): Promise<void> => {
  const rows = await db.select().from(clientsTable).orderBy(clientsTable.createdAt);
  res.json(ListClientsResponse.parse(rows.map(rowToApi)));
});

router.post("/clients", async (req, res): Promise<void> => {
  const parsed = CreateClientBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid client body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, document, phone, email, address } = parsed.data;
  const [row] = await db
    .insert(clientsTable)
    .values({ id: randomUUID(), name, document, phone, email, address })
    .returning();

  res.status(201).json(CreateClientResponse.parse(rowToApi(row)));
});

router.put("/clients/:id", async (req, res): Promise<void> => {
  const paramsParsed = UpdateClientParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const bodyParsed = UpdateClientBody.safeParse(req.body);
  if (!bodyParsed.success) {
    req.log.warn({ errors: bodyParsed.error.message }, "Invalid client body");
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const { name, document, phone, email, address } = bodyParsed.data;
  const [row] = await db
    .update(clientsTable)
    .set({ name, document, phone, email, address })
    .where(eq(clientsTable.id, paramsParsed.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  res.json(UpdateClientResponse.parse(rowToApi(row)));
});

router.delete("/clients/:id", async (req, res): Promise<void> => {
  const paramsParsed = DeleteClientParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .delete(clientsTable)
    .where(eq(clientsTable.id, paramsParsed.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
