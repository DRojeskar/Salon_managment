import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import * as clientsController from "../controllers/clientsController.js";

const router = express.Router();
router.use(authenticateToken);

router.get("/", clientsController.list);

export default router;
