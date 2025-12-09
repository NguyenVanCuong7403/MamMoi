import React, { createContext, useContext, useState, useCallback } from "react";
import TreeTypeRepository from "../repositories/TreeTypeRepository";
import TreeType from "../models/TreeType";

const BusinessAdminContext = createContext(null);

export const BusinessAdminProvider = ({ children }) => {
  const [treeTypes, setTreeTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tree Type Management
  const fetchTreeTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await TreeTypeRepository.getAllTreeTypes();
      const types = response.data.map(t => new TreeType(t));
      setTreeTypes(types);
      return types;
    } catch (err) {
      setError(err.message || "Failed to fetch tree types");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTreeTypeById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await TreeTypeRepository.getTreeTypeById(id);
      return new TreeType(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch tree type");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTreeType = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await TreeTypeRepository.createTreeType(data);
      const newType = new TreeType(response.data);
      setTreeTypes(prev => [...prev, newType]);
      return newType;
    } catch (err) {
      setError(err.message || "Failed to create tree type");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTreeType = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await TreeTypeRepository.updateTreeType(id, data);
      const updatedType = new TreeType(response.data);
      setTreeTypes(prev =>
        prev.map(t => t.treeTypeId === id ? updatedType : t)
      );
      return updatedType;
    } catch (err) {
      setError(err.message || "Failed to update tree type");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTreeType = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await TreeTypeRepository.deleteTreeType(id);
      setTreeTypes(prev => prev.filter(t => t.treeTypeId !== id));
      return true;
    } catch (err) {
      setError(err.message || "Failed to delete tree type");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    // State
    treeTypes,
    loading,
    error,

    // Tree Type Actions
    fetchTreeTypes,
    getTreeTypeById,
    createTreeType,
    updateTreeType,
    deleteTreeType,
    clearError,
  };

  return (
    <BusinessAdminContext.Provider value={value}>
      {children}
    </BusinessAdminContext.Provider>
  );
};

export const useBusinessAdmin = () => {
  const context = useContext(BusinessAdminContext);
  if (!context) {
    throw new Error("useBusinessAdmin must be used within a BusinessAdminProvider");
  }
  return context;
};

export default BusinessAdminContext;