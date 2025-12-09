export default class TreeVariety {
  constructor({
    varietyId,
    treeTypeId,
    treeTypeName,
    varietyName,
    varietyDescription
  }) {
    this.varietyId = varietyId;
    this.treeTypeId = treeTypeId;
    this.treeTypeName = treeTypeName;
    this.varietyName = varietyName;
    this.varietyDescription = varietyDescription;
  }

  shortInfo() {
    return `${this.varietyName} (${this.treeTypeName})`;
  }

  fullInfo() {
    return `${this.varietyName} - ${this.varietyDescription || 'No description'}`;
  }
}