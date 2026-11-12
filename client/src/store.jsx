import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "./api";
import { categories as seedCategories, clubs as seedClubs, items as seedItems } from "./data";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [categories, setCategories] = useState(seedCategories);
  const [clubs, setClubs] = useState(seedClubs);
  const [catalogItems, setCatalogItems] = useState(seedItems);
  const [catalogReady, setCatalogReady] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [requests, setRequests] = useState([]);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    Promise.all([api("/api/categories"), api("/api/clubs"), api("/api/items")])
      .then(([nextCategories, nextClubs, nextItems]) => {
        setCategories(nextCategories);
        setClubs(nextClubs);
        setCatalogItems(nextItems);
      })
      .then(() => setCatalogError(""))
      .catch(() => setCatalogError("The catalog couldn't be loaded. Start the API and refresh."))
      .finally(() => setCatalogReady(true));
  }, []);

  useEffect(() => {
    api("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    if (!user) {
      setRequests([]);
      return;
    }
    Promise.all([api("/api/requests/incoming"), api("/api/requests/mine")])
      .then(([incoming, mine]) => setRequests([...incoming, ...mine]))
      .catch(() => setRequests([]));
  }, [user]);

  const showToast = useCallback((message, tone = "ok") => {
    clearTimeout(toastTimer.current);
    setToast({ message, tone });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const login = useCallback(async (body) => {
    const nextUser = await api("/auth/login", { method: "POST", body });
    setUser(nextUser);
    return nextUser;
  }, []);

  const register = useCallback(async (body) => {
    const nextUser = await api("/auth/register", { method: "POST", body });
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      /* The cookie is cleared even if the request fails. */
    }
    setUser(null);
  }, []);

  const addItem = useCallback(async (item) => {
    const saved = await api("/api/items", { method: "POST", body: item });
    setCatalogItems((current) => [saved, ...current.filter((entry) => entry.id !== saved.id)]);
    return saved;
  }, []);

  const addRequest = useCallback(async ({ itemId, startDate, endDate }) => {
    const saved = await api("/api/requests", { method: "POST", body: { itemId, startDate, endDate } });
    setRequests((current) => [saved, ...current.filter((request) => request.id !== saved.id)]);
    return saved;
  }, []);

  const addReview = useCallback(async (itemId, body) => {
    const saved = await api(`/api/items/${itemId}/reviews`, { method: "POST", body });
    setCatalogItems((current) => current.map((item) => (item.id === saved.id ? saved : item)));
    return saved;
  }, []);

  const setRequestStatus = useCallback(async (id, status) => {
    const saved = await api(`/api/requests/${id}`, { method: "PATCH", body: { status } });
    setRequests((current) => current.map((request) => (request.id === id ? { ...request, ...saved } : request)));
    return saved;
  }, []);

  const value = useMemo(() => {
    const myItems = user ? catalogItems.filter((item) => item.ownerId === user.id) : [];
    return {
      user,
      authReady,
      catalogReady,
      catalogError,
      categories,
      clubs,
      login,
      register,
      logout,
      items: catalogItems,
      myItems,
      getItem: (id) => catalogItems.find((item) => item.id === Number(id)),
      addItem,
      requests,
      addRequest,
      setRequestStatus,
      addReview,
      toast,
      showToast,
    };
  }, [user, authReady, catalogReady, catalogError, categories, clubs, catalogItems, login, register, logout, addItem, requests, addRequest, setRequestStatus, addReview, toast, showToast]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
