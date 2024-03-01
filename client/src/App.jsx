import { useState } from 'react'
import Register from './Components/Register'
import Login from './Components/Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
function App() {

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
