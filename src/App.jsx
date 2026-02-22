import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Child/home"
import Task from "./Pages/Child/Task"
import HomeP from "./Pages/Parent/HomeP";

function App() {
  return (

    <Routes>
      <Route path="/" element={ <Home/> } />
      <Route path="/task" element={ <Task/> } />
      <Route path="/parent" element={ <HomeP/> } />
      
    </Routes>
  );

}

export default App;