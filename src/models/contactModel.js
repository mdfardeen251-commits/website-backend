import { query } from "../db/pool.js";

export const ContactModel = {
  create({ name, email, phone, subject, message }) {
    return query(
      `INSERT INTO contacts (name, email, phone, subject, message)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, email, phone ?? null, subject ?? null, message]
    ).then((r) => r.rows[0]);
  },

  findAll({ limit = 100, offset = 0, unreadOnly = false } = {}) {
    const where = unreadOnly ? "WHERE is_read = false" : "";
    return query(
      `SELECT * FROM contacts ${where} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    ).then((r) => r.rows);
  },

  findById(id) {
    return query("SELECT * FROM contacts WHERE id = $1", [id]).then((r) => r.rows[0]);
  },

  markRead(id, isRead = true) {
    return query("UPDATE contacts SET is_read = $1 WHERE id = $2 RETURNING *", [isRead, id]).then(
      (r) => r.rows[0]
    );
  },

  delete(id) {
    return query("DELETE FROM contacts WHERE id = $1", [id]);
  },

  countUnread() {
    return query("SELECT COUNT(*) AS count FROM contacts WHERE is_read = false").then((r) =>
      Number(r.rows[0].count)
    );
  },

  countAll() {
    return query("SELECT COUNT(*) AS count FROM contacts").then((r) => Number(r.rows[0].count));
  },
};

export default ContactModel;
