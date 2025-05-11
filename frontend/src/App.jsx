// frontend/src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { store } from "./redux/store";
import Navbar from "./components/layout/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Auth from "./pages/Auth/AuthForm";
import ResetPassword from "./pages/Auth/ResetPassword";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import Profile from "./pages/Profile/Profile";
import CoursePage from "./pages/Course/CoursePage";
import CourseDetail from "./pages/Course/CourseDetail";
import MyCourses from "./pages/Course/MyCourses";
import EditCourse from "./pages/Course/EditCourse";
import PaymentPage from "./pages/Course/PaymentPage";
// import StudyCorner from "./pages/StudyCorner/StudyCorner";
// import StudyRoom from "./pages/StudyRoom/StudyRoom";
// import CreateExam from "./pages/Exams/CreateExam";
// import ExamList from "./pages/Exams/ExamList";
// import TakeExam from "./pages/Exams/TakeExam";
// import AdminDashboard from "./pages/Admin/AdminDashboard";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { refreshUser } from "./redux/slices/authSlice";

const AppContent = () => {
  const dispatch = useDispatch();
  const { user, token, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user && !loading) {
      dispatch(refreshUser());
    } else if (!token) {
      console.log("No token available, skipping refreshUser");
    }
  }, [dispatch, user, token, loading]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/:type" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/users/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/courses" element={<CoursePage />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/courses/my-courses" element={<MyCourses />} />
        <Route path="/courses/edit/:id" element={<EditCourse />} />
        <Route path="/payment/:id" element={<PaymentPage />} />
        {/* <Route path="/exam" element={<TakeExam />} /> */}
        {/* <Route path="/exam" element={<CreateExam />} /> */}
        {/* <Route path="/exam" element={<ExamList />} /> */}
        {/* <Route path="/study-corner" element={<StudyCorner />} /> */}
        {/* <Route path="/study-room" element={<StudyRoom />} /> */}
        {/* <Route path="/admin" element={<AdminDashboard />} /> */}
      </Routes>
      <ToastContainer />
    </>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
