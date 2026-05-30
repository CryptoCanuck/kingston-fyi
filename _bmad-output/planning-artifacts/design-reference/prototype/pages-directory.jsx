/* ============================================================
   Kingston.FYI — Business Directory (split list + map) + detail
   ============================================================ */
const { useState: useStateDir, useMemo: useMemoDir } = React;

const SORTS = ["Relevance", "Rating", "Distance", "Newest", "A–Z"];

function buildCatTree() {
  const K = window.KFY;
  const tree = {};
  K.BUSINESSES.forEach((b) => {
    (tree[b.parentCat] = tree[b.parentCat] || new Set()).add(b.cat);
  });
  return Object.entries(tree).map(([parent, set]) => ({ parent, cats: [...set] }));
}

function DirFilters({ filters, setFilters, resultCount }) {
  const K = window.KFY;
  const tree = buildCatTree();
  const [openCats, setOpenCats] = useStateDir(() => tree.map((t) => t.parent));
  const set = (k, v) => setFilters({ ...filters, [k]: v });
  const toggleCat = (c) => {
    const has = filters.cats.includes(c);
    set("cats", has ? filters.cats.filter((x) => x !== c) : [...filters.cats, c]);
  };
  const togglePrice = (p) => {
    const has = filters.prices.includes(p);
    set("prices", has ? filters.prices.filter((x) => x !== p) : [...filters.prices, p]);
  };
  const clearAll = () => setFilters({ cats: [], hood: "All", rating: 0, openNow: false, prices: [] });
  const activeCount = filters.cats.length + filters.prices.length + (filters.hood !== "All" ? 1 : 0) +
    (filters.rating ? 1 : 0) + (filters.openNow ? 1 : 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="filter" size={17} /> Filters</h3>
        {activeCount > 0 && (
          <button onClick={clearAll} style={{ background: "none", border: 0, cursor: "pointer",
            color: "var(--accent-strong)", fontWeight: 700, fontSize: 13.5 }}>Clear ({activeCount})</button>
        )}
      </div>

      {/* Open now toggle */}
      <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        cursor: "pointer", padding: "12px 14px", background: "var(--limestone)", borderRadius: "var(--r-sm)",
        border: "1px solid var(--line)" }}>
        <span style={{ fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="clock" size={16} style={{ color: "var(--tag-local)" }} /> Open Now</span>
        <Switch on={filters.openNow} onChange={() => set("openNow", !filters.openNow)} />
      </label>

      {/* Hierarchical category */}
      <FilterGroup title="Category">
        <div style={{ display: "flex", flexDirection: "column" }}>
          {tree.map((t) => {
            const isOpen = openCats.includes(t.parent);
            return (
              <div key={t.parent}>
                <button onClick={() => setOpenCats((o) => o.includes(t.parent) ? o.filter((x) => x !== t.parent) : [...o, t.parent])}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
                    background: "none", border: 0, padding: "9px 0", cursor: "pointer", color: "var(--ink)",
                    fontWeight: 700, fontSize: 14.5 }}>
                  {t.parent}
                  <Icon name="chevD" size={15} style={{ transform: isOpen ? "none" : "rotate(-90deg)",
                    transition: "transform .15s", color: "var(--ink-faint)" }} />
                </button>
                {isOpen && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingLeft: 4, paddingBottom: 6 }}>
                    {t.cats.map((c) => (
                      <Check key={c} label={c} checked={filters.cats.includes(c)} onChange={() => toggleCat(c)} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </FilterGroup>

      {/* Neighbourhood */}
      <FilterGroup title="Neighbourhood">
        <select className="select" value={filters.hood} onChange={(e) => set("hood", e.target.value)}>
          <option value="All">All neighbourhoods</option>
          {K.NEIGHBOURHOODS.map((h) => <option key={h}>{h}</option>)}
        </select>
      </FilterGroup>

      {/* Rating */}
      <FilterGroup title="Minimum rating">
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[{ v: 0, l: "Any rating" }, { v: 4.0, l: "4.0 & up" }, { v: 4.5, l: "4.5 & up" }, { v: 4.8, l: "4.8 & up" }].map((r) => (
            <label key={r.v} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 0", cursor: "pointer" }}>
              <Radio checked={filters.rating === r.v} onChange={() => set("rating", r.v)} />
              <span style={{ fontSize: 14.5, fontWeight: 600, color: filters.rating === r.v ? "var(--ink)" : "var(--ink-soft)" }}>{r.l}</span>
            </label>
          ))}
        </div>
      </FilterGroup>

      {/* Price */}
      <FilterGroup title="Price">
        <div style={{ display: "flex", gap: 8 }}>
          {["$", "$$", "$$$"].map((p) => (
            <button key={p} onClick={() => togglePrice(p)}
              className={"chip" + (filters.prices.includes(p) ? " is-active" : "")}
              style={{ flex: 1, justifyContent: "center" }}>{p}</button>
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
      <div style={{ fontWeight: 800, fontSize: 12.5, letterSpacing: ".06em", textTransform: "uppercase",
        color: "var(--ink-faint)", marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}
function Switch({ on, onChange }) {
  return (
    <button onClick={onChange} aria-pressed={on} style={{ width: 42, height: 24, borderRadius: 999, border: 0,
      background: on ? "var(--accent)" : "var(--line-strong)", position: "relative", cursor: "pointer",
      transition: "background .15s", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 2, left: on ? 20 : 2, width: 20, height: 20, borderRadius: 999,
        background: "#fff", transition: "left .15s", boxShadow: "0 1px 3px rgba(0,0,0,.25)" }} />
    </button>
  );
}
function Check({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 0", cursor: "pointer" }}>
      <span style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0,
        border: "1.5px solid " + (checked ? "var(--accent)" : "var(--line-strong)"),
        background: checked ? "var(--accent)" : "var(--card)", display: "inline-flex",
        alignItems: "center", justifyContent: "center" }}>
        {checked && <Icon name="check" size={13} style={{ color: "#fff" }} stroke={3} />}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span style={{ fontSize: 14, fontWeight: 600, color: checked ? "var(--ink)" : "var(--ink-soft)" }}>{label}</span>
    </label>
  );
}
function Radio({ checked, onChange }) {
  return (
    <span onClick={onChange} style={{ width: 18, height: 18, borderRadius: 999, flexShrink: 0, cursor: "pointer",
      border: "1.5px solid " + (checked ? "var(--accent)" : "var(--line-strong)"), display: "inline-flex",
      alignItems: "center", justifyContent: "center" }}>
      {checked && <span style={{ width: 9, height: 9, borderRadius: 999, background: "var(--accent)" }} />}
    </span>
  );
}

function applyBizFilters(list, f, q) {
  return list.filter((b) => {
    if (q && q.trim()) {
      const s = q.toLowerCase();
      if (!(b.name.toLowerCase().includes(s) || b.cat.toLowerCase().includes(s) ||
        b.hood.toLowerCase().includes(s) || b.blurb.toLowerCase().includes(s))) return false;
    }
    if (f.cats.length && !f.cats.includes(b.cat)) return false;
    if (f.hood !== "All" && b.hood !== f.hood) return false;
    if (f.rating && b.rating < f.rating) return false;
    if (f.openNow && !b.openNow) return false;
    if (f.prices.length && !f.prices.includes(b.price)) return false;
    return true;
  });
}
function sortBiz(list, sort) {
  const a = [...list];
  if (sort === "Rating") a.sort((x, y) => y.rating - x.rating);
  else if (sort === "A–Z") a.sort((x, y) => x.name.localeCompare(y.name));
  else if (sort === "Newest") a.reverse();
  else if (sort === "Distance") a.sort((x, y) => (x.y + x.x) - (y.y + y.x));
  return a;
}

function DirectoryPage({ navigate, params }) {
  const K = window.KFY;
  const [q, setQ] = useStateDir(params && params.q ? params.q : "");
  const [sort, setSort] = useStateDir("Relevance");
  const [filters, setFilters] = useStateDir({ cats: [], hood: "All", rating: 0, openNow: false, prices: [] });
  const [hovered, setHovered] = useStateDir(null);
  const [mobileView, setMobileView] = useStateDir("list"); // list | map
  const [showFilters, setShowFilters] = useStateDir(false);

  const results = useMemoDir(() => sortBiz(applyBizFilters(K.BUSINESSES, filters, q), sort), [filters, q, sort]);
  const pins = results.map((b) => ({ id: b.id, x: b.x, y: b.y, label: b.name }));
  const suggestions = K.BUSINESSES.map((b) => ({ label: b.name, kind: b.cat, icon: "pin", id: b.id }));

  return (
    <div className="kf-route kf-dir">
      {/* top search bar */}
      <div style={{ borderBottom: "1px solid var(--line)", background: "var(--paper)" }}>
        <div className="kf-wrap" style={{ padding: "18px 28px", display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ flex: 1, maxWidth: 560 }}>
            <SearchBar value={q} onChange={setQ} placeholder="Search businesses by name, type or neighbourhood"
              suggestions={suggestions} onPick={(m) => navigate("business", { id: m.id })} onSubmit={setQ} />
          </div>
          <button className="btn btn-ghost kf-filter-btn" onClick={() => setShowFilters((v) => !v)}
            style={{ display: "none" }}>
            <Icon name="filter" size={16} /> Filters
          </button>
          {/* mobile list/map toggle */}
          <div className="kf-map-toggle" style={{ display: "none", marginLeft: "auto" }}>
            <div style={{ display: "inline-flex", background: "var(--limestone-2)", padding: 3, borderRadius: "var(--r-sm)", gap: 3 }}>
              {[["list", "list"], ["map", "map"]].map(([k, ic]) => (
                <button key={k} onClick={() => setMobileView(k)} style={{ padding: "8px 16px", border: 0, borderRadius: 5,
                  background: mobileView === k ? "var(--card)" : "transparent", cursor: "pointer", fontWeight: 700,
                  display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14,
                  color: mobileView === k ? "var(--slate-900)" : "var(--ink-soft)" }}>
                  <Icon name={ic} size={15} /> {k === "list" ? "List" : "Map"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* split body */}
      <div className="kf-dir-body">
        {/* FILTERS (visible by default on desktop) */}
        <aside className={"kf-dir-filters scroll-y" + (showFilters ? " is-open" : "")}>
          <div style={{ padding: "22px 22px 40px" }}>
            <DirFilters filters={filters} setFilters={setFilters} />
            <button className="btn btn-dark kf-apply-filters" style={{ display: "none", width: "100%", marginTop: 20 }}
              onClick={() => setShowFilters(false)}>Show {results.length} results</button>
          </div>
        </aside>

        {/* LIST */}
        <section className={"kf-dir-list scroll-y" + (mobileView === "map" ? " kf-mobile-hidden" : "")}>
          <div style={{ padding: "18px 22px 40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <h1 style={{ fontSize: 26, whiteSpace: "nowrap" }}>Business Directory</h1>
                <div className="meta" style={{ marginTop: 4, fontSize: 14 }}>
                  <strong style={{ color: "var(--ink)" }}>{results.length}</strong> places in Kingston
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="faint" style={{ fontSize: 13.5, fontWeight: 600 }}>Sort</span>
                <select className="select" style={{ width: "auto", paddingRight: 32, fontSize: 14.5 }}
                  value={sort} onChange={(e) => setSort(e.target.value)}>
                  {SORTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            {/* active filter chips */}
            <ActiveChips filters={filters} setFilters={setFilters} q={q} setQ={setQ} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
              {results.map((b) => (
                <BusinessCard key={b.id} item={b} navigate={navigate} variant="list"
                  active={hovered === b.id} onHover={setHovered} />
              ))}
              {results.length === 0 && (
                <div style={{ textAlign: "center", padding: "50px 20px", color: "var(--ink-faint)" }}>
                  <Icon name="search" size={32} stroke={1.4} style={{ margin: "0 auto 10px" }} />
                  <p style={{ fontWeight: 600, color: "var(--ink-soft)", fontSize: 16 }}>No businesses match your search.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* MAP */}
        <section className={"kf-dir-map" + (mobileView === "list" ? " kf-mobile-hidden" : "")}>
          <KMap pins={pins} activeId={hovered} onPinHover={setHovered}
            onPinClick={(id) => navigate("business", { id })} />
        </section>
      </div>
    </div>
  );
}

function ActiveChips({ filters, setFilters, q, setQ }) {
  const chips = [];
  if (q) chips.push({ label: `"${q}"`, clear: () => setQ("") });
  if (filters.openNow) chips.push({ label: "Open Now", clear: () => setFilters({ ...filters, openNow: false }) });
  if (filters.hood !== "All") chips.push({ label: filters.hood, clear: () => setFilters({ ...filters, hood: "All" }) });
  if (filters.rating) chips.push({ label: filters.rating + "+ stars", clear: () => setFilters({ ...filters, rating: 0 }) });
  filters.cats.forEach((c) => chips.push({ label: c, clear: () => setFilters({ ...filters, cats: filters.cats.filter((x) => x !== c) }) }));
  filters.prices.forEach((p) => chips.push({ label: p, clear: () => setFilters({ ...filters, prices: filters.prices.filter((x) => x !== p) }) }));
  if (!chips.length) return null;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {chips.map((c, i) => (
        <button key={i} className="chip is-active" onClick={c.clear} style={{ paddingRight: 9 }}>
          {c.label} <Icon name="close" size={13} className="chip-x" />
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   BUSINESS DETAIL
   ============================================================ */
function BusinessPage({ navigate, params }) {
  const K = window.KFY;
  const b = K.bizById(params.id) || K.BUSINESSES[0];
  const events = (b.events || []).map(K.eventById).filter(Boolean);
  const reviews = K.REVIEWS;
  const hours = [
    ["Monday", b.hours], ["Tuesday", b.hours], ["Wednesday", b.hours], ["Thursday", b.hours],
    ["Friday", "11 AM – 11 PM"], ["Saturday", "10 AM – 11 PM"], ["Sunday", "10 AM – 8 PM"],
  ];
  const todayIdx = 5; // Saturday May 30

  return (
    <div className="kf-route">
      {/* gallery */}
      <div className="kf-wrap" style={{ padding: "20px 28px 0" }}>
        <button onClick={() => navigate("directory")} style={{ background: "none", border: 0, cursor: "pointer",
          color: "var(--ink-soft)", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600,
          fontSize: 14, padding: 0, marginBottom: 16 }}>
          <Icon name="chevL" size={16} /> Back to Directory</button>
        <div className="kf-gallery" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr",
          gridTemplateRows: "1fr 1fr", gap: 8, height: 340, borderRadius: "var(--r)", overflow: "hidden" }}>
          <div style={{ gridRow: "1 / span 2" }}><Ph hue={b.ph} height="100%" icon="pin" label="Main photo" /></div>
          <div><Ph hue="ph-c" height="100%" /></div>
          <div style={{ position: "relative" }}><Ph hue="ph-b" height="100%" /></div>
          <div><Ph hue="ph-e" height="100%" /></div>
          <div style={{ position: "relative" }}>
            <Ph hue="ph-f" height="100%" />
            <button style={{ position: "absolute", inset: 0, background: "rgba(16,24,30,.55)", border: 0,
              color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", gap: 7 }}>
              <Icon name="grid" size={16} /> +8 photos</button>
          </div>
        </div>
      </div>

      <div className="kf-wrap" style={{ padding: "26px 28px 56px" }}>
        {/* header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          flexWrap: "wrap", gap: 18, marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 40 }}>{b.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, padding: "4px 10px", borderRadius: "var(--r-pill)",
                background: b.openNow ? "var(--accent-soft)" : "var(--limestone-2)",
                color: b.openNow ? "var(--accent-strong)" : "var(--ink-soft)" }}>
                {b.openNow ? "Open now" : "Closed"} · {b.hours}</span>
              <Stars value={b.rating} count={b.reviews} />
              <span className="meta">{b.cat} <span className="dot-sep">·</span> {b.price} <span className="dot-sep">·</span> {b.hood}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <button className="btn btn-ghost"><Icon name="share" size={16} /> Share</button>
            <button className="btn btn-primary"><Icon name="globe" size={16} /> Visit website</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "18px 0 4px" }}>
          {b.tags.map((t) => <span key={t} className="tag tag-outline">{t}</span>)}
        </div>

        <div className="kf-detail-layout" style={{ display: "grid", gridTemplateColumns: "1fr 360px",
          gap: 44, alignItems: "start", marginTop: 24 }}>
          {/* main */}
          <div>
            <Section title="About">
              <p style={{ fontSize: 18, lineHeight: 1.65, color: "var(--ink)" }}>{b.blurb}</p>
              <p style={{ fontSize: 18, lineHeight: 1.65, color: "var(--ink-soft)", marginTop: 14 }}>
                A neighbourhood fixture in {b.hood}, {b.name} is part of what makes this corner of Kingston
                worth the trip. Stop in, say hello, and tell them Kingston.FYI sent you.
              </p>
            </Section>

            {/* upcoming events rail (cross-link) */}
            {events.length > 0 && (
              <Section title="Upcoming events at this venue">
                <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 6 }}>
                  {events.map((e) => <EventCard key={e.id} item={e} navigate={navigate} variant="row" />)}
                </div>
              </Section>
            )}

            {/* reviews */}
            <Section title={`Reviews (${b.reviews})`}>
              <div style={{ display: "flex", gap: 24, alignItems: "center", padding: "16px 20px",
                background: "var(--limestone)", borderRadius: "var(--r)", marginBottom: 20 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 48, fontWeight: 700, lineHeight: 1, color: "var(--slate-900)" }}>{b.rating}</div>
                  <Stars value={b.rating} showNum={false} />
                  <div className="faint" style={{ fontSize: 12.5, marginTop: 4 }}>{b.reviews} reviews</div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  {[5, 4, 3, 2, 1].map((n) => {
                    const pct = n === 5 ? 72 : n === 4 ? 20 : n === 3 ? 5 : n === 2 ? 2 : 1;
                    return (
                      <div key={n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span className="faint" style={{ fontSize: 12.5, width: 12 }}>{n}</span>
                        <span style={{ flex: 1, height: 7, borderRadius: 5, background: "var(--line-strong)", overflow: "hidden" }}>
                          <span style={{ display: "block", height: "100%", width: pct + "%", background: "var(--accent)" }} /></span>
                        <span className="faint" style={{ fontSize: 12.5, width: 32, textAlign: "right" }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {reviews.map((r) => (
                  <div key={r.id} style={{ padding: "16px 0", borderTop: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ width: 38, height: 38, borderRadius: 999, background: "var(--limestone-2)",
                        display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
                        color: "var(--slate-700)", fontFamily: "var(--serif)" }}>{r.name[0]}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{r.name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Stars value={r.rating} showNum={false} /><span className="faint" style={{ fontSize: 12.5 }}>{r.date}</span>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: 15.5, lineHeight: 1.55, color: "var(--ink)" }}>{r.text}</p>
                  </div>
                ))}
              </div>
              <button className="btn btn-ghost" style={{ marginTop: 16 }}>Read all {b.reviews} reviews</button>
            </Section>
          </div>

          {/* sidebar */}
          <aside className="kf-detail-side" style={{ position: "sticky", top: 84, display: "flex", flexDirection: "column", gap: 18 }}>
            {/* contact + map */}
            <div className="card" style={{ overflow: "hidden", padding: 0 }}>
              <div style={{ height: 200 }}>
                <KMap single pins={[{ id: b.id, x: b.x, y: b.y, label: b.name }]} activeId={b.id} showLabel={false} />
              </div>
              <div style={{ padding: "18px 20px" }}>
                <ContactRow icon="pin" value={b.address} sub={b.hood + ", Kingston ON"} />
                <ContactRow icon="phone" value={b.phone} />
                <ContactRow icon="globe" value={b.web} link last />
                <div style={{ display: "flex", gap: 9, marginTop: 16 }}>
                  <button className="btn btn-dark btn-sm" style={{ flex: 1 }}><Icon name="external" size={15} /> Directions</button>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}><Icon name="phone" size={15} /> Call</button>
                </div>
              </div>
            </div>
            {/* hours */}
            <div className="card" style={{ padding: "18px 20px" }}>
              <h3 style={{ fontSize: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="clock" size={16} /> Hours</h3>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {hours.map(([day, h], i) => (
                  <div key={day} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0",
                    fontSize: 14.5, borderTop: i ? "1px solid var(--line)" : "none",
                    fontWeight: i === todayIdx ? 700 : 500, color: i === todayIdx ? "var(--ink)" : "var(--ink-soft)" }}>
                    <span>{day}{i === todayIdx ? " (Today)" : ""}</span><span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 38 }}>
      <h2 style={{ fontSize: 24, marginBottom: 14, paddingBottom: 8, borderBottom: "2px solid var(--slate-800)" }}>{title}</h2>
      {children}
    </div>
  );
}
function ContactRow({ icon, value, sub, link, last }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: last ? "none" : "1px solid var(--line)" }}>
      <Icon name={icon} size={17} style={{ color: "var(--accent-strong)", marginTop: 2 }} />
      <div>
        <div style={{ fontWeight: 600, fontSize: 15, color: link ? "var(--accent-strong)" : "var(--ink)" }}>{value}</div>
        {sub && <div className="meta" style={{ fontSize: 13 }}>{sub}</div>}
      </div>
    </div>
  );
}

Object.assign(window, { DirectoryPage, BusinessPage });
