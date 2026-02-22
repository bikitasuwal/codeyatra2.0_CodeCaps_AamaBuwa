import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Child/Home"
import Task from "./Pages/Child/Task"
import Dashboard from "./Pages/Dashboard";

function App() {
  return (

    <Routes>
      <Route path="/" element={ <Dashboard/> } />
      <Route path="/task" element={ <Task/> } />
      <Route path="/home" element={ <Home/> } />
    </Routes>
  );

}

export default App;