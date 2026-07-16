import { Router, type IRouter } from "express";
import { db, companySettingsTable } from "@workspace/db";
import {
  GetCompanySettingsResponse,
  UpdateCompanySettingsBody,
  UpdateCompanySettingsResponse,
} from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function rowToApi(row: typeof companySettingsTable.$inferSelect) {
  return {
    name: row.name,
    cnpj: row.cnpj,
    phone: row.phone,
    email: row.email,
    address: row.address,
    website: row.website ?? null,
    logoText: row.logoText ?? null,
  };
}

router.get("/company-settings", async (req, res): Promise<void> => {
  const rows = await db.select().from(companySettingsTable).limit(1);
  if (rows.length === 0) {
    // Return default if not yet set
    const defaultSettings = GetCompanySettingsResponse.parse({
      name: "Minha Empresa",
      cnpj: "00.000.000/0001-00",
      phone: "(00) 00000-0000",
      email: "contato@minhaempresa.com",
      address: "Endereço da Empresa, 000 - Cidade, UF",
      website: null,
      logoText: null,
    });
    res.json(defaultSettings);
    return;
  }
  res.json(GetCompanySettingsResponse.parse(rowToApi(rows[0])));
});

router.put("/company-settings", async (req, res): Promise<void> => {
  const parsed = UpdateCompanySettingsBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid company settings body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, cnpj, phone, email, address, website, logoText } = parsed.data;

  const rows = await db.select().from(companySettingsTable).limit(1);

  let row: typeof companySettingsTable.$inferSelect;
  if (rows.length === 0) {
    const [inserted] = await db
      .insert(companySettingsTable)
      .values({ name, cnpj, phone, email, address, website: website ?? undefined, logoText: logoText ?? undefined })
      .returning();
    row = inserted;
  } else {
    const [updated] = await db
      .update(companySettingsTable)
      .set({ name, cnpj, phone, email, address, website: website ?? undefined, logoText: logoText ?? undefined })
      .where(eq(companySettingsTable.id, rows[0].id))
      .returning();
    row = updated;
  }

  res.json(UpdateCompanySettingsResponse.parse(rowToApi(row)));
});

export default router;
