import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import CashierDashboard from "./pages/CashierDashboard";
import ManageUsers from "./pages/Register";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import CreateOrder from "./pages/CreateOrder";
import Suppliers from "./pages/Suppliers";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Contact from "./pages/Contact";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { Roles } from "./constants/roles";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={[Roles.Admin]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/manager" element={<ProtectedRoute allowedRoles={[Roles.InventoryManager]}><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/cashier" element={<ProtectedRoute allowedRoles={[Roles.Cashier]}><CashierDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={[Roles.Admin]}><ManageUsers /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute allowedRoles={[Roles.Admin, Roles.InventoryManager]}><Products /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute allowedRoles={[Roles.Admin, Roles.InventoryManager, Roles.Cashier]}><Customers /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute allowedRoles={[Roles.Admin, Roles.Cashier]}><Orders /></ProtectedRoute>} />
          <Route path="/orders/new" element={<ProtectedRoute allowedRoles={[Roles.Admin, Roles.Cashier]}><CreateOrder /></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute allowedRoles={[Roles.Admin, Roles.InventoryManager]}><Suppliers /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute allowedRoles={[Roles.Admin, Roles.InventoryManager]}><Inventory /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute allowedRoles={[Roles.Admin, Roles.InventoryManager]}><Reports /></ProtectedRoute>} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
