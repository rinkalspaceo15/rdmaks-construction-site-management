import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import SitesList from './pages/SitesList';
import SiteDetail from './pages/SiteDetail';
import Workers from './pages/Workers';
import Attendance from './pages/Attendance';
import Materials from './pages/Materials';
import Expenses from './pages/Expenses';
import DailyReports from './pages/DailyReports';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 pt-16 md:pt-6 md:ml-64">
        {children}
      </main>
    </div>
  );
}

function App() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/app" element={<Dashboard />} />
        <Route path="/sites" element={<SitesList />} />
        <Route path="/sites/:id" element={<SiteDetail />} />
        <Route path="/workers" element={<Workers />} />
        <Route path="/sites/:id/attendance" element={<Attendance />} />
        <Route path="/sites/:id/materials" element={<Materials />} />
        <Route path="/sites/:id/expenses" element={<Expenses />} />
        <Route path="/sites/:id/reports" element={<DailyReports />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
