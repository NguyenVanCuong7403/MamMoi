export default class TreeVariety {
  constructor({
    varietyId,
    treeTypeId,
    treeTypeName,
    varietyName,
    varietyDescription,
  }) {
    this.varietyId = varietyId;
    this.treeTypeId = treeTypeId;
    this.treeTypeName = treeTypeName;
    this.varietyName = varietyName;
    this.varietyDescription = varietyDescription;
  }

  shortInfo() {
    // Nếu tên giống đã chứa tên loại (ví dụ: "Bưởi da đỏ" và loại là "Bưởi"),
    // loại bỏ phần trùng lặp để tránh hiển thị như "Bưởi Bưởi da đỏ".
    const variety = (this.varietyName || "").trim();
    const type = (this.treeTypeName || "").trim();
    if (!variety || !type) return `${variety || type}`;

    // Escape regex special chars for tree type
    const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");

    // Try to remove exact occurrences of type from variety (case-insensitive)
    try {
      const r = new RegExp(escapeRegExp(type), "iu");
      const cleaned = variety.replace(r, "").replace(/\s+/g, " ").trim();
      const displayVariety = cleaned.length > 0 ? cleaned : variety;
      return `${displayVariety} (${type})`;
    } catch (e) {
      return `${variety} (${type})`;
    }
  }

  fullInfo() {
    return `${this.varietyName} - ${
      this.varietyDescription || "No description"
    }`;
  }
}
