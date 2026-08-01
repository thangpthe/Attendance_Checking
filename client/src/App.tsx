import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'
import LoginPage        from './pages/LoginPage'
import DashboardPage    from './pages/DashboardPage'
import KioskPage        from './pages/KioskPage'
import HistoryPage      from './pages/HistoryPage'
import EmployeesPage    from './pages/EmployeesPage'
import CheckinPage      from './pages/CheckinPage'
import MyAttendancePage from './pages/MyAttendancePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/kiosk" element={<KioskPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/checkin" element={<ProtectedRoute><CheckinPage /></ProtectedRoute>} />
        <Route path="/my-attendance" element={<ProtectedRoute><MyAttendancePage /></ProtectedRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute adminOnly><DashboardPage /></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute adminOnly><EmployeesPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute adminOnly><HistoryPage /></ProtectedRoute>} />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}