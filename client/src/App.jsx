import { useState } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import HeroGradient from "./components/HeroGradient";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

function Later() {
  return (
    <section className="container page empty-page">
      <h1>This page is next</h1>
      <p className="muted">Home is ready. Explore, clubs, and login land in the following steps.</p>
      <Link to="/" className="btn btn-primary">Back home</Link>
    </section>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("borrowbox_user")) || null;
    } catch {
      return null;
    }
  });

  function logout() {
    localStorage.removeItem("borrowbox_user");
    setUser(null);
  }

  return (
    <BrowserRouter>
      <div className="app">
        <HeroGradient />
        <Navbar user={user} onLogout={logout} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Later />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
