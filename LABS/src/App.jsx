import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Lab1 from "./pages/Lab1.jsx";
import Lab2 from "./pages/Lab2.jsx";
import Lab3 from "./pages/Lab3.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/lab-1" element={<Lab1 />} />
      <Route path="/lab-2" element={<Lab2 />} />
      <Route path="/lab-3" element={<Lab3 />} />
    </Routes>
  );
}
