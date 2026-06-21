import { Router } from "express";
import authenticate from "../middleware/auth.js";
import admin from "../controllers/adminController.js";
import { upsertContent, deleteContent } from "../controllers/contentController.js";

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// Dashboard overview
router.get("/dashboard", admin.dashboard);

// Contacts
router.get("/contacts", admin.listContacts);
router.patch("/contacts/:id", admin.markContactRead);
router.delete("/contacts/:id", admin.deleteContact);

// Leads
router.get("/leads", admin.listLeads);
router.patch("/leads/:id", admin.updateLeadStatus);
router.delete("/leads/:id", admin.deleteLead);

// Newsletter
router.get("/newsletter", admin.listNewsletter);
router.delete("/newsletter/:id", admin.deleteSubscriber);

// Content management
router.put("/content/:section", upsertContent);
router.delete("/content/:section", deleteContent);

export default router;
