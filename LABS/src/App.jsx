import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Lab1 from "./pages/Lab1.jsx";
import Lab2 from "./pages/Lab2.jsx";
import Lab3 from "./pages/Lab3.jsx";
import Lab56 from "./pages/Lab56.jsx";
import Lab7 from "./pages/Lab7.jsx";
import Lab8 from "./pages/Lab8.jsx";
import Lab8App from "./lab8/Lab8App.jsx";
import { MERN } from "./admissions/backends.js";
import AdmissionsApp from "./admissions/AdmissionsApp.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/lab-1" element={<Lab1 />} />
      <Route path="/lab-2" element={<Lab2 />} />
      <Route path="/lab-3-4" element={<Lab3 />} />
      <Route path="/lab-3" element={<Lab3 />} />
      <Route path="/lab-5-6" element={<Lab56 />} />
      <Route path="/lab-5-6/app" element={<AdmissionsApp standalone />} />
      <Route path="/lab-7" element={<Lab7 />} />
      <Route path="/lab-7/app" element={<AdmissionsApp standalone backend={MERN} />} />
      <Route path="/lab-8" element={<Lab8 />} />
      <Route path="/lab-8/app/*" element={<Lab8App />} />
    </Routes>
  );
}
