/* ============================================================
   Kingston.FYI — News listing + Article detail
   ============================================================ */
const { useState: useStateNews } = React;

function NewsPage({ navigate, params }) {
  const K = window.KFY;
  const [cat, setCat] = useStateNews(params && params.cat ? params.cat : "all");
  const cats = [{ key: "all", label: "All News" }, ...K.NEWS_CATS];
  const list = cat === "all" ? K.NEWS : K.NEWS.filter((n) => n.cat === cat);
  const lead = list[0];
  const rest = list.slice(1);
  const trending = ["n1", "n5", "n3", "n8", "n2"].map(K.newsById);

  return (
    <div className="kf-route kf-wrap" style={{ padding: "30px 28px 56px" }}>
      {/* page title */}
      <div style={{ marginBottom: 8 }}>
        <div className="eyebrow">Kingston.FYI Newsroom</div>
        <h1 style={{ fontSize: 40, marginTop: 6 }}>Local News</h1>
      </div>

      {/* category sub-nav */}
      <div className="scroll-x" style={{ display: "flex", gap: 9, overflowX: "auto", padding: "16px 0 20px",
        borderBottom: "1px solid var(--line)", marginBottom: 26 }}>
        {cats.map((c) => (
          <button key={c.key} className={"chip" + (cat === c.key ? " is-active" : "")}
            onClick={() => setCat(c.key)}>{c.label}</button>
        ))}
      </div>

      <div className="kf-news-layout" style={{ display: "grid", gridTemplateColumns: "1fr 320px",
        gap: 40, alignItems: "start" }}>
        {/* main column */}
        <div>
          {lead && (
            <div style={{ marginBottom: 26 }}>
              <ArticleCard item={lead} navigate={navigate} variant="feature" />
            </div>
          )}
          <div className="kf-news-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
            gap: "var(--gap)" }}>
            {rest.map((n) => <ArticleCard key={n.id} item={n} navigate={navigate} variant="grid" />)}
          </div>
        </div>

        {/* sidebar */}
        <aside className="kf-sidebar" style={{ display: "flex", flexDirection: "column", gap: 28,
          position: "sticky", top: 84 }}>
          <div className="card" style={{ padding: "20px 22px" }}>
            <div className="section-head" style={{ marginBottom: 14 }}>
              <h2 style={{ fontSize: 21 }}>Trending</h2>
            </div>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
              {trending.map((n, i) => (
                <li key={n.id} onClick={() => navigate("article", { id: n.id })}
                  style={{ display: "flex", gap: 14, cursor: "pointer", padding: "13px 0",
                    borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
                  <span style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 700,
                    color: "var(--accent)", lineHeight: 1, width: 26 }}>{i + 1}</span>
                  <div>
                    <h4 style={{ fontSize: 15.5, lineHeight: 1.22 }}>{n.title}</h4>
                    <div className="meta" style={{ marginTop: 4, fontSize: 12.5 }}>{K.catMeta(n.cat).label}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <NewsletterBand compact />
        </aside>
      </div>
    </div>
  );
}

/* ---------- ARTICLE DETAIL ---------- */
const ARTICLE_BODY = [
  "Kingston's waterfront has always been the city's front porch — the place where limestone, lake and livelihood meet. This week's development marks the latest chapter in a decades-long conversation about how the Limestone City grows without losing the character that defines it.",
  "Standing at the foot of the new span on a bright spring morning, residents described a mix of relief and cautious optimism. \"It changes how the whole east end connects to downtown,\" said one longtime Inner Harbour resident. \"You used to have to drive. Now you can walk it in twenty minutes.\"",
  "City staff say the project came in close to budget, with the final phase focused on landscaping and the active-transportation lane that links the waterfront pathway to Springer Market Square. The corridor is expected to see its heaviest use during the summer festival season.",
  "Local businesses are watching closely. Several owners along the route told Kingston.FYI they expect more foot traffic once the connection is complete, though a few worry about parking during construction. The city has promised a series of public updates through the fall.",
  "For now, the mood is one of quiet pride — another piece of infrastructure that, like the limestone buildings around it, is built to last.",
];

function ArticlePage({ navigate, params }) {
  const K = window.KFY;
  const item = K.newsById(params.id) || K.NEWS[0];
  const cat = K.catMeta(item.cat);
  const relEvents = (item.relatedEvents || []).map(K.eventById).filter(Boolean);
  const relBiz = (item.relatedBiz || []).map(K.bizById).filter(Boolean);
  const more = K.NEWS.filter((n) => n.id !== item.id && n.cat === item.cat).slice(0, 3);
  const moreList = more.length ? more : K.NEWS.filter((n) => n.id !== item.id).slice(0, 3);

  return (
    <div className="kf-route">
      <article className="kf-wrap" style={{ maxWidth: 1080, padding: "26px 28px 8px" }}>
        {/* breadcrumb */}
        <button onClick={() => navigate("news", { cat: item.cat })}
          style={{ background: "none", border: 0, cursor: "pointer", color: "var(--ink-soft)",
            display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 14, padding: 0 }}>
          <Icon name="chevL" size={16} /> Back to {cat.label}
        </button>

        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <CatTag catKey={item.cat} />
            <h1 style={{ fontSize: 46, marginTop: 18, lineHeight: 1.08 }}>{item.title}</h1>
            <p className="muted" style={{ fontSize: 20, marginTop: 16, lineHeight: 1.45,
              fontFamily: "var(--serif)", fontStyle: "italic" }}>{item.dek}</p>
            <div className="meta" style={{ justifyContent: "center", marginTop: 18, gap: 10, fontSize: 14.5 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 600, color: "var(--ink-soft)" }}>
                <span style={{ width: 30, height: 30, borderRadius: 999, background: "var(--limestone-2)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="user" size={16} style={{ color: "var(--ink-soft)" }} /></span>
                By {item.author}</span>
              <span className="dot-sep">·</span><span>{item.date}</span>
              <span className="dot-sep">·</span><span>{item.read}</span>
            </div>
            <div style={{ display: "flex", gap: 9, justifyContent: "center", marginTop: 18 }}>
              <button className="btn btn-ghost btn-sm"><Icon name="share" size={15} /> Share</button>
              <button className="btn btn-ghost btn-sm"><Icon name="mail" size={15} /> Email</button>
            </div>
          </div>
        </div>
      </article>

      {/* hero image */}
      <div className="kf-wrap" style={{ maxWidth: 1080, padding: "24px 28px 0" }}>
        <Ph hue={item.ph} ratio={21 / 9} label="Article hero photo" icon="grid" rounded />
        <div className="faint" style={{ fontSize: 13, marginTop: 8, fontStyle: "italic" }}>
          Photo placeholder — caption credit goes here.
        </div>
      </div>

      {/* body + cross-link rail */}
      <div className="kf-wrap" style={{ maxWidth: 1080, padding: "30px 28px 8px" }}>
        <div className="kf-article-layout" style={{ display: "grid", gridTemplateColumns: "1fr 300px",
          gap: 48, alignItems: "start" }}>
          <div style={{ maxWidth: 720 }}>
            {ARTICLE_BODY.map((para, i) => (
              <p key={i} style={{ fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1.65,
                marginBottom: 22, color: "var(--ink)" }}>
                {i === 0 ? <span style={{ float: "left", fontSize: 68, lineHeight: .82, fontWeight: 700,
                  marginRight: 12, marginTop: 6, color: "var(--accent)", fontFamily: "var(--serif)" }}>
                  {para[0]}</span> : null}
                {i === 0 ? para.slice(1) : para}
              </p>
            ))}
            <div style={{ borderTop: "1px solid var(--line)", marginTop: 10, paddingTop: 18,
              display: "flex", gap: 9 }}>
              {[item.cat, "Kingston", "Waterfront"].map((t) => (
                <span key={t} className="tag-outline tag">{typeof t === "string" && K.catMeta(t) && K.NEWS_CATS.find(c=>c.key===t) ? K.catMeta(t).label : t}</span>
              ))}
            </div>
          </div>

          {/* RELATED RAIL — the cross-link */}
          <aside className="kf-related" style={{ display: "flex", flexDirection: "column", gap: 22,
            position: "sticky", top: 84 }}>
            {relEvents.length > 0 && (
              <div className="card" style={{ padding: "18px 18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Icon name="calendar" size={17} style={{ color: "var(--accent-strong)" }} />
                  <h3 style={{ fontSize: 17 }}>Related Events</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {relEvents.map((e) => (
                    <button key={e.id} onClick={() => navigate("event", { id: e.id })}
                      className="kf-cross" style={crossBtn()}>
                      <div style={{ width: 46, flexShrink: 0, textAlign: "center" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-strong)",
                          textTransform: "uppercase" }}>{e.date.split(",")[0]}</div>
                        <div style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{e.day}</div>
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.2 }}>{e.title}</div>
                        <div className="meta" style={{ fontSize: 12.5, marginTop: 3 }}>{e.venue}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {relBiz.length > 0 && (
              <div className="card" style={{ padding: "18px 18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Icon name="pin" size={17} style={{ color: "var(--accent-strong)" }} />
                  <h3 style={{ fontSize: 17 }}>Mentioned Businesses</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {relBiz.map((b) => (
                    <button key={b.id} onClick={() => navigate("business", { id: b.id })} className="kf-cross" style={crossBtn()}>
                      <div style={{ width: 46, height: 46, flexShrink: 0, borderRadius: "var(--r-sm)", overflow: "hidden" }}>
                        <Ph hue={b.ph} height="100%" /></div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.2 }}>{b.name}</div>
                        <div className="meta" style={{ fontSize: 12.5, marginTop: 3 }}>{b.cat} · {b.hood}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ background: "var(--limestone)", border: "1px solid var(--line)",
              borderRadius: "var(--r)", padding: "18px 20px" }}>
              <div className="eyebrow">Stay in the loop</div>
              <p style={{ fontSize: 14.5, marginTop: 8, marginBottom: 12, color: "var(--ink-soft)" }}>
                Get stories like this each morning.</p>
              <button className="btn btn-dark btn-sm" style={{ width: "100%" }}
                onClick={() => navigate("home")}>Subscribe free</button>
            </div>
          </aside>
        </div>
      </div>

      {/* more like this */}
      <section className="kf-wrap" style={{ maxWidth: 1080, padding: "30px 28px 56px" }}>
        <div className="section-head"><h2 style={{ fontSize: 24 }}>More from {cat.label}</h2></div>
        <div className="kf-news-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--gap)" }}>
          {moreList.map((n) => <ArticleCard key={n.id} item={n} navigate={navigate} variant="grid" />)}
        </div>
      </section>
    </div>
  );
}

function crossBtn() {
  return {
    display: "flex", gap: 12, alignItems: "center", width: "100%",
    background: "none", border: 0, padding: "8px 8px", borderRadius: "var(--r-sm)",
    cursor: "pointer", color: "var(--ink)", transition: "background .14s",
  };
}

Object.assign(window, { NewsPage, ArticlePage });
