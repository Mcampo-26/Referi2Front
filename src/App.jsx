import React from "react";
import { Navbar } from './componentes/Navbar';
import './index.css';
import { Home } from "./pages/Home";

function App() {
  return (
    <>
      <div>
        <Navbar />
     <Home/>
      </div>
    </>
  );
}

export default App;
