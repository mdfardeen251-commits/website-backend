import { query } from "../db/pool.js";

export const LeadModel = {
  create({ name, email, phone, company, service, budget, message }) {
    return query(
      `INSERT INTO leads (name, email, phone, company, service, budget, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, email, phone ?? null, company ?? null, service ?? null, budget ?? null, message ?? null]
    ).then((r) => r.rows[0]);
  },

  findAll({ limit = 100, offset = 0 } = {}) {
    return query(
      `SELECT * FROM leads ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    ).then((r) => r.rows);
  },

  findById(id) {
    return query("SELECT * FROM leads WHERE id = $1", [id]).then((r) => r.rows[0]);
  },

  updateStatus(id, status) {
    return query("UPDATE leads SET status = $1 WHERE id = $2 RETURNING *", [status, id]).then(
      (r) => r.rows[0]
    );
  },

  delete(id) {
    return query("DELETE FROM leads WHERE id = $1", [id]);
  },

  countByStatus(status) {
    return query("SELECT COUNT(*) AS count FROM leads WHERE status = $1", [status]).then((r) =>
      Number(r.rows[0].count)
    );
  },

  countAll() {
    return query("SELECT COUNT(*) AS count FROM leads").then((r) => Number(r.rows[0].count));
  },
};

export default LeadModel;
