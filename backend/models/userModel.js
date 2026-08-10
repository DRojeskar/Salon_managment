import { findUserByEmail as findByEmailDb, saveUser as saveUserDb } from "../db.js";

export const UserModel = {
  findByEmail(email) {
    return findByEmailDb(email);
  },
  save(user) {
    return saveUserDb(user);
  },
};
