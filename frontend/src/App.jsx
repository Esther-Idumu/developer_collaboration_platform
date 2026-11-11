import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout/AppLayout'
import VerifyEmail from './pages/VerifyEmail'
import CheckEmail from './pages/CheckEmail'
import Home from './pages/Home'
import Profile from './pages/Profile'
import CreateProject from './pages/CreateProject'
import MyProjects from './pages/MyProjects'
import Applications from './pages/Applications'
import ProjectDetail from './pages/ProjectDetail'
import Messages from './pages/Messages'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />
      <Route path="/check-email" element={<CheckEmail />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/home" element={<Home />} />
        <Route path="/my-projects" element={<MyProjects />} />
        <Route path="/projects/new" element={<CreateProject />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/messages/:projectId?" element={<Messages />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/profile/:id" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default App
