// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// import ProtectedRoute from './components/layout/ProtectedRoute'
// import LoginPage     from './pages/LoginPage'
// import DashboardPage from './pages/DashboardPage'
// import KioskPage     from './pages/KioskPage'
// import CheckinPage   from './pages/CheckinPage'
// import HistoryPage   from './pages/HistoryPage'
// import EmployeesPage from './pages/EmployeesPage'

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={<LoginPage />} />

//         <Route path="/dashboard" element={
//           <ProtectedRoute adminOnly><DashboardPage /></ProtectedRoute>
//         } />
//         <Route path="/kiosk" element={
//           <ProtectedRoute adminOnly><KioskPage /></ProtectedRoute>
//         } />
//         <Route path="/employees" element={
//           <ProtectedRoute adminOnly><EmployeesPage /></ProtectedRoute>
//         } />

//         <Route path="/checkin" element={
//           <ProtectedRoute><CheckinPage /></ProtectedRoute>
//         } />
//         <Route path="/history" element={
//           <ProtectedRoute><HistoryPage /></ProtectedRoute>
//         } />

//         <Route path="/"  element={<Navigate to="/dashboard" replace />} />
//         <Route path="*"  element={<Navigate to="/"          replace />} />
//       </Routes>
//     </BrowserRouter>
//   )
// }
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'
import LoginPage        from './pages/LoginPage'
import DashboardPage    from './pages/DashboardPage'
import KioskPage        from './pages/KioskPage'
import HistoryPage      from './pages/HistoryPage'
import EmployeesPage    from './pages/EmployeesPage'
import FaceCheckinPage  from './pages/FaceCheckinPage'
import MyAttendancePage from './pages/MyAttendancePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public — không cần đăng nhập */}
        <Route path="/kiosk" element={<KioskPage />} />
        <Route path="/face-checkin" element={<FaceCheckinPage />} />
        <Route path="/my-attendance" element={<MyAttendancePage />} />

        {/* Admin — vẫn đăng nhập email/mật khẩu */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute adminOnly><DashboardPage /></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute adminOnly><EmployeesPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute adminOnly><HistoryPage /></ProtectedRoute>} />

        <Route path="/" element={<Navigate to="/kiosk" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}