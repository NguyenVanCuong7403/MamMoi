export default class Tree {
  constructor({ treeId, treeName, description, ownerId }) {
    this.treeId = treeId;
    this.treeName = treeName;
    this.description = description;
    this.ownerId = ownerId;
  }

  shortInfo() {
    return `${this.treeName} - Owner #${this.ownerId}`;
  }
}
