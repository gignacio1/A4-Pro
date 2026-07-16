import { Router, type IRouter } from "express";
import healthRouter from "./health";
import companySettingsRouter from "./company-settings";
import clientsRouter from "./clients";
import productsRouter from "./products";
import servicesRouter from "./services";
import documentsRouter from "./documents";

const router: IRouter = Router();

router.use(healthRouter);
router.use(companySettingsRouter);
router.use(clientsRouter);
router.use(productsRouter);
router.use(servicesRouter);
router.use(documentsRouter);

export default router;
