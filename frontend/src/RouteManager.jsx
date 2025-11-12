import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthScreen from "./components/auth/AuthScreen";
import AddTreeNewScreen from "./components/user/AddTreeNewScreen";
import CareFlowEditablePreview from "./components/user/CareFlowEditablePreview";
import EditTreeBasic from "./components/user/EditTreeBasic";
import TreeManagement from "./components/user/TreeManagement";
import TreeDetail from "./components/user/TreeDetail";
import Home from "./components/user/Home";
import UserProfile from "./components/user/UserProfile";
import Demo from "./components/user/Demo";
import PaymentHistory from "./components/user/PAYMENT_HISTORY";
import LoginGuard from "./guards/LoginGuard";
import RoleGuard from "./guards/RoleGuard";
import GardenManagement from "./components/user/GardenManagement";


export default function RouteManager({ authTab }) {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
       <Route path="/auth" element={<AuthScreen defaultTab={authTab} />} />
      <Route path="/new" element={<AddTreeNewScreen />} />
      <Route path="/preview" element={<CareFlowEditablePreview />} />
      <Route path="/edit" element={<EditTreeBasic />} />
      <Route path="/tree" element={<TreeManagement />} />
      <Route path="/treedetail" element={<TreeDetail />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/paymenthistory" element={<PaymentHistory />} />
      <Route path="/garden" element={<GardenManagement />} />


      <Route path="/login-test" element={
          <LoginGuard>
            <TreeDetail />
          </LoginGuard>} 
          />
      
      {/* Example of role-based guard */}
      <Route
        path="/admin"
        element={
          <RoleGuard roles={["Admin"]}>
            <h2>Admin Dashboard</h2>
          </RoleGuard>
        } />

      {/* catch-all 404 */}
      <Route path="*" element={<h2>404 - Page Not Found</h2>} />
    </Routes>
  );
}
