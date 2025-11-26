import Dashboard from '@/pages/Dashboard'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Provider } from './components/ui/provider'

export default function App() {

  return (
    <Provider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login"/>} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}
