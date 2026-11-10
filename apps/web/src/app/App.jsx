import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout.jsx';
import { AuthPage } from '../pages/AuthPage.jsx';
import { BugDetailPage } from '../pages/BugDetailPage.jsx';
import { BugFormPage } from '../pages/BugFormPage.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { useSession } from './SessionContext.jsx';

function RequireSession({ children }) {
  const { token } = useSession();
  return token ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { token } = useSession();
  return token ? <Navigate to="/bugs" replace /> : children;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<GuestOnly><AuthPage /></GuestOnly>} />
        <Route path="/" element={<Navigate to="/bugs" replace />} />
        <Route path="/" element={<RequireSession><AppLayout /></RequireSession>}>
          <Route path="bugs" element={<DashboardPage />} />
          <Route path="bugs/new" element={<BugFormPage />} />
          <Route path="bugs/:bugId" element={<BugDetailPage />} />
          <Route path="bugs/:bugId/edit" element={<BugFormPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/bugs" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
