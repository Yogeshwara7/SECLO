import React from "react";
import { BrowserRouter,Routes, Route} from "react-router-dom";
import Navbar from "./components/Navbar";
import Upload from "./pages/Upload";
import Status from "./pages/Status";
import AI from "./pages/AI";
import Tenderly from "./pages/Tenderly";

function App(){
  return(
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Upload/>}/>
        <Route path="/status" element={<Status/>}/>
        <Route path="/ai" element={<AI/>}/>
        <Route path="/tenderly" element={<Tenderly/>}/>
      </Routes>
    
    </BrowserRouter>
  );
}

export default App;