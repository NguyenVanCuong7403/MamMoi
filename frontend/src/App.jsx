import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import RouteManager from "./RouteManager";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
// Use our new background portal from the background folder. This renders
// the animated backdrop across the entire application. If you prefer to
// keep the AmbientBackdrop you can switch back, but the portal allows
// stacking contexts to remain intact.
import { BackgroundPortal } from "./components/background";
import { AuthProvider } from "./API/context/AuthContext";


function App() {
  const [authTab, setAuthTab] = useState("login");
  return (
    <Router>
      {/* Hiệu ứng nền toàn cục (luôn nằm sau). Base color can be set via prop */}
      <BackgroundPortal enabled density={28} baseColor="#1F302F" />

      {/* Toàn bộ UI đặt trên lớp hiệu ứng */}
      <div className="relative z-10">
          <AuthProvider>
        <Header
          onLogin={() => {
            setAuthTab("login");
          }}
          onRegister={() => {
            setAuthTab("register");
          }}
        />
            <RouteManager authTab={authTab} />
        <Footer />
          </AuthProvider>
      </div>
      
    </Router>
  );
}

export default App;
