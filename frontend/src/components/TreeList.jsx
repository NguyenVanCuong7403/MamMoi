import React, { useEffect, useState } from "react";
import TreeRepository from "../API/repositories/TreeRepository";

export default function TreeList() {
  const [trees, setTrees] = useState([]);

  useEffect(() => {
    TreeRepository.getAll()
      .then(setTrees)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Trees</h2>
      <ul>
        {trees.map((t) => (
          <li key={t.treeId}>{t.shortInfo()}</li>
        ))}
      </ul>
    </div>
  );
}
