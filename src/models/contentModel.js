import { query } from "../db/pool.js";

export const ContentModel = {
  upsert({ section, key, value }) {
    return query(
      `INSERT INTO content (section, key, value)
       VALUES ($1, $2, $3)
       ON CONFLICT (section) DO UPDATE SET key = $2, value = $3, updated_at = now()
       RETURNING *`,
      [section, key, value]
    ).then((r) => r.rows[0]);
  },

  findBySection(section) {
    return query("SELECT * FROM content WHERE section = $1", [section]).then((r) => r.rows[0]);
  },

  findAll() {
    return query("SELECT * FROM content ORDER BY section").then((r) => r.rows);
  },

  delete(section) {
    return query("DELETE FROM content WHERE section = $1", [section]);
  },
};

export default ContentModel;
