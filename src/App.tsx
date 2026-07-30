import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'
import LoginPage     from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import KioskPage     from './pages/KioskPage'
import CheckinPage   from './pages/CheckinPage'
import HistoryPage   from './pages/HistoryPage'
import EmployeesPage from './pages/EmployeesPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/dashboard" element={
          <ProtectedRoute adminOnly><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/kiosk" element={
          <ProtectedRoute adminOnly><KioskPage /></ProtectedRoute>
        } />
        <Route path="/employees" element={
          <ProtectedRoute adminOnly><EmployeesPage /></ProtectedRoute>
        } />

        <Route path="/checkin" element={
          <ProtectedRoute><CheckinPage /></ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute><HistoryPage /></ProtectedRoute>
        } />

        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/"          replace />} />
      </Routes>
    </BrowserRouter>
  )
}
