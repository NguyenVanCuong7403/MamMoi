import React from "react";
import UserList from "./components/UserList";
import TreeList from "./components/TreeList";

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Mầm Mới Frontend</h1>
      <UserList />
      <TreeList />
    </div>
  );
}
