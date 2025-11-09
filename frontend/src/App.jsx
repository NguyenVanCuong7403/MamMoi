import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import RouteManager from "./RouteManager";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AmbientBackdrop from "./components/AmbientBackdrop"; // <— thêm

function App() {
  return (
    <Router>
      {/* Hiệu ứng nền toàn cục (luôn nằm sau) */}
      <AmbientBackdrop color="#1F302F" />

      {/* Toàn bộ UI đặt trên lớp hiệu ứng */}
      <div className="relative z-10">
        <Header />
        <RouteManager />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
