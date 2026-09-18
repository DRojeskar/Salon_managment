import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { list, create, update, remove } from "../controllers/resourceController.js";
import { resolveTenant } from "../middleware/tenantMiddleware.js";

const router = express.Router();
router.use(authenticateToken);
router.use(resolveTenant);

router.get("/", list("staff"));
router.post("/", create("staff"));
router.put("/:id", update("staff"));
router.delete("/:id", remove("staff"));

export default router;
