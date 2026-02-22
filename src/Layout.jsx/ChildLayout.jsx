import { Outlet } from "react-router-dom";
import Header from "../Component/Child/Header";
import Footer from "../Component/Child/Footer";


export default function ChildLayout() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      
      <Header/>

      {/* Page Content */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      <Footer/>

    </div>
  );
}