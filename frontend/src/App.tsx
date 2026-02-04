import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import TeacherDashboardNew from "./pages/TeacherDashboardNew";
import StudentDashboard from "./pages/StudentDashboard";
import CourseDetail from "./pages/CourseDetail";
import TeacherCourseDetail from "./pages/TeacherCourseDetail";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { SessionProvider } from "./context/SessionContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* SecurityOverlay removed - relying on VDCipher DRM */}
      <BrowserRouter>
        {/* SessionProvider handles Socket.io connection for real-time session management */}
        <SessionProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/teacher" element={<TeacherDashboardNew />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />
            <Route path="/teacher/course/:courseId" element={<TeacherCourseDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

