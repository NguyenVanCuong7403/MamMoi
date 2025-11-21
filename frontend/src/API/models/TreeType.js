export default class TreeType {
  constructor({
    treeTypeId,
    treeTypeName,
    scientificName,
    description,
    soilId,
    soilName,
    optimalConditions,
    careInstructions,
    createdAt,
    updatedAt
  }) {
    this.treeTypeId = treeTypeId;
    this.treeTypeName = treeTypeName;
    this.scientificName = scientificName;
    this.description = description;
    this.soilId = soilId;
    this.soilName = soilName;
    this.optimalConditions = optimalConditions;
    this.careInstructions = careInstructions;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  shortInfo() {
    return `${this.treeTypeName} (${this.scientificName})`;
  }

  fullInfo() {
    return `${this.treeTypeName} - ${this.scientificName}\n${this.description || 'No description'}`;
  }
}