import { useEffect } from "react";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Auth from "./pages/Auth";
import Categories from "./pages/Categories";
import Clubs, { ClubDetail } from "./pages/Clubs";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import ItemDetail from "./pages/ItemDetail";
import ListItem from "./pages/ListItem";
import { StoreProvider, useStore } from "./store";

function NotFound() {
  return (
    <section className="container page empty-page">
      <h1>Page not found</h1>
      <p className="muted">That link doesn't lead anywhere on BorrowBox.</p>
      <Link to="/" className="btn btn-primary">Back home</Link>
    </section>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.tone}`} role="status">
      {toast.message}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/items/:id" element={<ItemDetail />} />
              <Route path="/clubs" element={<Clubs />} />
              <Route path="/clubs/:id" element={<ClubDetail />} />
              <Route path="/list" element={<ListItem />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Auth mode="login" />} />
              <Route path="/register" element={<Auth mode="register" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <Toast />
        </div>
      </BrowserRouter>
    </StoreProvider>
  );
}
