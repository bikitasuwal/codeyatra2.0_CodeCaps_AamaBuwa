import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Child/Home"
import Task from "./Pages/Child/Task"
import Dashboard from "./Pages/Dashboard";
import HomeP from "./Pages/Parent/HomeP";
import SignUp from "./Pages/SignUp";
import ChildLayout from "./Layout.jsx/ChildLayout";
import SOS from "./Pages/Child/SOS";
import { AlarmProvider } from "./context/AlarmContext";

function App() {
  return (
    <AlarmProvider>
      <Routes>

  {/* Public */}
  <Route path="/" element={<Dashboard />} />
  <Route path="/signup" element={<SignUp />} />
  <Route path="/parent" element={<HomeP />} />

  {/* Child Portal */}
  <Route path="/child" element={ <ChildLayout/> }>
    <Route path="home" element={<Home />} />
    <Route path="task" element={<Task />} />
    <Route path="sos" element={<SOS />} />
  </Route>

      </Routes>
    </AlarmProvider>
  );

}

export default App;