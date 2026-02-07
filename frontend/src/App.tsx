import React from "react";
import { BrowserRouter,Routes, Route} from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Status from "./pages/Status";

function App(){
  return(
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Dashboard/>}/>
        <Route path="/upload" element={<Upload/>}/>
        <Route path="/status" element={<Status/>}/>
      </Routes>
    
    </BrowserRouter>
  );
}

export default App;