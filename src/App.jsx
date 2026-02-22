import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Child/Home"
import Task from "./Pages/Child/Task"

function App() {
  return (

    <Routes>
      <Route path="/" element={ <Home/> } />
      <Route path="/task" element={ <Task/> } />
    </Routes>
  );

}

export default App;