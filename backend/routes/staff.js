import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { list, create, update, remove } from "../controllers/resourceController.js";

const router = express.Router();
router.use(authenticateToken);

router.get("/", list("staff"));
router.post("/", create("staff"));
router.put("/:id", update("staff"));
router.delete("/:id", remove("staff"));

export default router;
