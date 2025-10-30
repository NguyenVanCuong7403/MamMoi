import ApiClient from "../ApiClient";
import Tree from "../models/Tree";

export default class TreeRepository {
  static async getAll() {
    const data = await ApiClient.get("/api/trees");
    return data.map((t) => new Tree(t));
  }

  static async getById(id) {
    const data = await ApiClient.get(`/api/trees/${id}`);
    return new Tree(data);
  }

  static async create(tree) {
    const data = await ApiClient.post("/api/trees", tree);
    return new Tree(data);
  }

  static async update(id, tree) {
    await ApiClient.put(`/api/trees/${id}`, tree);
  }

  static async delete(id) {
    await ApiClient.delete(`/api/trees/${id}`);
  }
}
