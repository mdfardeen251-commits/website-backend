import { z } from "zod";
import ContentModel from "../models/contentModel.js";

const contentSchema = z.object({
  section: z.string().min(1).max(100),
  key: z.string().min(1).max(100).optional(),
  value: z.string(),
});

/** GET /api/content — public: list all content for website */
export async function listContent(req, res, next) {
  try {
    const items = await ContentModel.findAll();
    res.json({ content: items });
  } catch (err) {
    next(err);
  }
}

/** GET /api/content/:section — public: get one content block */
export async function getContent(req, res, next) {
  try {
    const item = await ContentModel.findBySection(req.params.section);
    if (!item) return res.status(404).json({ error: "Content not found" });
    res.json({ content: item });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/admin/content/:section — admin: create or update */
export async function upsertContent(req, res, next) {
  try {
    const { section } = req.params;
    const { key = section, value } = contentSchema.parse({ ...req.body, section });
    const item = await ContentModel.upsert({ section, key, value });
    res.json({ content: item });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/admin/content/:section — admin: delete */
export async function deleteContent(req, res, next) {
  try {
    await ContentModel.delete(req.params.section);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export default { listContent, getContent, upsertContent, deleteContent };
