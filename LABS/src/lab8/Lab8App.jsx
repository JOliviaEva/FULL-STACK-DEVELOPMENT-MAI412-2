import { Link, Route, Routes } from "react-router-dom";
import Shell from "./components/Shell.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import { path } from "./config.js";
import ApplicationDetail from "./pages/ApplicationDetail.jsx";
import ApplicationEdit from "./pages/ApplicationEdit.jsx";
import Applications from "./pages/Applications.jsx";
import Campuses from "./pages/Campuses.jsx";
import Overview from "./pages/Overview.jsx";
import Programmes from "./pages/Programmes.jsx";
import Team from "./pages/Team.jsx";

function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="font-serif text-2xl font-semibold text-plum-500">Page not found</h1>
      <Link to={path.home} className="mt-3 inline-block text-sm font-medium text-plum-500 hover:underline">
        ← Back to the overview
      </Link>
    </div>
  );
}

// Mounted by the journal's router at /lab-8/app/*. Routes below are relative to that.
export default function Lab8App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Overview />} />
          <Route path="applications" element={<Applications />} />
          <Route path="applications/new" element={<ApplicationEdit />} />
          <Route path="applications/:id" element={<ApplicationDetail />} />
          <Route path="applications/:id/edit" element={<ApplicationEdit />} />
          <Route path="programmes" element={<Programmes />} />
          <Route path="campuses" element={<Campuses />} />
          <Route path="team" element={<Team />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
