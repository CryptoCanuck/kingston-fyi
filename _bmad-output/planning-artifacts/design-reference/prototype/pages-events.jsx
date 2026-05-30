/* ============================================================
   Kingston.FYI — Events (list / calendar) + Event detail
   ============================================================ */
const { useState: useStateEv } = React;

const BUCKETS = [
  { key: "today", label: "Today" },
  { key: "weekend", label: "This Weekend" },
  { key: "nextweek", label: "Next Week" },
  { key: "month", label: "This Month" },
];

function FilterBar({ filters, setFilters }) {
  const K = window.KFY;
  const datePresets = ["Any date", "Today", "This weekend", "This week", "This month"];
  const set = (k, v) => setFilters({ ...filters, [k]: v });
  const toggleCat = (c) => {
    const has = filters.cats.includes(c);
    set("cats", has ? filters.cats.filter((x) => x !== c) : [...filters.cats, c]);
  };
  return (
    <div className="card" style={{ padding: "16px 18px", marginBottom: 24 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <span className="kf-flabel">Date</span>
          <select className="select" style={{ width: "auto", paddingRight: 34 }}
            value={filters.date} onChange={(e) => set("date", e.target.value)}>
            {datePresets.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <span className="kf-flabel" style={{ marginBottom: 7, display: "block" }}>Category</span>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {K.EVENT_CATS.map((c) => (
              <button key={c} className={"chip" + (filters.cats.includes(c) ? " is-active" : "")}
                onClick={() => toggleCat(c)}>{c}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <span className="kf-flabel">Neighbourhood</span>
          <select className="select" style={{ width: "auto", paddingRight: 34 }}
            value={filters.hood} onChange={(e) => set("hood", e.target.value)}>
            <option>All neighbourhoods</option>
            {K.NEIGHBOURHOODS.map((h) => <option key={h}>{h}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <span className="kf-flabel">Price</span>
          <div style={{ display: "inline-flex", border: "1px solid var(--line-strong)", borderRadius: "var(--r-sm)", overflow: "hidden" }}>
            {["All", "Free", "Paid"].map((p) => (
              <button key={p} onClick={() => set("price", p)}
                style={{ padding: "9px 14px", border: 0, background: filters.price === p ? "var(--slate-800)" : "var(--card)",
                  color: filters.price === p ? "#fff" : "var(--ink-soft)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                {p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function applyEventFilters(events, f) {
  return events.filter((e) => {
    if (f.cats.length && !f.cats.includes(e.cat)) return false;
    if (f.hood !== "All neighbourhoods" && e.hood !== f.hood) return false;
    if (f.price === "Free" && !e.free) return false;
    if (f.price === "Paid" && e.free) return false;
    if (f.date === "Today" && e.bucket !== "today") return false;
    if (f.date === "This weekend" && !["today", "weekend"].includes(e.bucket)) return false;
    if (f.date === "This week" && !["today", "weekend", "nextweek"].includes(e.bucket)) return false;
    return true;
  });
}

function EventsPage({ navigate }) {
  const K = window.KFY;
  const [view, setView] = useStateEv("list");
  const [filters, setFilters] = useStateEv({ date: "Any date", cats: [], hood: "All neighbourhoods", price: "All" });
  const filtered = applyEventFilters(K.EVENTS, filters);

  return (
    <div className="kf-route kf-wrap" style={{ padding: "30px 28px 56px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
        <div>
          <div className="eyebrow">What's on in Kingston</div>
          <h1 style={{ fontSize: 40, marginTop: 6 }}>Events</h1>
        </div>
        {/* view toggle */}
        <div style={{ display: "inline-flex", background: "var(--limestone-2)", padding: 4,
          borderRadius: "var(--r)", gap: 4 }}>
          {[["list", "List", "list"], ["calendar", "Calendar", "calendar"]].map(([k, label, ic]) => (
            <button key={k} onClick={() => setView(k)}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px",
                border: 0, borderRadius: "var(--r-sm)", cursor: "pointer", fontWeight: 700, fontSize: 15,
                background: view === k ? "var(--card)" : "transparent",
                color: view === k ? "var(--slate-900)" : "var(--ink-soft)",
                boxShadow: view === k ? "var(--shadow-sm)" : "none" }}>
              <Icon name={ic} size={16} /> {label}
            </button>
          ))}
        </div>
      </div>

      <FilterBar filters={filters} setFilters={setFilters} />

      <div className="meta" style={{ marginBottom: 18, fontSize: 14 }}>
        Showing <strong style={{ color: "var(--ink)" }}>{filtered.length}</strong> events
      </div>

      {view === "list" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
          {BUCKETS.map((b) => {
            const items = filtered.filter((e) => e.bucket === b.key);
            if (!items.length) return null;
            return (
              <div key={b.key}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <h2 style={{ fontSize: 24 }}>{b.label}</h2>
                  <span style={{ background: "var(--accent-soft)", color: "var(--accent-strong)",
                    fontWeight: 700, fontSize: 13, padding: "3px 10px", borderRadius: "var(--r-pill)" }}>{items.length}</span>
                  <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {items.map((e) => <EventCard key={e.id} item={e} navigate={navigate} variant="list" />)}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <EmptyState label="No events match those filters." />}
        </div>
      ) : (
        <CalendarView events={filtered} navigate={navigate} />
      )}
    </div>
  );
}

function CalendarView({ events, navigate }) {
  // June 2026 — June 1 is a Monday. We'll show a month grid.
  const monthDays = 30;
  const firstDow = 1; // Monday (0=Sun)
  const dows = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const byDay = {};
  events.forEach((e) => { (byDay[e.day] = byDay[e.day] || []).push(e); });
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= monthDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
        <h2 style={{ fontSize: 22 }}>June 2026</h2>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-ghost btn-sm"><Icon name="chevL" size={16} /></button>
          <button className="btn btn-ghost btn-sm"><Icon name="chevR" size={16} /></button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
        {dows.map((d) => (
          <div key={d} style={{ textAlign: "center", padding: "10px 0", fontWeight: 700, fontSize: 12.5,
            letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-faint)",
            borderBottom: "1px solid var(--line)" }}>{d}</div>
        ))}
        {cells.map((d, i) => {
          const evs = d ? (byDay[d] || []) : [];
          return (
            <div key={i} className="kf-calcell" style={{ minHeight: 116, borderRight: (i % 7 !== 6) ? "1px solid var(--line)" : "none",
              borderBottom: "1px solid var(--line)", padding: 8, background: d ? "var(--card)" : "var(--limestone)",
              display: "flex", flexDirection: "column", gap: 5 }}>
              {d && <div style={{ fontSize: 13, fontWeight: 700, color: evs.length ? "var(--slate-900)" : "var(--ink-faint)" }}>{d}</div>}
              {evs.slice(0, 3).map((e) => (
                <button key={e.id} onClick={() => navigate("event", { id: e.id })}
                  style={{ display: "block", textAlign: "left", width: "100%", border: 0, cursor: "pointer",
                    background: "var(--accent-tint)", borderLeft: "3px solid var(--accent)",
                    borderRadius: 4, padding: "4px 7px", fontSize: 11.5, fontWeight: 600, color: "var(--slate-900)",
                    lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {e.title}
                </button>
              ))}
              {evs.length > 3 && <span className="faint" style={{ fontSize: 11.5, fontWeight: 600 }}>+{evs.length - 3} more</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ink-faint)" }}>
      <Icon name="calendar" size={34} stroke={1.4} style={{ margin: "0 auto 12px" }} />
      <p style={{ fontSize: 17, fontWeight: 600, color: "var(--ink-soft)" }}>{label}</p>
    </div>
  );
}

/* ---------- EVENT DETAIL ---------- */
function EventPage({ navigate, params }) {
  const K = window.KFY;
  const e = K.eventById(params.id) || K.EVENTS[0];
  const biz = e.bizId ? K.bizById(e.bizId) : null;
  const relNews = (e.relatedNews || []).map(K.newsById).filter(Boolean);
  const [added, setAdded] = useStateEv(false);

  return (
    <div className="kf-route">
      {/* hero */}
      <div style={{ position: "relative" }}>
        <Ph hue={e.ph} height="clamp(240px,34vw,420px)" icon="calendar" label="Event hero photo" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(16,24,30,.78), rgba(16,24,30,.05))" }} />
        <div className="kf-wrap" style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0 28px 26px" }}>
          <button onClick={() => navigate("events")} style={{ background: "rgba(255,255,255,.16)", border: 0,
            color: "#fff", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 14,
            padding: "7px 13px", borderRadius: "var(--r-sm)", cursor: "pointer", marginBottom: 16, backdropFilter: "blur(4px)" }}>
            <Icon name="chevL" size={16} /> All events</button>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <CatTag label={e.cat} color="var(--accent)" />
            <span className="tag" style={{ background: "rgba(255,255,255,.92)", color: "var(--ink)" }}>{e.price}</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "clamp(30px,4.4vw,52px)", maxWidth: 900 }}>{e.title}</h1>
        </div>
      </div>

      <div className="kf-wrap" style={{ padding: "32px 28px 56px" }}>
        <div className="kf-detail-layout" style={{ display: "grid", gridTemplateColumns: "1fr 340px",
          gap: 44, alignItems: "start" }}>
          {/* main */}
          <div>
            <h2 style={{ fontSize: 24, marginBottom: 12 }}>About this event</h2>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--ink)", marginBottom: 16 }}>{e.blurb}</p>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--ink-soft)", marginBottom: 28 }}>
              Doors and full schedule to be confirmed. Check back for the lineup, accessibility details and
              any weather updates. Gather your crew and make a night of it in {e.hood}.
            </p>

            {/* embedded map */}
            <h2 style={{ fontSize: 22, marginBottom: 12 }}>Location</h2>
            <div className="card" style={{ overflow: "hidden", padding: 0 }}>
              <div style={{ height: 280 }}>
                <KMap single pins={[{ id: e.id, x: 48, y: 46, label: e.venue }]} activeId={e.id} />
              </div>
              <div style={{ padding: "16px 18px", display: "flex", justifyContent: "space-between",
                alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{e.venue}</div>
                  <div className="meta" style={{ marginTop: 3 }}><Icon name="pin" size={14} /> {e.hood}, Kingston</div>
                </div>
                <button className="btn btn-ghost btn-sm"><Icon name="external" size={15} /> Directions</button>
              </div>
            </div>

            {relNews.length > 0 && (
              <div style={{ marginTop: 34 }}>
                <h2 style={{ fontSize: 22, marginBottom: 14 }}>In the news</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {relNews.map((n) => <ArticleCard key={n.id} item={n} navigate={navigate} variant="compact" />)}
                </div>
              </div>
            )}
          </div>

          {/* sidebar: details + actions */}
          <aside className="kf-detail-side" style={{ position: "sticky", top: 84, display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="card" style={{ padding: "22px 22px 24px" }}>
              <DetailRow icon="calendar" label="Date" value={e.date + ", 2026"} />
              <DetailRow icon="clock" label="Time" value={e.time} />
              <DetailRow icon="pin" label="Venue" value={e.venue} sub={e.hood} />
              <DetailRow icon="ticket" label="Price" value={e.price} last />
              <button className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 18 }}
                onClick={() => setAdded((v) => !v)}>
                <Icon name={added ? "check" : "calendar"} size={18} /> {added ? "Added to calendar" : "Add to Calendar"}
              </button>
              <button className="btn btn-ghost" style={{ width: "100%", marginTop: 9 }}>
                <Icon name="share" size={16} /> Share event
              </button>
            </div>

            {/* cross-link to venue's directory page */}
            {biz && (
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", background: "var(--limestone)", borderBottom: "1px solid var(--line)",
                  fontWeight: 800, fontSize: 12.5, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-soft)" }}>
                  The venue
                </div>
                <button onClick={() => navigate("business", { id: biz.id })}
                  style={{ display: "flex", gap: 14, alignItems: "center", width: "100%", background: "none",
                    border: 0, padding: 16, cursor: "pointer", textAlign: "left", color: "var(--ink)" }}>
                  <div style={{ width: 60, height: 60, borderRadius: "var(--r-sm)", overflow: "hidden", flexShrink: 0 }}>
                    <Ph hue={biz.ph} height="100%" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{biz.name}</div>
                    <div className="meta" style={{ fontSize: 13, marginTop: 2 }}>{biz.cat}</div>
                    <div style={{ marginTop: 5 }}><Stars value={biz.rating} showNum count={biz.reviews} /></div>
                  </div>
                  <Icon name="chevR" size={18} style={{ color: "var(--ink-faint)" }} />
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, sub, last }) {
  return (
    <div style={{ display: "flex", gap: 13, padding: "13px 0",
      borderBottom: last ? "none" : "1px solid var(--line)" }}>
      <Icon name={icon} size={19} style={{ color: "var(--accent-strong)", marginTop: 2 }} />
      <div>
        <div className="faint" style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontWeight: 600, fontSize: 16, marginTop: 2 }}>{value}</div>
        {sub && <div className="meta" style={{ fontSize: 13 }}>{sub}</div>}
      </div>
    </div>
  );
}

Object.assign(window, { EventsPage, EventPage, FilterBar, CalendarView, EmptyState, DetailRow });
