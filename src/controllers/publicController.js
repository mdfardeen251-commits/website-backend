import { z } from "zod";
import ContactModel from "../models/contactModel.js";
import LeadModel from "../models/leadModel.js";
import NewsletterModel from "../models/newsletterModel.js";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Valid email is required"),
  phone: z.string().max(30).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(1, "Message is required").max(5000),
});

const leadSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Valid email is required"),
  phone: z.string().max(30).optional(),
  company: z.string().max(200).optional(),
  service: z.string().max(200).optional(),
  budget: z.string().max(100).optional(),
  message: z.string().max(5000).optional(),
});

const newsletterSchema = z.object({
  email: z.string().email("Valid email is required"),
});

/** POST /api/public/contact */
export async function submitContact(req, res, next) {
  try {
    const data = contactSchema.parse(req.body);
    const contact = await ContactModel.create(data);
    res.status(201).json({ success: true, message: "Message received", id: contact.id });
  } catch (err) {
    next(err);
  }
}

/** POST /api/public/lead */
export async function submitLead(req, res, next) {
  try {
    const data = leadSchema.parse(req.body);
    const lead = await LeadModel.create(data);
    res.status(201).json({ success: true, message: "Inquiry received", id: lead.id });
  } catch (err) {
    next(err);
  }
}

/** POST /api/public/newsletter */
export async function subscribeNewsletter(req, res, next) {
  try {
    const { email } = newsletterSchema.parse(req.body);
    await NewsletterModel.subscribe(email);
    res.status(201).json({ success: true, message: "Subscribed successfully" });
  } catch (err) {
    next(err);
  }
}

export default { submitContact, submitLead, subscribeNewsletter };
