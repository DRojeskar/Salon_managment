import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { list, create, update, remove } from "../controllers/resourceController.js";

import { resolveTenant } from "../middleware/tenantMiddleware.js";

const router = express.Router();
router.use(authenticateToken);
router.use(resolveTenant);

router.get("/", list("services"));
router.post("/", create("services"));
router.put("/:id", update("services"));
router.delete("/:id", remove("services"));

export default router;
