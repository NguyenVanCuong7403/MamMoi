import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import RouteManager from "./RouteManager";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

function App() {
  return (
    <Router>
        <Header />
        <RouteManager />
        <Footer />
    </Router>
  );
}

export default App;
