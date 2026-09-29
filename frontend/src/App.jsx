import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Static/Home";
import Contact from "./pages/Static/Contact";
import Policy from "./pages/Static/Policy";
import Terms from "./pages/Static/Terms";
import NotFound from "./pages/Error/404";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import Dashboard from "./pages/employee/Dashboard";
import Profile from "./pages/employee/Profile";
import Onboarding from "./pages/employee/Onboarding";
import OnboardingPlan from "./pages/employee/OnboardingPlan";
import Module from "./pages/employee/Module";
import Task from "./pages/employee/Task";
import Assessment from "./pages/employee/Assessment";
import Progress from "./pages/employee/Progress";
import Notifications from "./pages/employee/Notifications";

import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/users/Users";
import CreateUser from "./pages/admin/users/CreateUser";
import UserDetails from "./pages/admin/users/UserDetails";
import Roles from "./pages/admin/roles/Roles";
import CreateRoles from "./pages/admin/roles/CreateRoles";
import RoleDetails from "./pages/admin/roles/RoleDetails";
import Documents from "./pages/admin/documents/Documents";
import UploadDocuments from "./pages/admin/documents/UploadDocuments";
import DocumentDetails from "./pages/admin/documents/DocumentDetails";
import Requirements from "./pages/admin/requirements/Requirements";
import CreateRequirement from "./pages/admin/requirements/CreateRequirement";
import RequirementDetails from "./pages/admin/requirements/RequirementDetails";
import RoleMatrix from "./pages/admin/RoleMatrix";
import Plans from "./pages/admin/plans/Plans";
import PlanDetails from "./pages/admin/plans/PlanDetails";
import ScoreAssessment from "./pages/admin/plans/ScoreAssessment";
import Validation from "./pages/admin/Validation";
import Reviews from "./pages/admin/reviews/Reviews";
import ReviewDetails from "./pages/admin/reviews/ReviewDetails";
import PolicyImpact from "./pages/admin/PolicyImpact";
import AuditLogs from "./pages/admin/AuditLogs";
import Settings from "./pages/admin/Settings";
import Reports from "./pages/admin/Reports";

const employeeRoles = ["admin", "training_manager", "reviewer", "manager", "employee"];
const adminRoles = ["admin"];
const managerRoles = ["admin", "training_manager"];

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={3200}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss={false}
          draggable={false}
          pauseOnHover
          theme="light"
          toastClassName="!bg-white !text-charcoal !border !border-cream-200 !rounded-sm !shadow-sm !font-sans !text-sm"
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/terms" element={<Terms />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={employeeRoles}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={employeeRoles}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute roles={employeeRoles}>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/:planId"
            element={
              <ProtectedRoute roles={employeeRoles}>
                <OnboardingPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/:planId/module/:moduleId"
            element={
              <ProtectedRoute roles={employeeRoles}>
                <Module />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/:planId/task/:taskId"
            element={
              <ProtectedRoute roles={employeeRoles}>
                <Task />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/:planId/assessment/:assessmentId"
            element={
              <ProtectedRoute roles={employeeRoles}>
                <Assessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute roles={employeeRoles}>
                <Progress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute roles={employeeRoles}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={managerRoles}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={adminRoles}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/new"
            element={
              <ProtectedRoute roles={adminRoles}>
                <CreateUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:userId"
            element={
              <ProtectedRoute roles={adminRoles}>
                <UserDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/roles"
            element={
              <ProtectedRoute roles={managerRoles}>
                <Roles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/roles/new"
            element={
              <ProtectedRoute roles={adminRoles}>
                <CreateRoles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/roles/:roleId"
            element={
              <ProtectedRoute roles={managerRoles}>
                <RoleDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/documents"
            element={
              <ProtectedRoute roles={managerRoles}>
                <Documents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/documents/upload"
            element={
              <ProtectedRoute roles={managerRoles}>
                <UploadDocuments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/documents/:documentId"
            element={
              <ProtectedRoute roles={managerRoles}>
                <DocumentDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/requirements"
            element={
              <ProtectedRoute roles={managerRoles}>
                <Requirements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/requirements/new"
            element={
              <ProtectedRoute roles={managerRoles}>
                <CreateRequirement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/requirements/:requirementId"
            element={
              <ProtectedRoute roles={managerRoles}>
                <RequirementDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/role-matrix"
            element={
              <ProtectedRoute roles={managerRoles}>
                <RoleMatrix />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/plans"
            element={
              <ProtectedRoute roles={managerRoles}>
                <Plans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/plans/:planId"
            element={
              <ProtectedRoute roles={managerRoles}>
                <PlanDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/plans/:planId/assessments/:assessmentId/score"
            element={
              <ProtectedRoute roles={managerRoles}>
                <ScoreAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/validation"
            element={
              <ProtectedRoute roles={managerRoles}>
                <Validation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute roles={managerRoles}>
                <Reviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews/:reviewId"
            element={
              <ProtectedRoute roles={managerRoles}>
                <ReviewDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/policy-impact"
            element={
              <ProtectedRoute roles={managerRoles}>
                <PolicyImpact />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute roles={adminRoles}>
                <AuditLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute roles={managerRoles}>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute roles={adminRoles}>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
