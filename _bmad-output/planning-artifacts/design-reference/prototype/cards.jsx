/* ============================================================
   Kingston.FYI — card components
   ArticleCard, EventCard, BusinessCard (+ variants)
   ============================================================ */

/* ---------- ARTICLE CARD ---------- */
function ArticleCard({ item, navigate, variant = "grid" }) {
  const cat = window.KFY.catMeta(item.cat);

  if (variant === "feature") {
    return (
      <article className="card card-link kf-feature" onClick={() => navigate("article", { id: item.id })}>
        <Ph hue={item.ph} ratio={16 / 9} label="Featured story photo" icon="grid" />
        <div style={{ padding: "22px 24px 26px" }}>
          <CatTag catKey={item.cat} />
          <h2 style={{ fontSize: 34, marginTop: 14, lineHeight: 1.08 }}>{item.title}</h2>
          <p className="muted" style={{ marginTop: 12, fontSize: 17, lineHeight: 1.5 }}>{item.dek}</p>
          <div className="meta" style={{ marginTop: 16, gap: 8 }}>
            <span style={{ fontWeight: 600, color: "var(--ink-soft)" }}>{item.author}</span>
            <span className="dot-sep">·</span><span>{item.date}</span>
            <span className="dot-sep">·</span><span>{item.read}</span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "list") {
    return (
      <article className="card card-link" onClick={() => navigate("article", { id: item.id })}
        style={{ display: "flex", gap: 0 }}>
        <div style={{ width: 150, flexShrink: 0 }}>
          <Ph hue={item.ph} height="100%" label="" icon="grid" style={{ minHeight: 130 }} />
        </div>
        <div className="cb" style={{ padding: "16px 18px", "--cbg": "8px" }}>
          <CatTag catKey={item.cat} small />
          <h3 style={{ fontSize: 19 }}>{item.title}</h3>
          <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.45,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.dek}</p>
          <div className="meta">{item.date} · {item.read}</div>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article onClick={() => navigate("article", { id: item.id })}
        style={{ display: "flex", gap: 14, cursor: "pointer", padding: "14px 0",
          borderBottom: "1px solid var(--line)" }}>
        <div style={{ width: 84, height: 64, flexShrink: 0, borderRadius: "var(--r-sm)", overflow: "hidden" }}>
          <Ph hue={item.ph} height="100%" />
        </div>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase",
            color: cat.color }}>{cat.label}</div>
          <h4 style={{ fontSize: 16, marginTop: 4, lineHeight: 1.2 }}>{item.title}</h4>
          <div className="meta" style={{ marginTop: 5, fontSize: 12.5 }}>{item.date}</div>
        </div>
      </article>
    );
  }

  // default grid
  return (
    <article className="card card-link" onClick={() => navigate("article", { id: item.id })}
      style={{ display: "flex", flexDirection: "column" }}>
      <Ph hue={item.ph} ratio={16 / 10} label="" icon="grid" />
      <div className="cb" style={{ padding: "16px 18px 20px", flex: 1, "--cbg": "9px" }}>
        <CatTag catKey={item.cat} small />
        <h3 style={{ fontSize: 20.5, lineHeight: 1.16 }}>{item.title}</h3>
        <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.45,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.dek}</p>
        <div className="meta" style={{ paddingTop: 4 }}>{item.date} · {item.read}</div>
      </div>
    </article>
  );
}

