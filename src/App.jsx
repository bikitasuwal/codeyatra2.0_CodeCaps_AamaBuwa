import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Child/Home"
import Task from "./Pages/Child/Task"
import Dashboard from "./Pages/Dashboard";
import HomeP from "./Pages/Parent/HomeP";
import SignUp from "./Pages/SignUp";

function App() {
  return (

    <Routes>
      <Route path="/" element={ <Dashboard/> } />
      <Route path="/task" element={ <Task/> } />
      <Route path="/child" element={ <Home/> } />
      <Route path="/parent" element={ <HomeP/> } />
      <Route path="/signup" element={ <SignUp/> } />
    </Routes>
  );

}

export default App;