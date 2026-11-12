import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { COLLEGE_DOMAIN, usnError } from "../data";
import { useStore } from "../store";

export default function Auth({ mode }) {
  const isRegister = mode === "register";
  const { user, login, register, showToast } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";
  const [form, setForm] = useState({ name: "", email: "", usn: "", password: "" });
  const [error, setError] = useState("");

  if (user) return <Navigate to={from} replace />;

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    const email = form.email.trim().toLowerCase();
    const usn = form.usn.trim().toUpperCase();
    if (isRegister && form.name.trim().length < 2) return setError("Enter your full name.");
    if (!email.endsWith(COLLEGE_DOMAIN)) return setError(`Use your college email ending in ${COLLEGE_DOMAIN}.`);
    if (isRegister && usnError(usn)) return setError(usnError(usn));
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");

    try {
      if (isRegister) await register({ name: form.name.trim(), email, usn, password: form.password });
      else await login({ email, password: form.password });
      showToast(isRegister ? "Account created. Welcome to BorrowBox!" : "Logged in.");
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="container page auth-page">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
        <p className="muted">
          {isRegister ? "Only students with a college email can join." : "Log in with your college email."}
        </p>
        {isRegister && (
          <label className="field">
            <span>Full name</span>
            <input value={form.name} autoComplete="name" onChange={(event) => update("name", event.target.value)} />
          </label>
        )}
        <label className="field">
          <span>College email</span>
          <input
            type="email"
            value={form.email}
            autoComplete="email"
            placeholder={`you${COLLEGE_DOMAIN}`}
            onChange={(event) => update("email", event.target.value)}
          />
        </label>
        {isRegister && (
          <label className="field">
            <span>USN</span>
            <input value={form.usn} placeholder="1BM25CS001" onChange={(event) => update("usn", event.target.value)} />
          </label>
        )}
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            autoComplete={isRegister ? "new-password" : "current-password"}
            onChange={(event) => update("password", event.target.value)}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary block">{isRegister ? "Register" : "Log in"}</button>
        <p className="muted small center">
          {isRegister ? "Already have an account? " : "New here? "}
          <Link to={isRegister ? "/login" : "/register"} state={location.state} className="text-link">
            {isRegister ? "Log in" : "Create an account"}
          </Link>
        </p>
      </form>
    </section>
  );
}
