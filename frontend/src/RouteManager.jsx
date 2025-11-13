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
// Đảm bảo tên file khớp chữ hoa-thường
import Payment_History from "./components/user/Payment_History";
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
      <Route path="/demo" element={<Demo />} />
      
      {/* Garden list/management */}
      <Route path="/garden" element={<GardenManagement />} />
      {/* (tuỳ cách implement) nếu điều hướng theo path riêng cho form: */}
      {/* <Route path="/garden/new" element={<GardenManagement mode="create" />} /> */}
      {/* <Route path="/garden/:gardenId/edit" element={<GardenManagement mode="edit" />} /> */}

      {/* Trees (độc lập) */}
<Route path="/tree" element={<TreeManagement />} />
<Route path="/tree_detail/:id" element={<TreeDetail />} />

{/* Trees trong 1 garden */}
<Route path="/garden/:gardenId/trees" element={<TreeManagement />} />
<Route path="/garden/:gardenId/trees/:treeId" element={<TreeDetail />} />

      {/* Guards */}
      <Route
        path="/login-test"
        element={
          <LoginGuard>
            <TreeManagement />
          </LoginGuard>
        }
      />

      <Route
        path="/admin"
        element={
          <RoleGuard roles={["Admin"]}>
            <h2>Admin Dashboard</h2>
          </RoleGuard>
        }
      />

      <Route path="/profile" element={<UserProfile />} />
      <Route path="/paymenthistory" element={<Payment_History />} />

      {/* 404 */}
      <Route path="*" element={<h2>404 - Page Not Found</h2>} />
    </Routes>
  );
}
