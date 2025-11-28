import React from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import AuthScreen from "./components/auth/AuthScreen";
import AddTreeNewScreen from "./components/user/AddTreeNewScreen";
import CareFlowEditablePreview from "./components/user/CareFlowEditablePreview";
import EditTreeBasic from "./components/user/EditTreeBasic";
import TreeManagement from "./components/user/TreeManagement";
import TreeDetail from "./components/user/TreeDetail";
import Home from "./components/user/Home";
import UserProfile from "./components/user/UserProfile";
import Notifications from "./components/user/Notifications";
import Demo from "./components/user/Demo";
import Report from "./components/user/Report";
import ReportManagement from "./components/user/ReportManagement";
import PaymentHistory from "./components/user/PaymentHistory";
import LoginGuard from "./guards/LoginGuard";
import RoleGuard from "./guards/RoleGuard";
import GardenManagement from "./components/user/GardenManagement";
import MamMoiQrCheckout from "./components/user/checkout";
import InvoiceSuccess from "./components/user/InvoiceSuccess";
import PricingPage from "./components/user/PricingPage";
import SystemAdminUserManagement from "./components/admin/SystemAdmin/UserManagement";
import SystemAdminSubscriptionManagement from "./components/admin/SystemAdmin/SubscriptionManagement";
import SystemAdminSubscriptionPlanManagement from "./components/admin/SystemAdmin/SubscriptionPlanManagement";
import SystemAdminReportManagement from "./components/admin/SystemAdmin/ReportManagement";
import SystemAdminRevenueManagement from "./components/admin/SystemAdmin/RevenueManagement";
import SystemAdminNotificationManagement from "./components/admin/SystemAdmin/NotificationManagement";
import BusinessAdminTreeVarietyManagement from "./components/admin/BusinessAdmin/TreeVarietyManagement";
import BusinessAdminTreeManagement from "./components/admin/BusinessAdmin/TreeManagement";
import BusinessAdminTreeTypeManagement from "./components/admin/BusinessAdmin/TreeTypeManagement";
import BusinessAdminReportManagement from "./components/admin/BusinessAdmin/ReportManagementBA";
import BusinessAdminSoilManagement from "./components/admin/BusinessAdmin/SoilManagement";
import BusinessAdminTaskManagement from "./components/admin/BusinessAdmin/TaskManagement";
import BusinessAdminLifecycleProcessManagement from "./components/admin/BusinessAdmin/LifecycleProcessManagement";
import PlantGallery from "./components/user/PlantGallery";
import PlantDetail from "./components/user/PlantDetail";

export default function RouteManager({ authTab }) {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthScreen defaultTab={authTab} />} />
        <Route
          path="/new"
          element={
            <LoginGuard>
              <AddTreeNewScreen />
            </LoginGuard>
          }
        />
        <Route path="/preview" element={<CareFlowEditablePreview />} />
        <Route path="/edit" element={<EditTreeBasic />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/price" element={<PricingPage />} />
        <Route path="/checkout" element={
          <LoginGuard>
            <MamMoiQrCheckout />
          </LoginGuard>} />
        <Route path="/invoice" element={
          <LoginGuard>
            <InvoiceSuccess />
          </LoginGuard>} />
        <Route path="/paymenthistory" element={
        <LoginGuard>
          <PaymentHistory />
        </LoginGuard>} />
        <Route path="/plants" element={<PlantGallery />} />
        <Route path="/plants/:id" element={<PlantDetail />} />
        {/* Garden list/management */}
        <Route
          path="/garden"
          element={
            <LoginGuard>
              <GardenManagement />
            </LoginGuard>
          }
        />
        {/* (tuỳ cách implement) nếu điều hướng theo path riêng cho form: */}
        {/* <Route path="/garden/new" element={<GardenManagement mode="create" />} /> */}
        {/* <Route path="/garden/:gardenId/edit" element={<GardenManagement mode="edit" />} /> */}
        {/* Trees (độc lập) */}
        <Route
          path="/tree"
          element={
            <LoginGuard>
              <TreeManagement />
            </LoginGuard>
          }
        />
        <Route
          path="/tree_detail/:id"
          element={
            <LoginGuard>
              <TreeDetail />
            </LoginGuard>
          }
        />
        {/* Trees trong 1 garden */}
        <Route path="/garden/:gardenId/trees" element={<TreeManagement />} />
        <Route
          path="/garden/:gardenId/trees/:treeId"
          element={<TreeDetail />}
        />
        {/* Guards */}
        <Route
          path="/login-test"
          element={
            <LoginGuard>
              <TreeManagement />
            </LoginGuard>
          }
        />
        {/* Admin routes - SystemAdmin only */}
        <Route
          path="/admin/users"
          element={
            <RoleGuard roles={["SystemAdmin"]}>
              <SystemAdminUserManagement />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/subscriptions"
          element={
            <RoleGuard roles={["SystemAdmin"]}>
              <SystemAdminSubscriptionManagement />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/subscription-plans"
          element={
            <RoleGuard roles={["SystemAdmin", "BusinessAdmin"]}>
              <SystemAdminSubscriptionPlanManagement />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RoleGuard roles={["SystemAdmin"]}>
              <SystemAdminReportManagement />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/revenue"
          element={
            <RoleGuard roles={["SystemAdmin"]}>
              <SystemAdminRevenueManagement />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <RoleGuard roles={["SystemAdmin"]}>
              <SystemAdminNotificationManagement />
            </RoleGuard>
          }
        />
        {/* BusinessAdmin routes - BusinessAdmin only */}
        <Route
          path="/admin/business/reports"
          element={
            <RoleGuard roles={["BusinessAdmin"]}>
              <BusinessAdminReportManagement />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/business/tasks"
          element={
            <RoleGuard roles={["BusinessAdmin"]}>
              <BusinessAdminTaskManagement />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/business/lifecycle"
          element={
            <RoleGuard roles={["BusinessAdmin"]}>
              <BusinessAdminLifecycleProcessManagement />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/business/tree-types"
          element={
            <RoleGuard roles={["BusinessAdmin"]}>
              <BusinessAdminTreeTypeManagement />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/business/trees"
          element={
            <RoleGuard roles={["BusinessAdmin"]}>
              <BusinessAdminTreeManagement />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/business/tree-varieties"
          element={
            <RoleGuard roles={["BusinessAdmin"]}>
              <BusinessAdminTreeVarietyManagement />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/business/soils"
          element={
            <RoleGuard roles={["BusinessAdmin"]}>
              <BusinessAdminSoilManagement />
            </RoleGuard>
          }
        />
        <Route
          path="/profile"
          element={
            <LoginGuard>
              <UserProfile />
            </LoginGuard>
          }
        />
        <Route
          path="/notifications"
          element={
            <LoginGuard>
              <Notifications />
            </LoginGuard>
          }
        />
        <Route path="/report" element={<Report />} />
        <Route
          path="/reports"
          element={
            <LoginGuard>
              <ReportManagement />
            </LoginGuard>
          }
        />
        {/* 404 */}
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>
    </>
  );
}
