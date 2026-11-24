import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { COLLEGE_DOMAIN, usnError } from "../data";
import { useStore } from "../store";

export default function Auth({ mode }) {
  const isRegister = mode === "register";
  const isReset = mode === "reset";
  const { user, login, register, resetPassword, showToast } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";
  const [form, setForm] = useState({ name: "", email: "", usn: "", password: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (user) return <Navigate to={from} replace />;

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    const fields = event.currentTarget.elements;
    const email = fields.email.value.trim().toLowerCase();
    const usn = (fields.usn?.value || form.usn).trim().toUpperCase();
    const name = (fields.name?.value || form.name).trim();
    const password = fields.password.value;
    setForm({ name, email, usn, password });
    if (isRegister && name.length < 2) return setError("Enter your full name.");
    if (!email.endsWith(COLLEGE_DOMAIN)) return setError(`Use your college email ending in ${COLLEGE_DOMAIN}.`);
    if ((isRegister || isReset) && usnError(usn)) return setError(usnError(usn));
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setError("");
    setPending(true);
    try {
      if (isRegister) await register({ name, email, usn, password });
      else if (isReset) await resetPassword({ email, usn, password });
      else await login({ email, password });
      showToast(isReset ? "Password updated. You're logged in." : isRegister ? "Account created. Welcome to BorrowBox!" : "Logged in.");
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      setPending(false);
    }
  }

  return (
    <section className="container page auth-page">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1>{isReset ? "Set a new password" : isRegister ? "Create your account" : "Welcome back"}</h1>
        <p className="muted">
          {isReset
            ? "Enter the college email and USN from when you registered, then choose a new password."
            : isRegister
              ? "Only students with a college email can join."
              : "Log in with your college email."}
        </p>
        {isRegister && (
          <label className="field">
            <span>Full name</span>
            <input name="name" value={form.name} autoComplete="name" onChange={(event) => update("name", event.target.value)} />
          </label>
        )}
        <label className="field">
          <span>College email</span>
          <input
            name="email"
            type="email"
            value={form.email}
            autoComplete="username"
            placeholder={`you${COLLEGE_DOMAIN}`}
            onChange={(event) => update("email", event.target.value)}
          />
        </label>
        {(isRegister || isReset) && (
          <label className="field">
            <span>USN</span>
            <input name="usn" value={form.usn} placeholder="1BM25CS001" autoComplete="off" onChange={(event) => update("usn", event.target.value)} />
          </label>
        )}
        <label className="field">
          <span>{isReset ? "New password" : "Password"}</span>
          <input
            name="password"
            type="password"
            value={form.password}
            autoComplete={isRegister || isReset ? "new-password" : "current-password"}
            onChange={(event) => update("password", event.target.value)}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary block" disabled={pending}>
          {pending ? "Please wait…" : isReset ? "Update password" : isRegister ? "Register" : "Log in"}
        </button>
        {!isRegister && !isReset && (
          <p className="muted small center">
            <Link to="/forgot" className="text-link">Forgot password?</Link>
          </p>
        )}
        <p className="muted small center">
          {isReset ? "Remembered it? " : isRegister ? "Already have an account? " : "New here? "}
          <Link to={isRegister || isReset ? "/login" : "/register"} state={location.state} className="text-link">
            {isRegister || isReset ? "Log in" : "Create an account"}
          </Link>
        </p>
      </form>
    </section>
  );
}
