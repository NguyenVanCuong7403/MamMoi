import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthScreen from "./components/auth/AuthScreen";
import AddTreeNewScreen from "./components/user/AddTreeNewScreen";
import CareFlowEditablePreview from "./components/user/CareFlowEditablePreview";
import EditTreeBasic from "./components/user/EditTreeBasic";
import TreeManagement from "./components/user/TreeManagement";
import TreeDetail from "./components/user/TreeDetail";
import Home from "./components/user/Home";

export default function RouteManager() {
  return (
    <Routes>
      <Route path="/login" element={<AuthScreen />} />
      <Route path="/new" element={<AddTreeNewScreen />} />
      <Route path="/preview" element={<CareFlowEditablePreview />} />
      <Route path="/edit" element={<EditTreeBasic />} />
      <Route path="/tree" element={<TreeManagement />} />
      <Route path="/treedetail" element={<TreeDetail />} />
      <Route path="/" element={<Home />} />
      {/* catch-all 404 */}
      <Route path="*" element={<h2>404 - Page Not Found</h2>} />
    </Routes>
  );
}
