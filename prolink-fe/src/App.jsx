import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterForm from "./components/RegisterForm.jsx";
import LoginForm from "./components/LoginForm.jsx";
import CreateProfileForm from "./components/CreateProfileForm.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import FeedPage from "./components/FeedPage.jsx";
import PostHistoryPage from "./components/PostHistoryPage.jsx";
import NetworkPage from "./components/NetworkPage.jsx";
import ChatPage from "./components/ChatPage.jsx";
import "./App.css";

function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<RegisterForm />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/profile/create" element={<CreateProfileForm />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/posts" element={<PostHistoryPage />} />
              <Route path="/network" element={<NetworkPage />} />
              <Route path="/chat/:profileId" element={<ChatPage />} />
          </Routes>
      </BrowserRouter>
  );
}

export default App;