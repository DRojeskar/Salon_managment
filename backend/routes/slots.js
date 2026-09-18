import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { list, create, update, remove } from "../controllers/resourceController.js";

import { resolveTenant } from "../middleware/tenantMiddleware.js";

const router = express.Router();
router.use(authenticateToken);
router.use(resolveTenant);

router.get("/", list("slots"));
router.post("/", create("slots"));
router.put("/:id", update("slots"));
router.delete("/:id", remove("slots"));

export default router;
