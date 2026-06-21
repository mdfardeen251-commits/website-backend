import { query } from "../db/pool.js";

export const NewsletterModel = {
  subscribe(email) {
    // upsert — re-subscribes an unsubscribed user
    return query(
      `INSERT INTO newsletter (email, active) VALUES ($1, true)
       ON CONFLICT (email) DO UPDATE SET active = true
       RETURNING *`,
      [email]
    ).then((r) => r.rows[0]);
  },

  unsubscribe(email) {
    return query(
      "UPDATE newsletter SET active = false WHERE email = $1 RETURNING *",
      [email]
    ).then((r) => r.rows[0]);
  },

  findAll({ limit = 200, offset = 0, activeOnly = false } = {}) {
    const where = activeOnly ? "WHERE active = true" : "";
    return query(
      `SELECT * FROM newsletter ${where} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    ).then((r) => r.rows);
  },

  delete(id) {
    return query("DELETE FROM newsletter WHERE id = $1", [id]);
  },

  countActive() {
    return query("SELECT COUNT(*) AS count FROM newsletter WHERE active = true").then((r) =>
      Number(r.rows[0].count)
    );
  },
};

export default NewsletterModel;
