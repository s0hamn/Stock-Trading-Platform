import { useState } from 'react'
import Register from './Components/Register'
import Login from './Components/Login'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import MainPage from './Components/MainPage'
function App() {

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
