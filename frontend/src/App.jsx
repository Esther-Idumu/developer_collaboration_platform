import './App.css'
import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/login'
import Signup from './pages/Signup'
import ProtectedRoute from './components/ProtectedRoute'
import VerifyEmail from './pages/VerifyEmail'
import CheckEmail from './pages/CheckEmail'
import Home from './pages/Home'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />
      <Route path="/check-email" element={<CheckEmail />} />
      <Route path="/home" element={<Home />}/>
    </Routes>
  )
}

export default App
