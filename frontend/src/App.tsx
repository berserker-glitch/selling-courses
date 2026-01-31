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

const queryClient = new QueryClient();

import Profile from "./pages/Profile";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Toaster />
      <Sonner />
      {/* SecurityOverlay removed - relying on VDCipher DRM */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/teacher" element={<TeacherDashboardNew />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="/teacher/course/:courseId" element={<TeacherCourseDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
