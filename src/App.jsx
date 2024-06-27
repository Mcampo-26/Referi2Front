import React from "react";
import { Routes, Route } from "react-router-dom";
import { Navbar } from './componentes/Navbar';
import './index.css';
import { Home } from "./pages/Home";
import { QrList } from "./componentes/QrList";

function App() {
  return (
    <>
      <div>
        <Navbar />
        <Routes>          
          <Route path="/" element={<Home />} />
          <Route path="/Admin" element={<QrList/>} />
        </Routes>
     
      </div>
    </>
  );
}

export default App;
