import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import {
  ListProductsResponse,
  CreateProductBody,
  CreateProductResponse,
  UpdateProductBody,
  UpdateProductParams,
  UpdateProductResponse,
  DeleteProductParams,
} from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router: IRouter = Router();

function rowToApi(row: typeof productsTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    unit: row.unit,
  };
}

router.get("/products", async (_req, res): Promise<void> => {
  const rows = await db.select().from(productsTable);
  res.json(ListProductsResponse.parse(rows.map(rowToApi)));
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid product body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, description, price, unit } = parsed.data;
  const [row] = await db
    .insert(productsTable)
    .values({ id: randomUUID(), name, description, price: String(price), unit })
    .returning();

  res.status(201).json(CreateProductResponse.parse(rowToApi(row)));
});

router.put("/products/:id", async (req, res): Promise<void> => {
  const paramsParsed = UpdateProductParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const bodyParsed = UpdateProductBody.safeParse(req.body);
  if (!bodyParsed.success) {
    req.log.warn({ errors: bodyParsed.error.message }, "Invalid product body");
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const { name, description, price, unit } = bodyParsed.data;
  const [row] = await db
    .update(productsTable)
    .set({ name, description, price: String(price), unit })
    .where(eq(productsTable.id, paramsParsed.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(UpdateProductResponse.parse(rowToApi(row)));
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const paramsParsed = DeleteProductParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .delete(productsTable)
    .where(eq(productsTable.id, paramsParsed.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
