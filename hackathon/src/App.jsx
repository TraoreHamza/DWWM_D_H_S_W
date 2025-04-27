import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router';
import Home from './pages/Home';
import Detection from './pages/Detection';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import './App.css';

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detection" element={<Detection />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;