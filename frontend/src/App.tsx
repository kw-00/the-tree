import RegisterPage from '@/pages/RegisterPage'
import LoginPage from '@/pages/LoginPage'
import Dashboard from '@/pages/Dashboard'

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Button, VStack } from '@chakra-ui/react'
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
