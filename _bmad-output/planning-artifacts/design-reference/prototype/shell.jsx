/* ============================================================
   Kingston.FYI — global shell: Header + Footer
   ============================================================ */
const { useState: useStateShell, useEffect: useEffectShell } = React;

function buildSuggestions() {
  const K = window.KFY;
  return [
    ...K.NEWS.map((n) => ({ label: n.title, kind: "News", icon: "list", go: { name: "article", id: n.id } })),
    ...K.EVENTS.map((e) => ({ label: e.title, kind: "Event", icon: "calendar", go: { name: "event", id: e.id } })),
    ...K.BUSINESSES.map((b) => ({ label: b.name, kind: "Business", icon: "pin", go: { name: "business", id: b.id } })),
  ];
}

function Header({ route, navigate, dark }) {
  const [scrolled, setScrolled] = useStateShell(false);
  const [menuOpen, setMenuOpen] = useStateShell(false);
  const [mSearch, setMSearch] = useStateShell(false);

  useEffectShell(() => {
    const h = () => setScrolled(window.scrollY > 6);
    h(); window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  useEffectShell(() => { setMenuOpen(false); setMSearch(false); }, [route.name]);

  const isDark = dark;
  const navItems = [
    { label: "News", name: "news" },
    { label: "Events", name: "events" },
    { label: "Directory", name: "directory" },
  ];
  const active = (n) =>
    route.name === n ||
    (n === "news" && route.name === "article") ||
    (n === "events" && route.name === "event") ||
    (n === "directory" && route.name === "business");

  const suggestions = buildSuggestions();
  const onPick = (m) => m.go && navigate(m.go.name, { id: m.go.id });

  const headBg = isDark ? "var(--slate-800)" : "var(--paper)";
  const headColor = isDark ? "var(--paper)" : "var(--slate-900)";
  const borderC = isDark ? "rgba(255,255,255,.12)" : "var(--line)";

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: headBg, color: headColor,
      borderBottom: "1px solid " + borderC,
      boxShadow: scrolled ? (isDark ? "0 2px 14px rgba(0,0,0,.28)" : "var(--shadow-sm)") : "none",
      transition: "box-shadow .2s ease",
    }}>
      <div className="kf-wrap" style={{ display: "flex", alignItems: "center", gap: 18,
        height: 68 }}>
        <Logo light={isDark} size={25} onClick={() => navigate("home")} />

        {/* desktop nav */}
        <nav className="kf-desktop-nav" style={{ display: "flex", gap: 4, marginLeft: 6 }}>
          {navItems.map((it) => (
            <button key={it.name} onClick={() => navigate(it.name)}
              style={{
                background: "none", border: 0, cursor: "pointer",
                fontFamily: "var(--sans)", fontWeight: 700, fontSize: 16,
                color: active(it.name) ? "var(--accent)" : (isDark ? "var(--paper)" : "var(--slate-800)"),
                padding: "8px 14px", borderRadius: "var(--r-sm)",
                position: "relative",
              }}>
              {it.label}
              {active(it.name) && <span style={{ position: "absolute", left: 14, right: 14, bottom: 2,
                height: 2.5, background: "var(--accent)", borderRadius: 2 }} />}
            </button>
          ))}
        </nav>

        {/* desktop search */}
        <div className="kf-desktop-search" style={{ flex: 1, maxWidth: 420, marginLeft: "auto" }}>
          <SearchBar compact suggestions={suggestions} onPick={onPick}
            onSubmit={(q) => navigate("directory", { q })} />
        </div>

        <button className="btn btn-primary kf-desktop-cta" onClick={() => navigate("submit")}>
          <Icon name="plus" size={16} /> Submit
        </button>

        {/* mobile controls */}
        <div className="kf-mobile-controls" style={{ display: "none", alignItems: "center", gap: 6, marginLeft: "auto" }}>
          <button aria-label="Search" onClick={() => { setMSearch((v) => !v); setMenuOpen(false); }}
            style={iconBtn(isDark)}><Icon name="search" size={20} /></button>
          <button aria-label="Menu" onClick={() => { setMenuOpen((v) => !v); setMSearch(false); }}
            style={iconBtn(isDark)}><Icon name={menuOpen ? "close" : "menu"} size={22} /></button>
        </div>
      </div>

      {/* mobile search drawer */}
      {mSearch && (
        <div className="kf-mobile-only" style={{ padding: "0 20px 14px", background: headBg }}>
          <SearchBar suggestions={suggestions} onPick={onPick} onSubmit={(q) => navigate("directory", { q })} />
        </div>
      )}

      {/* mobile menu */}
      {menuOpen && (
        <div className="kf-mobile-only" style={{ background: headBg, borderTop: "1px solid " + borderC,
          padding: "10px 16px 18px" }}>
          {navItems.map((it) => (
            <button key={it.name} onClick={() => navigate(it.name)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", background: "none", border: 0, borderBottom: "1px solid " + borderC,
                padding: "15px 4px", fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600,
                color: active(it.name) ? "var(--accent)" : headColor, cursor: "pointer" }}>
              {it.label} <Icon name="chevR" size={18} style={{ opacity: .5 }} />
            </button>
          ))}
          <button className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 16 }}
            onClick={() => navigate("submit")}>
            <Icon name="plus" size={18} /> Submit a listing or event
          </button>
        </div>
      )}
    </header>
  );
}

