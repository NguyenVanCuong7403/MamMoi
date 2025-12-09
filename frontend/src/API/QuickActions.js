import TreeRepository from "./repositories/TreeRepository";
import TreeVarietyRepository from "./repositories/TreeVarietyRepository";

/**
 * Quick Actions for Tree and Tree Variety Management
 * Convenient functions for common operations
 */
export class TreeActions {
  /**
   * Add a new tree
   * @param {Object} treeData
   * @param {number} treeData.gardenId - Required
   * @param {number} treeData.treeTypeId - Required
   * @param {number} treeData.varietyId - Optional
   * @param {string} treeData.treeName - Required
   * @param {string} treeData.description - Optional
   * @param {string} treeData.plantDate - Optional (ISO date string)
   * @param {number} userId - Optional user ID
   */
  static async addTree(treeData, userId = null) {
    try {
      const response = await TreeRepository.createTree(treeData, userId);
      return {
        success: true,
        data: response.data,
        message: "Tree added successfully"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to add tree",
        details: error
      };
    }
  }

  /**
   * Update an existing tree
   * @param {number} treeId
   * @param {Object} treeData
   * @param {number} userId - Optional user ID
   */
  static async updateTree(treeId, treeData, userId = null) {
    try {
      const response = await TreeRepository.updateTree(treeId, treeData, userId);
      return {
        success: true,
        data: response.data,
        message: "Tree updated successfully"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to update tree",
        details: error
      };
    }
  }

  /**
   * Delete a tree
   * @param {number} treeId
   * @param {number} userId - Optional user ID
   */
  static async deleteTree(treeId, userId = null) {
    try {
      await TreeRepository.deleteTree(treeId, userId);
      return {
        success: true,
        message: "Tree deleted successfully"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to delete tree",
        details: error
      };
    }
  }
}

/**
 * Quick Actions for Tree Variety Management (Business Admin)
 */
export class TreeVarietyActions {
  /**
   * Add a new tree variety
   * @param {Object} varietyData
   * @param {number} varietyData.treeTypeId - Required
   * @param {string} varietyData.varietyName - Required
   * @param {string} varietyData.varietyDescription - Optional
   */
  static async addTreeVariety(varietyData) {
    try {
      const response = await TreeVarietyRepository.createTreeVariety(varietyData);
      return {
        success: true,
        data: response.data,
        message: "Tree variety added successfully"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to add tree variety",
        details: error
      };
    }
  }

  /**
   * Update an existing tree variety
   * @param {number} varietyId
   * @param {Object} varietyData
   * @param {number} varietyData.treeTypeId - Required
   * @param {string} varietyData.varietyName - Required
   * @param {string} varietyData.varietyDescription - Optional
   */
  static async updateTreeVariety(varietyId, varietyData) {
    try {
      const response = await TreeVarietyRepository.updateTreeVariety(varietyId, varietyData);
      return {
        success: true,
        data: response.data,
        message: "Tree variety updated successfully"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to update tree variety",
        details: error
      };
    }
  }

  /**
   * Delete a tree variety
   * @param {number} varietyId
   */
  static async deleteTreeVariety(varietyId) {
    try {
      await TreeVarietyRepository.deleteTreeVariety(varietyId);
      return {
        success: true,
        message: "Tree variety deleted successfully"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to delete tree variety",
        details: error
      };
    }
  }

  /**
   * Get all tree varieties
   */
  static async getAllTreeVarieties() {
    try {
      const response = await TreeVarietyRepository.getAllTreeVarieties();
      return {
        success: true,
        data: response.data,
        message: "Tree varieties fetched successfully"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch tree varieties",
        details: error
      };
    }
  }

  /**
   * Get tree varieties by tree type
   * @param {number} treeTypeId
   */
  static async getTreeVarietiesByTreeType(treeTypeId) {
    try {
      const response = await TreeVarietyRepository.getTreeVarietiesByTreeType(treeTypeId);
      return {
        success: true,
        data: response.data,
        message: "Tree varieties fetched successfully"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch tree varieties by type",
        details: error
      };
    }
  }
}

// Convenience exports for direct import
export const addTree = TreeActions.addTree;
export const updateTree = TreeActions.updateTree;
export const deleteTree = TreeActions.deleteTree;

export const addTreeVariety = TreeVarietyActions.addTreeVariety;
export const updateTreeVariety = TreeVarietyActions.updateTreeVariety;
export const deleteTreeVariety = TreeVarietyActions.deleteTreeVariety;
export const getAllTreeVarieties = TreeVarietyActions.getAllTreeVarieties;
export const getTreeVarietiesByTreeType = TreeVarietyActions.getTreeVarietiesByTreeType;