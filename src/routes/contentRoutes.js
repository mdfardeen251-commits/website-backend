import { Router } from "express";
import { listContent, getContent } from "../controllers/contentController.js";

const router = Router();

// Public read endpoints — website can fetch content
router.get("/", listContent);
router.get("/:section", getContent);

export default router;
