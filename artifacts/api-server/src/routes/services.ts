import { Router, type IRouter } from "express";
import { db, servicesTable } from "@workspace/db";
import {
  ListServicesResponse,
  CreateServiceBody,
  CreateServiceResponse,
  UpdateServiceBody,
  UpdateServiceParams,
  UpdateServiceResponse,
  DeleteServiceParams,
} from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router: IRouter = Router();

function rowToApi(row: typeof servicesTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    category: row.category ?? null,
  };
}

router.get("/services", async (_req, res): Promise<void> => {
  const rows = await db.select().from(servicesTable);
  res.json(ListServicesResponse.parse(rows.map(rowToApi)));
});

router.post("/services", async (req, res): Promise<void> => {
  const parsed = CreateServiceBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid service body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, description, price, category } = parsed.data;
  const [row] = await db
    .insert(servicesTable)
    .values({ id: randomUUID(), name, description, price: String(price), category: category ?? undefined })
    .returning();

  res.status(201).json(CreateServiceResponse.parse(rowToApi(row)));
});

router.put("/services/:id", async (req, res): Promise<void> => {
  const paramsParsed = UpdateServiceParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const bodyParsed = UpdateServiceBody.safeParse(req.body);
  if (!bodyParsed.success) {
    req.log.warn({ errors: bodyParsed.error.message }, "Invalid service body");
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const { name, description, price, category } = bodyParsed.data;
  const [row] = await db
    .update(servicesTable)
    .set({ name, description, price: String(price), category: category ?? undefined })
    .where(eq(servicesTable.id, paramsParsed.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Service not found" });
    return;
  }

  res.json(UpdateServiceResponse.parse(rowToApi(row)));
});

router.delete("/services/:id", async (req, res): Promise<void> => {
  const paramsParsed = DeleteServiceParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .delete(servicesTable)
    .where(eq(servicesTable.id, paramsParsed.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Service not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
