import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterForm from "./components/RegisterForm.jsx";
import LoginForm from "./components/LoginForm.jsx";
import CreateProfileForm from "./components/CreateProfileForm.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import "./App.css";

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
            <Route path="/profile/create" element={<CreateProfileForm />} />
            <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;