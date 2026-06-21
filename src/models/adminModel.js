import { query } from "../db/pool.js";

export const AdminModel = {
  findByEmail(email) {
    return query("SELECT * FROM admins WHERE email = $1", [email]).then((r) => r.rows[0]);
  },

  findById(id) {
    return query("SELECT id, email, name, created_at FROM admins WHERE id = $1", [id]).then((r) => r.rows[0]);
  },

  updatePassword(id, hashedPassword) {
    return query("UPDATE admins SET password = $1 WHERE id = $2", [hashedPassword, id]);
  },
};

export default AdminModel;
