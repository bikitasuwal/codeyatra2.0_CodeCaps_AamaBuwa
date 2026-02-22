import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Child/Home"
import Task from "./Pages/Child/Task"
import Dashboard from "./Pages/Dashboard";
import HomeP from "./Pages/Parent/HomeP";

function App() {
  return (

    <Routes>
      <Route path="/" element={ <Dashboard/> } />
      <Route path="/task" element={ <Task/> } />
      <Route path="/home" element={ <Home/> } />
      <Route path="/parent" element={ <HomeP/> } />
    </Routes>
  );

}

export default App;