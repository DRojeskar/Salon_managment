import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { list, create, update, remove } from "../controllers/resourceController.js";

const router = express.Router();
router.use(authenticateToken);

router.get("/", list("appointments"));
router.post("/", create("appointments"));
router.put("/:id", update("appointments"));
router.delete("/:id", remove("appointments"));

export default router;
