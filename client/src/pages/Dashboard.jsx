import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import ItemImage from "../components/ItemImage";
import StatusBadge from "../components/StatusBadge";
import { depositFor, formatRupees } from "../data";
import { useStore } from "../store";

const tabs = [
  { id: "listings", label: "My Listings" },
  { id: "incoming", label: "Incoming Requests" },
  { id: "borrowing", label: "My Borrowings" },
];

const DAY = 24 * 60 * 60 * 1000;

function RequestRow({ request, item, children }) {
  const days = Math.round((new Date(request.endDate) - new Date(request.startDate)) / DAY) + 1;
  const counterpart = request.kind === "incoming" ? `From ${request.borrowerName}` : `Owner ${request.ownerName}`;

  return (
    <article className="card request">
      <Link to={`/items/${item.id}`} className="request-thumb">
        <ItemImage src={item.images[0]} alt={item.title} />
      </Link>
      <div className="request-body">
        <div className="request-top">
          <Link to={`/items/${item.id}`}><strong>{item.title}</strong></Link>
          <StatusBadge status={request.status} />
        </div>
        <p className="muted small">
          {counterpart} · {request.startDate} → {request.endDate} ({days} {days === 1 ? "day" : "days"})
        </p>
        <p className="small">
          Rent {formatRupees(days * item.pricePerDay)} · Deposit {formatRupees(depositFor(item.originalPrice))}
        </p>
        {children}
      </div>
    </article>
  );
}

export default function Dashboard() {
  const { user, myItems, requests, getItem, setRequestStatus, showToast } = useStore();
  const [tab, setTab] = useState("listings");

  if (!user) return <Navigate to="/login" state={{ from: "/dashboard" }} replace />;

  const incoming = requests.filter((request) => request.kind === "incoming");
  const borrowing = requests.filter((request) => request.kind === "borrowing");

  async function decide(id, status) {
    const messages = {
      ACCEPTED: "Request accepted. Arrange the handover.",
      REJECTED: "Request rejected.",
      CANCELLED: "Request cancelled.",
      ACTIVE: "Marked as handed over.",
      COMPLETED: "Marked as returned.",
      DISPUTED: "Marked as disputed.",
    };
    try {
      await setRequestStatus(id, status);
      showToast(messages[status] || "Request updated.", status === "REJECTED" || status === "DISPUTED" ? "error" : "ok");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  const counts = { listings: myItems.length, incoming: incoming.length, borrowing: borrowing.length };

  return (
    <section className="container page">
      <div className="page-head row">
        <div>
          <h1>Hi, {user.name.split(" ")[0]}</h1>
          <p className="muted">{user.email}</p>
        </div>
        <Link to="/list" className="btn btn-primary">List an Item</Link>
      </div>

      <div className="tabs" role="tablist">
        {tabs.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={tab === entry.id}
            className={tab === entry.id ? "tab active" : "tab"}
            onClick={() => setTab(entry.id)}
          >
            {entry.label} <span className="tab-count">{counts[entry.id]}</span>
          </button>
        ))}
      </div>

      {tab === "listings" &&
        (myItems.length ? (
          <div className="item-grid">
            {myItems.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="empty card">
            <h3>No listings yet</h3>
            <p className="muted">Got a camera, guitar, or tent sitting idle? List it with a few photos.</p>
            <Link to="/list" className="btn btn-primary btn-sm">List an Item</Link>
          </div>
        ))}

      {tab === "incoming" &&
        (incoming.length ? (
          <div className="request-list">
            {incoming.map((request) => {
              const item = getItem(request.itemId);
              if (!item) return null;
              return (
                <RequestRow key={request.id} request={request} item={item}>
                  {request.status === "PENDING" && (
                    <div className="request-actions">
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => decide(request.id, "ACCEPTED")}>Accept</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => decide(request.id, "REJECTED")}>Reject</button>
                    </div>
                  )}
                  {request.status === "ACCEPTED" && (
                    <div className="request-actions">
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => decide(request.id, "ACTIVE")}>Mark handed over</button>
                    </div>
                  )}
                  {request.status === "ACTIVE" && (
                    <div className="request-actions">
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => decide(request.id, "COMPLETED")}>Mark returned</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => decide(request.id, "DISPUTED")}>Dispute</button>
                    </div>
                  )}
                </RequestRow>
              );
            })}
          </div>
        ) : (
          <div className="empty card">
            <h3>No requests yet</h3>
            <p className="muted">When someone asks to borrow one of your listings, it shows up here.</p>
          </div>
        ))}

      {tab === "borrowing" &&
        (borrowing.length ? (
          <div className="request-list">
            {borrowing.map((request) => {
              const item = getItem(request.itemId);
              if (!item) return null;
              return (
                <RequestRow key={request.id} request={request} item={item}>
                  {request.status === "PENDING" && (
                    <div className="request-actions">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => decide(request.id, "CANCELLED")}>Cancel request</button>
                    </div>
                  )}
                  {request.status === "COMPLETED" && !item.reviews?.some((review) => review.authorId === user.id) && (
                    <div className="request-actions">
                      <Link to={`/items/${item.id}`} className="btn btn-ghost btn-sm">Leave a review</Link>
                    </div>
                  )}
                </RequestRow>
              );
            })}
          </div>
        ) : (
          <div className="empty card">
            <h3>You haven't borrowed anything</h3>
            <p className="muted">Find something on Explore and send a request with your dates.</p>
            <Link to="/explore" className="btn btn-primary btn-sm">Explore items</Link>
          </div>
        ))}
    </section>
  );
}
