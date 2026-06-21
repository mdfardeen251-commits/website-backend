import ContactModel from "../models/contactModel.js";
import LeadModel from "../models/leadModel.js";
import NewsletterModel from "../models/newsletterModel.js";

/** GET /api/admin/dashboard — summary stats */
export async function dashboard(req, res, next) {
  try {
    const [contacts, unreadContacts, leads, newLeads, subscribers] = await Promise.all([
      ContactModel.countAll(),
      ContactModel.countUnread(),
      LeadModel.countAll(),
      LeadModel.countByStatus("new"),
      NewsletterModel.countActive(),
    ]);

    res.json({
      stats: {
        contacts,
        unreadContacts,
        leads,
        newLeads,
        subscribers,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── CONTACTS ──────────────────────────────────────────────

export async function listContacts(req, res, next) {
  try {
    const unreadOnly = req.query.unread === "true";
    const contacts = await ContactModel.findAll({ unreadOnly });
    res.json({ contacts });
  } catch (err) {
    next(err);
  }
}

export async function markContactRead(req, res, next) {
  try {
    const isRead = req.body.isRead !== false;
    const contact = await ContactModel.markRead(req.params.id, isRead);
    res.json({ contact });
  } catch (err) {
    next(err);
  }
}

export async function deleteContact(req, res, next) {
  try {
    await ContactModel.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// ─── LEADS ─────────────────────────────────────────────────

export async function listLeads(req, res, next) {
  try {
    const leads = await LeadModel.findAll();
    res.json({ leads });
  } catch (err) {
    next(err);
  }
}

export async function updateLeadStatus(req, res, next) {
  try {
    const { status } = req.body;
    const lead = await LeadModel.updateStatus(req.params.id, status);
    res.json({ lead });
  } catch (err) {
    next(err);
  }
}

export async function deleteLead(req, res, next) {
  try {
    await LeadModel.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// ─── NEWSLETTER ────────────────────────────────────────────

export async function listNewsletter(req, res, next) {
  try {
    const activeOnly = req.query.active === "true";
    const subscribers = await NewsletterModel.findAll({ activeOnly });
    res.json({ subscribers });
  } catch (err) {
    next(err);
  }
}

export async function deleteSubscriber(req, res, next) {
  try {
    await NewsletterModel.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export default {
  dashboard,
  listContacts,
  markContactRead,
  deleteContact,
  listLeads,
  updateLeadStatus,
  deleteLead,
  listNewsletter,
  deleteSubscriber,
};
