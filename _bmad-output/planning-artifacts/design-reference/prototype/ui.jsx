/* ============================================================
   Kingston.FYI — icons + UI atoms
   Exposes components to window
   ============================================================ */
const { useState, useEffect, useRef } = React;

/* ---------- icon set (stroke-based, 24x24) ---------- */
const ICONS = {
  search:   "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5",
  menu:     "M3 6h18M3 12h18M3 18h18",
  close:    "M6 6l12 12M18 6L6 18",
  pin:      "M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z M12 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  clock:    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7.5V12l3 2",
  calendar: "M7 3v3M17 3v3M4 8.5h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  chevR:    "M9 6l6 6-6 6",
  chevL:    "M15 6l-6 6 6 6",
  chevD:    "M6 9l6 6 6-6",
  arrowR:   "M5 12h14M13 6l6 6-6 6",
  phone:    "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 18l5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 6a2 2 0 0 1 2-2z",
  globe:    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3 12h18 M12 3c2.5 2.5 2.5 15.5 0 18 M12 3c-2.5 2.5-2.5 15.5 0 18",
  share:    "M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7 M16 6l-4-4-4 4 M12 2v13",
  plus:     "M12 5v14M5 12h14",
  filter:   "M3 5h18l-7 8v6l-4 2v-8z",
  list:     "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  grid:     "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  map:      "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z M9 4v14 M15 6v14",
  mail:     "M3 6h18v12H3z M3 7l9 6 9-6",
  ticket:   "M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4z",
  check:    "M5 13l4 4L19 7",
  external: "M14 4h6v6 M20 4l-9 9 M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6",
  user:     "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0",
  pinSmall: "M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z",
};

function Icon({ name, size = 18, stroke = 2, fill = "none", className, style }) {
  const d = ICONS[name];
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24"
      fill={fill === "current" ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: "block", ...style }}>
      <path d={d} />
    </svg>
  );
}

/* ---------- logo wordmark ---------- */
function Logo({ light = false, size = 26, onClick }) {
  return (
    <button onClick={onClick} aria-label="Kingston.FYI home"
      style={{
        background: "none", border: 0, padding: 0, cursor: "pointer",
        display: "inline-flex", alignItems: "baseline",
        fontFamily: "var(--serif)", fontWeight: 700, letterSpacing: "-0.02em",
        fontSize: size, lineHeight: 1,
        color: light ? "var(--paper)" : "var(--slate-900)",
      }}>
      <span>Kingston</span>
      <span style={{ color: "var(--accent)", fontWeight: 700 }}>.FYI</span>
    </button>
  );
}

/* ---------- category / event tag ---------- */
function CatTag({ catKey, label, color, small }) {
  const meta = catKey ? window.KFY.catMeta(catKey) : null;
  const bg = color || (meta && meta.color) || "var(--slate-700)";
  const text = label || (meta && meta.label) || "";
  return (
    <span className="tag" style={{ background: bg, fontSize: small ? "10.5px" : undefined,
      padding: small ? "3px 7px" : undefined }}>{text}</span>
  );
}

/* ---------- star rating ---------- */
function Stars({ value = 0, showNum = true, count }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="meta" style={{ gap: 7 }}>
      <span className="stars" aria-label={value + " stars"}>
        {[0, 1, 2, 3, 4].map((i) => {
          const on = i < full;
          const isHalf = i === full && half;
          return (
            <svg key={i} viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <defs>
                <linearGradient id={"half" + i}>
                  <stop offset="50%" stopColor="var(--accent)" />
                  <stop offset="50%" stopColor="var(--line-strong)" />
                </linearGradient>
              </defs>
              <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 21.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"
                fill={on ? "var(--accent)" : isHalf ? "url(#half" + i + ")" : "var(--line-strong)"} />
            </svg>
          );
        })}
      </span>
      {showNum && <span className="rating-num">{value.toFixed(1)}</span>}
      {count != null && <span className="rating-count">({count})</span>}
    </span>
  );
}

/* ---------- image placeholder ---------- */
function Ph({ hue = "ph-a", label, ratio, height, icon, rounded, style, children }) {
  const padTop = ratio ? `${(1 / ratio) * 100}%` : undefined;
  return (
    <div className={"ph " + hue} style={{
      width: "100%",
      height: ratio ? 0 : height,
      paddingTop: padTop,
      borderRadius: rounded ? "var(--r)" : 0,
      ...style,
    }}>
      <div style={{ position: ratio ? "absolute" : "static", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
        {icon && <Icon name={icon} size={26} stroke={1.6} style={{ opacity: .7 }} />}
        {label && <span className="ph-label">{label}</span>}
        {children}
      </div>
    </div>
  );
}

/* ---------- search bar ---------- */
function SearchBar({ placeholder = "Search news, events & businesses", value, onChange,
  onSubmit, suggestions, compact, onPick }) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(value || "");
  const wrapRef = useRef(null);
  const q = value != null ? value : local;
  const setQ = (v) => { onChange ? onChange(v) : setLocal(v); };

  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const matches = (suggestions && q.trim())
    ? suggestions.filter((s) => s.label.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : [];

  return (
    <div ref={wrapRef} style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit && onSubmit(q); setOpen(false); }}
        style={{ display: "flex", alignItems: "center", gap: 8,
          background: "var(--card)", border: "1px solid var(--line-strong)",
          borderRadius: "var(--r-pill)", padding: compact ? "7px 14px" : "9px 16px",
          transition: "border-color .15s, box-shadow .15s" }}
        onFocus={() => setOpen(true)}>
        <Icon name="search" size={compact ? 16 : 18} style={{ color: "var(--ink-faint)" }} />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          placeholder={placeholder}
          style={{ border: 0, outline: "none", background: "none", flex: 1, minWidth: 0,
            fontFamily: "var(--sans)", fontSize: compact ? "14.5px" : "15.5px", color: "var(--ink)" }}
        />
      </form>
      {open && matches.length > 0 && (
        <div className="card" style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
          zIndex: 60, boxShadow: "var(--shadow-lg)", padding: 6, borderRadius: "var(--r)" }}>
          {matches.map((m, i) => (
            <button key={i} onClick={() => { onPick ? onPick(m) : (onSubmit && onSubmit(m.label)); setOpen(false); setQ(m.label); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%",
                background: "none", border: 0, padding: "9px 11px", borderRadius: "var(--r-sm)",
                textAlign: "left", cursor: "pointer", color: "var(--ink)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--limestone)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
              <Icon name={m.icon || "search"} size={15} style={{ color: "var(--ink-faint)" }} />
              <span style={{ fontSize: 15, fontWeight: 600 }}>{m.label}</span>
              {m.kind && <span className="faint" style={{ marginLeft: "auto", fontSize: 12.5,
                textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 700 }}>{m.kind}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- price dots ---------- */
function PriceTag({ value }) {
  return <span className="meta" style={{ fontWeight: 700, color: "var(--ink-soft)", fontSize: 14 }}>{value}</span>;
}

Object.assign(window, { Icon, ICONS, Logo, CatTag, Stars, Ph, SearchBar, PriceTag });
