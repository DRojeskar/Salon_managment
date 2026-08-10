import { createItem, deleteItem, findById, getCollection, updateItem } from "../db.js";

export const ResourceModel = {
  list(name) {
    return getCollection(name);
  },
  findById(name, id) {
    return findById(name, id);
  },
  create(name, data) {
    return createItem(name, data);
  },
  update(name, id, data) {
    return updateItem(name, id, data);
  },
  delete(name, id) {
    return deleteItem(name, id);
  },
};
