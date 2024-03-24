import { useState } from 'react'
import Register from './Components/Register'
import Login from './Components/Login'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import './styles.css'
import MainPage from './Components/MainPage'
import Dashboard from './Components/Dashboard'
import ListOfStocks from './Components/ListOfStocks'
import Profile from './Components/Profile'
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<MainPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stocks" element={<ListOfStocks />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
