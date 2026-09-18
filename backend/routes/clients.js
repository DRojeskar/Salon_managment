import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import * as clientsController from "../controllers/clientsController.js";
import { resolveTenant } from "../middleware/tenantMiddleware.js";

const router = express.Router();
router.use(authenticateToken);
router.use(resolveTenant);

router.get("/", clientsController.list);

export default router;
