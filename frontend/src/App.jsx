import './App.css'
import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout/AppLayout'
import VerifyEmail from './pages/VerifyEmail'
import CheckEmail from './pages/CheckEmail'
import Home from './pages/Home'
import Profile from './pages/Profile'
import MyProjects from './pages/MyProjects'
import Applications from './pages/Applications'
import ProjectDetail from './pages/ProjectDetail'

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
        <Route path="/applications" element={<Applications />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/profile/:id" element={<Profile />} />
      </Route>
    </Routes>
  )
}

export default App
