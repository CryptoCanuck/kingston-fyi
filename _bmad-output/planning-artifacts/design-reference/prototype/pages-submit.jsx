/* ============================================================
   Kingston.FYI — Submit flow (multi-step form)
   ============================================================ */
const { useState: useStateSub } = React;

function SubmitPage({ navigate }) {
  const [type, setType] = useStateSub("business"); // business | event
  const [step, setStep] = useStateSub(1);
  const [data, setData] = useStateSub({
    name: "", category: "", description: "", address: "", hood: "", hours: "",
    date: "", time: "", price: "", web: "", email: "",
  });
  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const K = window.KFY;
  const steps = ["Type", "Details", "Location & Media", "Review"];

  if (step === 5) return <SubmitDone navigate={navigate} type={type} name={data.name} />;

  return (
    <div className="kf-route kf-wrap" style={{ maxWidth: 820, padding: "32px 28px 64px" }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div className="eyebrow">Add to Kingston.FYI</div>
        <h1 style={{ fontSize: 38, marginTop: 6 }}>Submit a listing or event</h1>
        <p className="muted" style={{ fontSize: 17, marginTop: 10, maxWidth: 540, margin: "10px auto 0" }}>
          Tell us about a business or event in Kingston. Every submission is reviewed by our team
          before it goes live — usually within two business days.
        </p>
      </div>

      {/* stepper */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        margin: "30px 0 34px", flexWrap: "wrap" }}>
        {steps.map((s, i) => {
          const n = i + 1, done = step > n, cur = step === n;
          return (
            <React.Fragment key={s}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ width: 30, height: 30, borderRadius: 999, display: "inline-flex",
                  alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14,
                  background: done ? "var(--accent)" : cur ? "var(--slate-800)" : "var(--limestone-2)",
                  color: done || cur ? "#fff" : "var(--ink-faint)" }}>
                  {done ? <Icon name="check" size={15} stroke={3} /> : n}</span>
                <span className="kf-step-label" style={{ fontWeight: 700, fontSize: 14,
                  color: cur ? "var(--ink)" : "var(--ink-faint)" }}>{s}</span>
              </div>
              {i < steps.length - 1 && <span style={{ width: 28, height: 2, background: "var(--line-strong)" }} />}
            </React.Fragment>
          );
        })}
      </div>

      <div className="card" style={{ padding: "30px 32px 34px" }}>
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 23, marginBottom: 6 }}>What would you like to add?</h2>
            <p className="muted" style={{ marginBottom: 22 }}>Choose the kind of submission to get the right form.</p>
            <div className="kf-type-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { k: "business", icon: "pin", title: "A business", sub: "Shops, restaurants, services and venues across Kingston." },
                { k: "event", icon: "calendar", title: "An event", sub: "Concerts, markets, festivals, games and community gatherings." },
              ].map((o) => (
                <button key={o.k} onClick={() => setType(o.k)}
                  style={{ textAlign: "left", padding: "22px 22px", borderRadius: "var(--r)", cursor: "pointer",
                    background: type === o.k ? "var(--accent-tint)" : "var(--card)",
                    border: "2px solid " + (type === o.k ? "var(--accent)" : "var(--line)") }}>
                  <span style={{ width: 46, height: 46, borderRadius: "var(--r-sm)", background: type === o.k ? "var(--accent)" : "var(--limestone-2)",
                    color: type === o.k ? "#fff" : "var(--slate-700)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <Icon name={o.icon} size={22} /></span>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 21, fontWeight: 600 }}>{o.title}</div>
                  <p className="muted" style={{ fontSize: 14.5, marginTop: 6, lineHeight: 1.45 }}>{o.sub}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 23 }}>{type === "business" ? "Business details" : "Event details"}</h2>
            <Field label={type === "business" ? "Business name" : "Event title"} required>
              <input className="input" value={data.name} onChange={(e) => set("name", e.target.value)}
                placeholder={type === "business" ? "e.g. Skeleton Park Roasters" : "e.g. Williamsville Night Market"} />
            </Field>
            <div className="kf-form-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Category" required>
                <select className="select" value={data.category} onChange={(e) => set("category", e.target.value)}>
                  <option value="">Select…</option>
                  {(type === "business" ? ["Food & Drink", "Shopping", "Recreation", "Arts & Culture", "Services"] : K.EVENT_CATS).map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Neighbourhood" required>
                <select className="select" value={data.hood} onChange={(e) => set("hood", e.target.value)}>
                  <option value="">Select…</option>
                  {K.NEIGHBOURHOODS.map((h) => <option key={h}>{h}</option>)}
                </select>
              </Field>
            </div>
            {type === "event" && (
              <div className="kf-form-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <Field label="Date" required>
                  <input className="input" type="date" value={data.date} onChange={(e) => set("date", e.target.value)} /></Field>
                <Field label="Time">
                  <input className="input" type="time" value={data.time} onChange={(e) => set("time", e.target.value)} /></Field>
                <Field label="Price">
                  <input className="input" value={data.price} onChange={(e) => set("price", e.target.value)} placeholder="Free, $20…" /></Field>
              </div>
            )}
            {type === "business" && (
              <Field label="Opening hours">
                <input className="input" value={data.hours} onChange={(e) => set("hours", e.target.value)} placeholder="e.g. Mon–Sat 9 AM – 6 PM" />
              </Field>
            )}
            <Field label="Description" required>
              <textarea className="textarea" value={data.description} onChange={(e) => set("description", e.target.value)}
                placeholder="Tell visitors what makes this special. A couple of sentences is plenty." />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 23 }}>Location & media</h2>
            <Field label="Street address" required>
              <input className="input" value={data.address} onChange={(e) => set("address", e.target.value)}
                placeholder="e.g. 612 Princess St" /></Field>
            <div className="kf-form-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Website"><input className="input" value={data.web} onChange={(e) => set("web", e.target.value)} placeholder="yourbusiness.ca" /></Field>
              <Field label="Contact email" required><input className="input" type="email" value={data.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" /></Field>
            </div>
            <Field label="Photos">
              <div style={{ border: "2px dashed var(--line-strong)", borderRadius: "var(--r)", padding: "32px 20px",
                textAlign: "center", background: "var(--limestone)" }}>
                <Icon name="grid" size={28} stroke={1.5} style={{ margin: "0 auto 10px", color: "var(--ink-faint)" }} />
                <div style={{ fontWeight: 700, fontSize: 15.5 }}>Drag photos here, or <span style={{ color: "var(--accent-strong)" }}>browse</span></div>
                <p className="faint" style={{ fontSize: 13, marginTop: 5 }}>JPG or PNG, up to 8 images. A great cover photo helps a lot.</p>
              </div>
            </Field>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 23, marginBottom: 16 }}>Review your submission</h2>
            <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r)", overflow: "hidden" }}>
              <div style={{ display: "flex", gap: 16, padding: 18, background: "var(--limestone)" }}>
                <div style={{ width: 80, height: 80, borderRadius: "var(--r-sm)", overflow: "hidden", flexShrink: 0 }}>
                  <Ph hue="ph-c" height="100%" icon={type === "business" ? "pin" : "calendar"} /></div>
                <div>
                  <CatTag label={data.category || (type === "business" ? "Business" : "Event")} color="var(--slate-700)" small />
                  <h3 style={{ fontSize: 22, marginTop: 8 }}>{data.name || "Untitled submission"}</h3>
                  <div className="meta" style={{ marginTop: 5 }}>{data.hood || "Kingston"}{data.address ? " · " + data.address : ""}</div>
                </div>
              </div>
              <div style={{ padding: 18 }}>
                <ReviewLine label="Description" value={data.description || "—"} />
                {type === "event" && <ReviewLine label="When" value={[data.date, data.time, data.price].filter(Boolean).join(" · ") || "—"} />}
                {type === "business" && <ReviewLine label="Hours" value={data.hours || "—"} />}
                <ReviewLine label="Website" value={data.web || "—"} />
                <ReviewLine label="Contact" value={data.email || "—"} last />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 20, padding: "14px 16px",
              background: "var(--accent-tint)", borderRadius: "var(--r-sm)", border: "1px solid var(--accent-soft)" }}>
              <Icon name="check" size={18} style={{ color: "var(--accent-strong)", marginTop: 2 }} />
              <p style={{ fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                Submissions are reviewed by the Kingston.FYI team before publishing. We'll email you at the
                address above once it's live, usually within two business days.
              </p>
            </div>
          </div>
        )}

        {/* nav */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => step === 1 ? navigate("home") : setStep(step - 1)}>
            <Icon name="chevL" size={16} /> {step === 1 ? "Cancel" : "Back"}
          </button>
          <button className="btn btn-primary btn-lg" onClick={() => setStep(step + 1)}>
            {step === 4 ? "Submit for review" : "Continue"} <Icon name="arrowR" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="field">
      <label>{label}{required && <span style={{ color: "var(--accent-strong)" }}> *</span>}</label>
      {children}
    </div>
  );
}
function ReviewLine({ label, value, last }) {
  return (
    <div style={{ display: "flex", gap: 16, padding: "10px 0", borderBottom: last ? "none" : "1px solid var(--line)" }}>
      <span className="faint" style={{ fontSize: 13, fontWeight: 700, width: 100, flexShrink: 0,
        textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</span>
      <span style={{ fontSize: 15, color: "var(--ink)" }}>{value}</span>
    </div>
  );
}

function SubmitDone({ navigate, type, name }) {
  return (
    <div className="kf-route kf-wrap" style={{ maxWidth: 620, padding: "70px 28px", textAlign: "center" }}>
      <span style={{ width: 76, height: 76, borderRadius: 999, background: "var(--accent)", color: "#fff",
        display: "inline-flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
        <Icon name="check" size={40} stroke={2.5} /></span>
      <h1 style={{ fontSize: 38 }}>Thank you — it's in review.</h1>
      <p className="muted" style={{ fontSize: 18, marginTop: 14, lineHeight: 1.5 }}>
        We've received your {type === "business" ? "business listing" : "event"}{name ? ` for ${name}` : ""}.
        Our team will review it and you'll get an email once it's published on Kingston.FYI.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 30, flexWrap: "wrap" }}>
        <button className="btn btn-dark btn-lg" onClick={() => navigate("home")}>Back to home</button>
        <button className="btn btn-ghost btn-lg" onClick={() => navigate("submit")}>Submit another</button>
      </div>
    </div>
  );
}

Object.assign(window, { SubmitPage });