function iconBtn(dark) {
  return {
    background: "none", border: 0, cursor: "pointer", padding: 8, borderRadius: "var(--r-sm)",
    color: dark ? "var(--paper)" : "var(--slate-800)", display: "inline-flex",
  };
}

/* ---------- newsletter band (reused) ---------- */
function NewsletterBand({ compact }) {
  const [email, setEmail] = useStateShell("");
  const [done, setDone] = useStateShell(false);
  return (
    <div style={{
      background: "var(--slate-800)", color: "var(--paper)",
      borderRadius: compact ? "var(--r)" : 0, overflow: "hidden",
    }}>
      <div className={compact ? "" : "kf-wrap"} style={{
        display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap",
        padding: compact ? "26px 26px" : "44px 28px", justifyContent: "space-between",
      }}>
        <div style={{ maxWidth: 520, minWidth: 260, flex: 1 }}>
          <div className="eyebrow" style={{ color: "var(--accent)" }}>The Limestone Letter</div>
          <h3 style={{ color: "var(--paper)", fontSize: compact ? 24 : 30, marginTop: 8 }}>
            Kingston, in your inbox every morning.
          </h3>
          <p style={{ color: "rgba(255,255,255,.72)", marginTop: 8, fontSize: 15.5 }}>
            The day's local news, tonight's events and a new business worth a visit — free, no fluff.
          </p>
        </div>
        {done ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--paper)",
            fontWeight: 600, fontSize: 17 }}>
            <span style={{ display: "inline-flex", width: 30, height: 30, borderRadius: 999,
              background: "var(--accent)", alignItems: "center", justifyContent: "center" }}>
              <Icon name="check" size={18} /></span>
            You're on the list.
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (email.trim()) setDone(true); }}
            style={{ display: "flex", gap: 10, flexWrap: "wrap", minWidth: 280, flex: "0 1 440px" }}>
            <input className="input" type="email" required placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ flex: 1, minWidth: 200, background: "rgba(255,255,255,.96)", border: "1px solid transparent" }} />
            <button className="btn btn-primary btn-lg" type="submit">Subscribe</button>
          </form>
        )}
      </div>
    </div>
  );
}

function Footer({ navigate }) {
  const cols = [
    { h: "Sections", links: [["Local News", "news"], ["Events", "events"], ["Business Directory", "directory"], ["Submit a Listing", "submit"]] },
    { h: "Explore", links: [["This Weekend", "events"], ["Open Now", "directory"], ["Trending", "news"], ["Neighbourhoods", "directory"]] },
    { h: "About", links: [["Our Mission", "home"], ["Contact", "home"], ["Advertise", "home"], ["Editorial Policy", "home"]] },
  ];
  return (
    <footer style={{ background: "var(--slate-900)", color: "rgba(255,255,255,.74)", marginTop: 0 }}>
      <div className="kf-wrap" style={{ padding: "52px 28px 28px" }}>
        <div className="kf-footer-grid" style={{ display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: 36 }}>
          <div>
            <Logo light size={26} onClick={() => navigate("home")} />
            <p style={{ marginTop: 14, maxWidth: 300, fontSize: 14.5, lineHeight: 1.6 }}>
              Independent, hyperlocal coverage of Kingston, Ontario — the news, events and businesses
              that make the Limestone City tick.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              {["share", "mail", "globe"].map((ic) => (
                <a key={ic} href="#" onClick={(e) => e.preventDefault()} aria-label={ic}
                  style={{ width: 38, height: 38, borderRadius: 999, border: "1px solid rgba(255,255,255,.18)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,.8)" }}>
                  <Icon name={ic} size={17} />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase",
                color: "var(--paper)", marginBottom: 14 }}>{c.h}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {c.links.map(([label, name]) => (
                  <button key={label} onClick={() => navigate(name)}
                    style={{ background: "none", border: 0, padding: 0, textAlign: "left", cursor: "pointer",
                      color: "rgba(255,255,255,.74)", fontSize: 14.5, fontFamily: "var(--sans)" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,.74)"}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.12)", marginTop: 40, paddingTop: 22,
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          fontSize: 13.5, color: "rgba(255,255,255,.5)" }}>
          <span>© 2026 Kingston.FYI — A community publication.</span>
          <span style={{ display: "flex", gap: 18 }}>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "inherit" }}>Privacy</a>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "inherit" }}>Terms</a>
            <span>Kingston, Ontario</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Header, Footer, NewsletterBand, buildSuggestions });