/* ---------- EVENT CARD ---------- */
function EventCard({ item, navigate, variant = "grid" }) {
  const free = item.free;
  const priceStyle = {
    fontWeight: 700, fontSize: 12.5, padding: "4px 9px", borderRadius: "var(--r-sm)",
    background: free ? "var(--accent-soft)" : "var(--limestone-2)",
    color: free ? "var(--accent-strong)" : "var(--ink-soft)",
  };

  if (variant === "row") {
    // horizontal strip card (fixed width)
    return (
      <article className="card card-link" onClick={() => navigate("event", { id: item.id })}
        style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ position: "relative" }}>
          <Ph hue={item.ph} ratio={16 / 9} icon="calendar" />
          <span style={{ position: "absolute", top: 12, left: 12 }}><CatTag label={item.cat} color="var(--slate-800)" small /></span>
        </div>
        <div className="cb" style={{ padding: "15px 17px 18px", flex: 1, "--cbg": "8px" }}>
          <div className="meta" style={{ color: "var(--accent-strong)", fontWeight: 700, fontSize: 13 }}>
            <Icon name="calendar" size={14} /> {item.date} · {item.time}
          </div>
          <h3 style={{ fontSize: 19, lineHeight: 1.18 }}>{item.title}</h3>
          <div className="meta" style={{ fontSize: 13.5 }}>
            <Icon name="pin" size={14} /> {item.venue}
          </div>
          <div style={{ paddingTop: 6 }}><span style={priceStyle}>{item.price}</span></div>
        </div>
      </article>
    );
  }

  if (variant === "list") {
    // big horizontal list row with date chip
    return (
      <article className="card card-link" onClick={() => navigate("event", { id: item.id })}
        style={{ display: "flex", overflow: "hidden" }}>
        <div className="kf-evdate" style={{ width: 92, flexShrink: 0, background: "var(--slate-800)",
          color: "var(--paper)", display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 2 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase",
            color: "var(--accent)" }}>{item.date.split(",")[0]}</span>
          <span style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 700, lineHeight: 1 }}>{item.day}</span>
          <span style={{ fontSize: 12, opacity: .7 }}>{item.date.split(" ")[1]}</span>
        </div>
        <div className="kf-evbody" style={{ display: "flex", gap: 16, padding: "16px 18px", flex: 1, alignItems: "center" }}>
          <div className="kf-evthumb" style={{ width: 96, height: 72, flexShrink: 0, borderRadius: "var(--r-sm)", overflow: "hidden" }}>
            <Ph hue={item.ph} height="100%" />
          </div>
          <div className="cb" style={{ flex: 1, minWidth: 0, "--cbg": "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <CatTag label={item.cat} color="var(--slate-700)" small />
              <span style={priceStyle}>{item.price}</span>
            </div>
            <h3 style={{ fontSize: 21 }}>{item.title}</h3>
            <div className="meta" style={{ gap: 14, flexWrap: "wrap" }}>
              <span className="meta"><Icon name="clock" size={14} /> {item.time}</span>
              <span className="meta"><Icon name="pin" size={14} /> {item.venue}, {item.hood}</span>
            </div>
          </div>
          <Icon name="chevR" size={20} className="kf-evchev" style={{ color: "var(--ink-faint)", marginLeft: "auto" }} />
        </div>
      </article>
    );
  }

  // default grid
  return (
    <article className="card card-link" onClick={() => navigate("event", { id: item.id })}
      style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative" }}>
        <Ph hue={item.ph} ratio={16 / 9} icon="calendar" />
        <span style={{ position: "absolute", top: 12, left: 12 }}><CatTag label={item.cat} color="var(--slate-800)" small /></span>
        <span style={{ position: "absolute", top: 12, right: 12, ...{
          fontWeight: 700, fontSize: 12, padding: "4px 9px", borderRadius: "var(--r-sm)",
          background: free ? "var(--accent)" : "rgba(255,255,255,.92)",
          color: free ? "#fff" : "var(--ink)" } }}>{item.price}</span>
      </div>
      <div className="cb" style={{ padding: "15px 17px 18px", flex: 1, "--cbg": "8px" }}>
        <div className="meta" style={{ color: "var(--accent-strong)", fontWeight: 700, fontSize: 13.5 }}>
          <Icon name="calendar" size={14} /> {item.date} · {item.time}
        </div>
        <h3 style={{ fontSize: 20 }}>{item.title}</h3>
        <div className="meta" style={{ fontSize: 13.5 }}><Icon name="pin" size={14} /> {item.venue}, {item.hood}</div>
      </div>
    </article>
  );
}

/* ---------- BUSINESS CARD ---------- */
function BusinessCard({ item, navigate, variant = "list", active, onHover }) {
  if (variant === "feature") {
    return (
      <article className="card card-link" onClick={() => navigate("business", { id: item.id })}
        style={{ display: "flex", flexDirection: "column" }}>
        <Ph hue={item.ph} ratio={4 / 3} icon="pin" />
        <div className="cb" style={{ padding: "15px 17px 18px", flex: 1, "--cbg": "7px" }}>
          <div>
            <span style={{ float: "right", marginLeft: 8 }}><PriceTag value={item.price} /></span>
            <h3 style={{ fontSize: 19, lineHeight: 1.18 }}>{item.name}</h3>
          </div>
          <div className="meta" style={{ fontSize: 13.5 }}>{item.cat} · {item.hood}</div>
          <Stars value={item.rating} count={item.reviews} />
        </div>
      </article>
    );
  }

  // directory list row (with map interplay)
  return (
    <article
      className="card card-link"
      onClick={() => navigate("business", { id: item.id })}
      onMouseEnter={() => onHover && onHover(item.id)}
      onMouseLeave={() => onHover && onHover(null)}
      style={{ display: "flex", overflow: "hidden",
        borderColor: active ? "var(--accent)" : undefined,
        boxShadow: active ? "0 0 0 1px var(--accent)" : undefined }}>
      <div style={{ width: 132, flexShrink: 0, position: "relative" }}>
        <Ph hue={item.ph} height="100%" style={{ minHeight: 132 }} icon="pin" />
        {item.openNow
          ? <span style={openBadge(true)}>Open</span>
          : <span style={openBadge(false)}>Closed</span>}
      </div>
      <div className="cb" style={{ padding: "14px 16px", flex: 1, minWidth: 0, "--cbg": "6px" }}>
        <div>
          <span style={{ float: "right", marginLeft: 8 }}><PriceTag value={item.price} /></span>
          <h3 style={{ fontSize: 18, lineHeight: 1.2 }}>{item.name}</h3>
        </div>
        <div className="meta" style={{ fontSize: 13.5 }}>{item.cat} <span className="dot-sep">·</span> {item.hood}</div>
        <Stars value={item.rating} count={item.reviews} />
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.4, marginTop: 2,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.blurb}</p>
      </div>
    </article>
  );
}

function openBadge(open) {
  return {
    position: "absolute", bottom: 8, left: 8,
    fontSize: 11, fontWeight: 700, letterSpacing: ".03em",
    padding: "3px 8px", borderRadius: "var(--r-pill)",
    background: open ? "var(--tag-local)" : "rgba(27,42,51,.78)",
    color: "#fff",
  };
}

Object.assign(window, { ArticleCard, EventCard, BusinessCard });
