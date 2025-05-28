import { Route, Routes } from "react-router";
import GuestLayout from "./layouts/GuestLayout";
import AuthLayout from "./layouts/AuthLayout";
import Chat from "./pages/Chat";
import Signin from "./pages/Auth/Signin";
import Signup from "./pages/Auth/Signup";
import ChatLayout from "./layouts/ChatLayout";
import ChatMessages from "./pages/ChatMessages";
import OnBoarding from "./pages/Auth/OnBoarding";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import AudioCalling from "./pages/AudioCalling";
import VideoCalling from "./pages/VideoCalling";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route element={<GuestLayout />}>
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route element={<ChatLayout />}>
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:chatId" element={<ChatMessages />} />
        </Route>
        <Route path="/audio-call/:chatId" element={<AudioCalling />} />
        <Route path="/video-call/:chatId" element={<VideoCalling />} />
      </Route>
      <Route path="/onboarding" element={<OnBoarding />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
    </Routes>
  );
};

export default App;
