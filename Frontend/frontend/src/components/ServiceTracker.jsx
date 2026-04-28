import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const API = "http://localhost:5000/api";
const statusFlow = ["Booked", "Assigned", "Inspection", "Quote Sent", "Approved", "Repairing", "Ready for Pickup", "Completed"];
const editableStatuses = ["Inspection", "Repairing", "Ready for Pickup", "Completed", "Cancelled"];

const emptyQuoteItem = { name: "", quantity: 1, price: 0 };

function ServiceTracker() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = ["Customer", "Mechanic"].includes(user.role) ? user.role : "Customer";
  const isMechanic = role === "Mechanic";
  const isCustomer = role === "Customer";
  const [services, setServices] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [quoteDrafts, setQuoteDrafts] = useState({});
  const [statusDrafts, setStatusDrafts] = useState({});
  const [message, setMessage] = useState("");

  const loadData = async () => {
    const params = {};
    if (isCustomer && user.email) params.customerEmail = user.email;
    if (isMechanic && user.email) params.mechanicEmail = user.email;

    const [serviceRes, mechanicRes] = await Promise.all([
      axios.get(`${API}/services`, { params }),
      axios.get(`${API}/mechanics`)
    ]);
    setServices(serviceRes.data);
    setMechanics(mechanicRes.data);
  };

  useEffect(() => {
    loadData().catch(() => setMessage("Unable to load tracking data"));
    const timer = setInterval(() => {
      loadData().catch(() => {});
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const summary = useMemo(() => {
    return {
      active: services.filter((service) => !["Completed", "Cancelled", "Rejected"].includes(service.status)).length,
      quotes: services.filter((service) => service.quoteStatus === "Sent").length,
      repairing: services.filter((service) => service.status === "Repairing").length
    };
  }, [services]);

  const loggedMechanic = useMemo(
    () => mechanics.find((mechanic) => mechanic.email === user.email),
    [mechanics, user.email]
  );

  const setQuoteItem = (serviceId, index, field, value) => {
    setQuoteDrafts((current) => {
      const items = current[serviceId] || [{ ...emptyQuoteItem }];
      const updated = items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      );
      return { ...current, [serviceId]: updated };
    });
  };

  const addQuoteItem = (serviceId) => {
    setQuoteDrafts((current) => ({
      ...current,
      [serviceId]: [...(current[serviceId] || [{ ...emptyQuoteItem }]), { ...emptyQuoteItem }]
    }));
  };

  const quoteItemsFor = (service) => {
    if (quoteDrafts[service._id]) return quoteDrafts[service._id];
    if (service.quoteItems?.length) return service.quoteItems;
    return [{ ...emptyQuoteItem }];
  };

  const quoteTotal = (items) =>
    items.reduce((sum, item) => sum + Number(item.quantity || 1) * Number(item.price || 0), 0);

  const assignMechanic = async (serviceId, mechanicId = "") => {
    try {
      await axios.post(`${API}/services/${serviceId}/assign`, mechanicId ? { mechanicId } : {});
      setMessage("Mechanic assigned successfully");
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.msg || "No available mechanic found");
    }
  };

  const updateStatus = async (service, status) => {
    if (!status) return;

    const draft = statusDrafts[service._id] || {};
    await axios.patch(`${API}/services/${service._id}/status`, {
      status,
      note: draft.note || `Moved to ${status}`,
      mechanicLocation: {
        lat: Number(draft.lat || service.mechanicLocation?.lat || 28.6139),
        lng: Number(draft.lng || service.mechanicLocation?.lng || 77.209)
      },
      partsReplaced: draft.parts
        ? draft.parts.split(",").map((part) => part.trim()).filter(Boolean)
        : service.partsReplaced,
      invoiceNumber: draft.invoiceNumber || service.invoiceNumber,
      paymentStatus: draft.paymentStatus || service.paymentStatus
    });

    setMessage(`Status updated to ${status}`);
    loadData();
  };

  const sendQuote = async (service) => {
    const quoteItems = quoteItemsFor(service)
      .filter((item) => item.name && Number(item.price) >= 0)
      .map((item) => ({
        name: item.name,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0)
      }));

    if (quoteItems.length === 0) {
      setMessage("Add at least one quote item before sending");
      return;
    }

    await axios.patch(`${API}/services/${service._id}/quote`, { quoteItems });
    setMessage("Itemized quote sent for approval");
    loadData();
  };

  const approveQuote = async (service, approved) => {
    if (service.quoteStatus !== "Sent") {
      setMessage("Send a quote before customer approval");
      return;
    }

    await axios.patch(`${API}/services/${service._id}/approval`, {
      approved,
      customerEmail: user.email
    });
    setMessage(approved ? "Quote approved. Repair can begin." : "Quote rejected by customer.");
    loadData();
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <section className="section-header">
          <h3>Real-Time Tracking & Quote Approval</h3>
          <p>
            {isCustomer && "Track your booking and approve or reject itemized quotes before repair begins."}
            {isMechanic && "Update assigned jobs with inspection notes, quotes, location, parts, invoices, and status."}
          </p>
        </section>

        {message && <div className="notice">{message}</div>}

        <div className="metric-grid tracker-summary">
          <div className="metric-card">
            <span>Active Jobs</span>
            <strong>{summary.active}</strong>
            <small>Bookings currently moving through service</small>
          </div>
          <div className="metric-card">
            <span>Quotes Waiting</span>
            <strong>{summary.quotes}</strong>
            <small>Customer approval is required before repair</small>
          </div>
          <div className="metric-card">
            <span>Repairing</span>
            <strong>{summary.repairing}</strong>
            <small>Vehicles in active workshop or doorstep repair</small>
          </div>
        </div>

        <div className="service-stack">
          {services.length === 0 && (
            <section className="panel empty-state">
              No service bookings yet. Create one from Book Service.
            </section>
          )}

          {services.map((service) => {
            const quoteItems = quoteItemsFor(service);
            const draft = statusDrafts[service._id] || {};

            return (
              <article className="service-card" key={service._id}>
                <div className="service-card-head">
                  <div>
                    <h4>{service.serviceType}</h4>
                    <span>
                      {service.issueDescription || service.serviceType} - {service.vehicleId?.regNumber || "Vehicle"} - {service.visitType} - {service.customerName || "Customer"}
                    </span>
                  </div>
                  <strong>{service.status}</strong>
                </div>

                <div className="status-track">
                  {statusFlow.map((status) => (
                    <span key={status} className={status === service.status ? "active" : ""}>
                      {status}
                    </span>
                  ))}
                </div>

                <div className="service-details">
                  <span>Mechanic: {service.mechanicId?.name || "Not assigned"}</span>
                  <span>
                    Live Location: {service.mechanicLocation?.lat
                      ? `${service.mechanicLocation.lat.toFixed(4)}, ${service.mechanicLocation.lng.toFixed(4)}`
                      : "Pending"}
                  </span>
                  <span>Quote: Rs {service.cost || 0} ({service.quoteStatus})</span>
                  <span>Payment: {service.paymentStatus}</span>
                  <span>Invoice: {service.invoiceNumber || "Not generated"}</span>
                  <span>Parts: {service.partsReplaced?.join(", ") || "None recorded"}</span>
                </div>

                <section className="tracker-grid">
                  {isMechanic && !service.mechanicId && (
                    <div className="tracker-panel">
                      <h5>Accept Job</h5>
                      <span>This booking is not assigned yet. Accept it to start inspection and quote updates.</span>
                      <button
                        type="button"
                        disabled={!loggedMechanic}
                        onClick={() => assignMechanic(service._id, loggedMechanic?._id)}
                      >
                        Accept This Job
                      </button>
                      {!loggedMechanic && <small>Your mechanic profile is missing. Register as Mechanic with this same email.</small>}
                    </div>
                  )}

                  {isMechanic && (
                  <div className="tracker-panel">
                    <h5>Quote Items</h5>
                    {quoteItems.map((item, index) => (
                      <div className="quote-item-row" key={`${service._id}-quote-${index}`}>
                        <input
                          placeholder="Part or labor"
                          value={item.name || ""}
                          onChange={(e) => setQuoteItem(service._id, index, "name", e.target.value)}
                        />
                        <input
                          type="number"
                          min="1"
                          value={item.quantity || 1}
                          onChange={(e) => setQuoteItem(service._id, index, "quantity", e.target.value)}
                        />
                        <input
                          type="number"
                          min="0"
                          value={item.price || 0}
                          onChange={(e) => setQuoteItem(service._id, index, "price", e.target.value)}
                        />
                      </div>
                    ))}
                    <div className="inline-controls">
                      <span>Total: Rs {quoteTotal(quoteItems)}</span>
                      <button type="button" className="btn-muted" onClick={() => addQuoteItem(service._id)}>
                        Add Item
                      </button>
                      <button type="button" onClick={() => sendQuote(service)}>
                        Send Quote
                      </button>
                    </div>
                  </div>
                  )}

                  {isCustomer && (
                    <div className="tracker-panel">
                      <h5>Quote Approval</h5>
                      {service.quoteItems?.length > 0 ? (
                        <>
                          <ul className="quote-list">
                            {service.quoteItems.map((item, index) => (
                              <li key={`${service._id}-customer-quote-${index}`}>
                                {item.name} x {item.quantity} - Rs {item.price}
                              </li>
                            ))}
                          </ul>
                          <strong>Total: Rs {service.cost || 0}</strong>
                          <div className="inline-controls">
                            <button type="button" onClick={() => approveQuote(service, true)}>
                              Approve Quote
                            </button>
                            <button type="button" className="btn-danger" onClick={() => approveQuote(service, false)}>
                              Reject Quote
                            </button>
                          </div>
                        </>
                      ) : (
                        <span>Mechanic has not sent a quote yet.</span>
                      )}
                    </div>
                  )}

                  {isMechanic && (
                  <div className="tracker-panel">
                    <h5>Status & Invoice</h5>
                    <div className="form-grid compact-form">
                      <label>
                        Status
                        <select
                          value={draft.status || ""}
                          onChange={(e) =>
                            setStatusDrafts({
                              ...statusDrafts,
                              [service._id]: { ...draft, status: e.target.value }
                            })
                          }
                        >
                          <option value="">Select status</option>
                          {editableStatuses.map((status) => <option key={status}>{status}</option>)}
                        </select>
                      </label>
                      <label>
                        Latitude
                        <input
                          type="number"
                          step="any"
                          value={draft.lat || ""}
                          placeholder={service.mechanicLocation?.lat || "28.6139"}
                          onChange={(e) =>
                            setStatusDrafts({ ...statusDrafts, [service._id]: { ...draft, lat: e.target.value } })
                          }
                        />
                      </label>
                      <label>
                        Longitude
                        <input
                          type="number"
                          step="any"
                          value={draft.lng || ""}
                          placeholder={service.mechanicLocation?.lng || "77.2090"}
                          onChange={(e) =>
                            setStatusDrafts({ ...statusDrafts, [service._id]: { ...draft, lng: e.target.value } })
                          }
                        />
                      </label>
                      <label>
                        Parts Replaced
                        <input
                          value={draft.parts || ""}
                          placeholder="Oil filter, Brake pad"
                          onChange={(e) =>
                            setStatusDrafts({ ...statusDrafts, [service._id]: { ...draft, parts: e.target.value } })
                          }
                        />
                      </label>
                      <label>
                        Invoice No.
                        <input
                          value={draft.invoiceNumber || ""}
                          placeholder="INV-1001"
                          onChange={(e) =>
                            setStatusDrafts({ ...statusDrafts, [service._id]: { ...draft, invoiceNumber: e.target.value } })
                          }
                        />
                      </label>
                      <label>
                        Payment
                        <select
                          value={draft.paymentStatus || service.paymentStatus || "Unpaid"}
                          onChange={(e) =>
                            setStatusDrafts({ ...statusDrafts, [service._id]: { ...draft, paymentStatus: e.target.value } })
                          }
                        >
                          <option>Unpaid</option>
                          <option>Paid</option>
                          <option>Refunded</option>
                        </select>
                      </label>
                    </div>
                    <textarea
                      placeholder="Status note for customer timeline"
                      value={draft.note || ""}
                      onChange={(e) =>
                        setStatusDrafts({ ...statusDrafts, [service._id]: { ...draft, note: e.target.value } })
                      }
                    />
                    <button type="button" onClick={() => updateStatus(service, draft.status)}>
                      Save Tracking Update
                    </button>
                  </div>
                  )}
                </section>

                <section className="timeline">
                  <h5>Customer Timeline</h5>
                  {(service.timeline || []).slice().reverse().map((event, index) => (
                    <div className="timeline-row" key={`${service._id}-timeline-${index}`}>
                      <strong>{event.status}</strong>
                      <span>{event.note}</span>
                      <small>{event.time ? new Date(event.time).toLocaleString() : ""}</small>
                    </div>
                  ))}
                </section>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default ServiceTracker;
