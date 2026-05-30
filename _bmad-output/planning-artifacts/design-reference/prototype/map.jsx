/* ============================================================
   Kingston.FYI — stylized map (SVG, no external API)
   A schematic of downtown Kingston: limestone street grid +
   Lake Ontario / Cataraqui waterfront + pins.
   ============================================================ */

function KMap({ pins = [], activeId, onPinHover, onPinClick, single, height = "100%", showLabel = true }) {
  // pins: [{id,x,y,label,active}] x/y in 0..100 percent
  return (
    <div style={{ position: "relative", width: "100%", height, background: "#dfe7e3", overflow: "hidden" }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {/* land */}
        <rect x="0" y="0" width="100" height="100" fill="#e7ecdf" />

        {/* water — Lake Ontario / Cataraqui River wrapping bottom-right */}
        <path d="M62 -2 Q70 22 64 40 Q60 56 72 70 Q82 84 78 102 L102 102 L102 -2 Z" fill="#bcd2d8" />
        <path d="M-2 78 Q26 72 44 82 Q58 90 72 86 L102 92 L102 102 L-2 102 Z" fill="#bcd2d8" />
        {/* water hatch */}
        <path d="M62 -2 Q70 22 64 40 Q60 56 72 70 Q82 84 78 102 L102 102 L102 -2 Z" fill="none"
          stroke="#a9c4cb" strokeWidth=".4" opacity=".6" />

        {/* parks (limestone green) */}
        <rect x="30" y="34" width="13" height="10" rx="1.5" fill="#cdd9bf" />
        <rect x="14" y="58" width="11" height="9" rx="1.5" fill="#cdd9bf" />

        {/* street grid */}
        <g stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" opacity=".95">
          {/* horizontals */}
          {[18, 30, 42, 54, 66].map((y) => (
            <line key={"h" + y} x1="2" y1={y} x2={y < 50 ? 70 : 80} y2={y + (y > 40 ? 4 : 0)} />
          ))}
          {/* verticals */}
          {[14, 26, 38, 50].map((x) => (
            <line key={"v" + x} x1={x} y1="6" x2={x + (x > 30 ? 6 : 2)} y2={x > 30 ? 74 : 70} />
          ))}
        </g>
        {/* thin street casing */}
        <g stroke="#d8ddcf" strokeWidth="3" strokeLinecap="round" opacity=".4">
          {[18, 30, 42, 54, 66].map((y) => (
            <line key={"hc" + y} x1="2" y1={y} x2={y < 50 ? 70 : 80} y2={y + (y > 40 ? 4 : 0)} />
          ))}
        </g>

        {/* a main diagonal (Princess St) */}
        <line x1="6" y1="70" x2="52" y2="14" stroke="#f4efe6" strokeWidth="3.4" strokeLinecap="round" />
      </svg>

      {/* water label */}
      {showLabel && (
        <span style={{ position: "absolute", right: "8%", bottom: "12%", color: "#6d8a92",
          fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(11px,1.6vw,15px)",
          fontWeight: 600, transform: "rotate(-8deg)", pointerEvents: "none", textShadow: "0 1px 0 rgba(255,255,255,.4)" }}>
          Lake&nbsp;Ontario
        </span>
      )}

      {/* pins */}
      {pins.map((p) => {
        const on = p.id === activeId;
        return (
          <button key={p.id}
            onMouseEnter={() => onPinHover && onPinHover(p.id)}
            onMouseLeave={() => onPinHover && onPinHover(null)}
            onClick={() => onPinClick && onPinClick(p.id)}
            aria-label={p.label}
            style={{
              position: "absolute", left: p.x + "%", top: p.y + "%",
              transform: `translate(-50%,-100%) scale(${on ? 1.18 : 1})`,
              transformOrigin: "bottom center",
              background: "none", border: 0, padding: 0, cursor: "pointer",
              zIndex: on ? 30 : 10, transition: "transform .14s ease",
              filter: "drop-shadow(0 3px 4px rgba(0,0,0,.28))",
            }}>
            <svg width={on ? 34 : 28} height={on ? 42 : 35} viewBox="0 0 24 30">
              <path d="M12 0a9 9 0 0 0-9 9c0 6.5 9 21 9 21s9-14.5 9-21a9 9 0 0 0-9-9z"
                fill={on ? "var(--accent)" : "var(--slate-800)"} stroke="#fff" strokeWidth="1.4" />
              <circle cx="12" cy="9" r="3.4" fill="#fff" />
            </svg>
            {(on || single) && p.label && (
              <span style={{ position: "absolute", left: "50%", bottom: "calc(100% + 4px)",
                transform: "translateX(-50%)", whiteSpace: "nowrap",
                background: "var(--slate-900)", color: "#fff", fontSize: 12, fontWeight: 600,
                padding: "4px 9px", borderRadius: "var(--r-sm)", pointerEvents: "none" }}>
                {p.label}
              </span>
            )}
          </button>
        );
      })}

      {/* zoom controls (decorative) */}
      <div style={{ position: "absolute", right: 12, bottom: 12, display: "flex", flexDirection: "column",
        borderRadius: "var(--r-sm)", overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
        {["plus", "close"].map((ic, i) => (
          <button key={ic} style={{ width: 34, height: 34, background: "var(--card)", border: 0,
            borderTop: i ? "1px solid var(--line)" : "none", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", color: "var(--ink-soft)" }}>
            <Icon name={i ? "menu" : "plus"} size={16} />
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { KMap });
