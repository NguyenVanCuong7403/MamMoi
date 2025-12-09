// Quick Actions Usage Examples
// Import the convenient functions:

import {
  addTree,
  updateTree,
  deleteTree,
  addTreeVariety,
  updateTreeVariety,
  deleteTreeVariety,
  getAllTreeVarieties,
  getTreeVarietiesByTreeType
} from '../API';

// ==========================================
// TREE VARIETY MANAGEMENT (Business Admin)
// ==========================================

// 1. Add a new tree variety
const addNewVariety = async () => {
  const result = await addTreeVariety({
    treeTypeId: 1,              // Required
    varietyName: "Golden Apple", // Required
    varietyDescription: "Sweet and juicy variety" // Optional
  });

  if (result.success) {
    console.log("✅ Variety added:", result.data);
  } else {
    console.error("❌ Error:", result.error);
  }
};

// 2. Update existing tree variety
const updateExistingVariety = async (varietyId) => {
  const result = await updateTreeVariety(varietyId, {
    treeTypeId: 1,
    varietyName: "Premium Golden Apple",
    varietyDescription: "Premium sweet and juicy variety"
  });

  if (result.success) {
    console.log("✅ Variety updated:", result.data);
  } else {
    console.error("❌ Error:", result.error);
  }
};

// 3. Delete tree variety
const removeVariety = async (varietyId) => {
  const result = await deleteTreeVariety(varietyId);

  if (result.success) {
    console.log("✅ Variety deleted");
  } else {
    console.error("❌ Error:", result.error);
  }
};

// 4. Get all tree varieties
const loadAllVarieties = async () => {
  const result = await getAllTreeVarieties();

  if (result.success) {
    console.log("✅ All varieties:", result.data);
  } else {
    console.error("❌ Error:", result.error);
  }
};

// 5. Get varieties by tree type
const loadVarietiesByType = async (treeTypeId) => {
  const result = await getTreeVarietiesByTreeType(treeTypeId);

  if (result.success) {
    console.log("✅ Varieties for type", treeTypeId, ":", result.data);
  } else {
    console.error("❌ Error:", result.error);
  }
};

// ==========================================
// TREE MANAGEMENT (Farmers/Users)
// ==========================================

// 1. Add a new tree
const addNewTree = async () => {
  const result = await addTree({
    gardenId: 1,                    // Required
    treeTypeId: 1,                  // Required
    varietyId: 5,                   // Optional
    treeName: "My Apple Tree",      // Required
    description: "Planted in backyard", // Optional
    plantDate: "2025-11-21T00:00:00Z" // Optional, ISO date string
  });

  if (result.success) {
    console.log("✅ Tree added:", result.data);
  } else {
    console.error("❌ Error:", result.error);
  }
};

// 2. Update existing tree
const updateExistingTree = async (treeId) => {
  const result = await updateTree(treeId, {
    treeName: "Updated Apple Tree",
    description: "Updated description",
    varietyId: 6 // Change variety
  });

  if (result.success) {
    console.log("✅ Tree updated:", result.data);
  } else {
    console.error("❌ Error:", result.error);
  }
};

// 3. Delete tree
const removeTree = async (treeId) => {
  const result = await deleteTree(treeId);

  if (result.success) {
    console.log("✅ Tree deleted");
  } else {
    console.error("❌ Error:", result.error);
  }
};

// ==========================================
// REACT COMPONENT EXAMPLE
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  addTreeVariety,
  getAllTreeVarieties,
  deleteTreeVariety,
  addTree,
  updateTree,
  deleteTree
} from '../API';

function TreeManagement() {
  const [varieties, setVarieties] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load varieties on mount
  useEffect(() => {
    loadVarieties();
  }, []);

  const loadVarieties = async () => {
    setLoading(true);
    const result = await getAllTreeVarieties();
    setLoading(false);

    if (result.success) {
      setVarieties(result.data);
    } else {
      alert("Error loading varieties: " + result.error);
    }
  };

  const handleAddVariety = async () => {
    const result = await addTreeVariety({
      treeTypeId: 1,
      varietyName: "New Variety",
      varietyDescription: "Description"
    });

    if (result.success) {
      loadVarieties(); // Reload list
      alert("Variety added successfully!");
    } else {
      alert("Error: " + result.error);
    }
  };

  const handleDeleteVariety = async (id) => {
    if (!confirm("Are you sure you want to delete this variety?")) return;

    const result = await deleteTreeVariety(id);

    if (result.success) {
      loadVarieties(); // Reload list
      alert("Variety deleted successfully!");
    } else {
      alert("Error: " + result.error);
    }
  };

  const handleAddTree = async () => {
    const result = await addTree({
      gardenId: 1,
      treeTypeId: 1,
      treeName: "New Tree",
      description: "My new tree"
    });

    if (result.success) {
      alert("Tree added successfully!");
    } else {
      alert("Error: " + result.error);
    }
  };

  return (
    <div>
      <h2>Tree Management</h2>

      {/* Tree Variety Section */}
      <div>
        <h3>Tree Varieties (Business Admin)</h3>
        <button onClick={handleAddVariety}>Add New Variety</button>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {varieties.map(variety => (
              <li key={variety.varietyId}>
                {variety.varietyName} - {variety.treeTypeName}
                <button onClick={() => handleDeleteVariety(variety.varietyId)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tree Section */}
      <div>
        <h3>Trees (Farmers)</h3>
        <button onClick={handleAddTree}>Add New Tree</button>
      </div>
    </div>
  );
}

export default TreeManagement;