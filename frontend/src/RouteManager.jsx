import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthScreen from "./components/auth/AuthScreen";
import AddTreeNewScreen from "./components/user/AddTreeNewScreen";
import CareFlowEditablePreview from "./components/user/CareFlowEditablePreview";
import EditTreeBasic from "./components/user/EditTreeBasic";
import TreeManagement from "./components/user/TreeManagement";

export default function RouteManager() {
  return (
    <Routes>
      <Route path="/" element={<AuthScreen />} />
      <Route path="/new" element={<AddTreeNewScreen />} />
      <Route path="/preview" element={<CareFlowEditablePreview />} />
      <Route path="/edit" element={<EditTreeBasic />} />
      <Route path="/tree" element={<TreeManagement />} />
      {/* catch-all 404 */}
      <Route path="*" element={<h2>404 - Page Not Found</h2>} />
    </Routes>
  );
}
