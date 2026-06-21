import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import AdminModel from "../models/adminModel.js";
import config from "../config.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** POST /api/auth/login */
export async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const admin = await AdminModel.findByEmail(email);
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: admin.id, email: admin.email }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    res.json({
      token,
      user: { id: admin.id, email: admin.email, name: admin.name },
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/auth/me */
export async function me(req, res, next) {
  try {
    const admin = await AdminModel.findById(req.user.id);
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    res.json({ user: admin });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/change-password */
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = z
      .object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8, "New password must be at least 8 characters"),
      })
      .parse(req.body);

    const admin = await AdminModel.findByEmail(req.user.email);
    if (!admin || !bcrypt.compareSync(currentPassword, admin.password)) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashed = bcrypt.hashSync(newPassword, 10);
    await AdminModel.updatePassword(admin.id, hashed);
    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    next(err);
  }
}

export default { login, me, changePassword };
