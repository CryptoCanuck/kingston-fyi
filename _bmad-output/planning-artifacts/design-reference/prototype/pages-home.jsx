/* ============================================================
   Kingston.FYI — Home hub
   ============================================================ */

function SectionHead({ eyebrow, title, moreLabel, onMore }) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>}
        <h2>{title}</h2>
      </div>
      {moreLabel && (
        <button className="more" onClick={onMore}>{moreLabel} <Icon name="arrowR" size={15} /></button>
      )}
    </div>
  );
}

function HomePage({ navigate }) {
  const K = window.KFY;
  const feature = K.newsById("n1");
  const secondary = ["n2", "n3", "n5"].map(K.newsById);
  const weekend = K.EVENTS.filter((e) => e.bucket === "weekend" || e.bucket === "today").slice(0, 6);
  const latest = ["n4", "n6", "n8", "n7", "n9", "n2"].map(K.newsById);
  const featBiz = ["b5", "b2", "b7", "b1"].map(K.bizById);

  return (
    <div className="kf-route">
      {/* ---- top banner: date / location strip ---- */}
      <div style={{ background: "var(--slate-900)", color: "rgba(255,255,255,.8)" }}>
        <div className="kf-wrap" style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", padding: "8px 28px", fontSize: 13, flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>Saturday, May 30, 2026 — Kingston, Ontario</span>
          <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span className="kf-hide-sm">18°C · Clear over the harbour</span>
            <button onClick={() => navigate("submit")} style={{ background: "none", border: 0,
              color: "var(--accent)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
              Submit a tip →
            </button>
          </span>
        </div>
      </div>

      {/* ---- HERO ---- */}
      <section className="kf-wrap" style={{ padding: "36px 28px 16px" }}>
        <div className="kf-hero-grid" style={{ display: "grid",
          gridTemplateColumns: "1.65fr 1fr", gap: "var(--gap)", alignItems: "start" }}>
          <ArticleCard item={feature} navigate={navigate} variant="feature" />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="eyebrow" style={{ borderBottom: "2px solid var(--slate-800)", paddingBottom: 8 }}>
              More top stories
            </div>
            {secondary.map((n) => (
              <ArticleCard key={n.id} item={n} navigate={navigate} variant="compact" />
            ))}
          </div>
        </div>
      </section>

      {/* ---- HAPPENING THIS WEEKEND ---- */}
      <section style={{ background: "var(--limestone)", marginTop: 26, padding: "40px 0" }}>
        <div className="kf-wrap">
          <SectionHead eyebrow="On the calendar" title="Happening This Weekend"
            moreLabel="All events" onMore={() => navigate("events")} />
          <div className="scroll-x" style={{ display: "flex", gap: 18, overflowX: "auto",
            paddingBottom: 8, scrollSnapType: "x proximity" }}>
            {weekend.map((e) => (
              <div key={e.id} style={{ scrollSnapAlign: "start" }}>
                <EventCard item={e} navigate={navigate} variant="row" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- LATEST NEWS ---- */}
      <section className="kf-wrap" style={{ padding: "44px 28px 8px" }}>
        <SectionHead eyebrow="The newsroom" title="Latest News"
          moreLabel="All news" onMore={() => navigate("news")} />
        <div className="kf-news-grid" style={{ display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--gap)" }}>
          {latest.map((n) => (
            <ArticleCard key={n.id} item={n} navigate={navigate} variant="grid" />
          ))}
        </div>
      </section>

      {/* ---- DISCOVER LOCAL BUSINESSES ---- */}
      <section className="kf-wrap" style={{ padding: "40px 28px 8px" }}>
        <SectionHead eyebrow="The directory" title="Discover Local Businesses"
          moreLabel="Browse directory" onMore={() => navigate("directory")} />
        <div className="kf-biz-grid" style={{ display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--gap)" }}>
          {featBiz.map((b) => (
            <BusinessCard key={b.id} item={b} navigate={navigate} variant="feature" />
          ))}
        </div>
      </section>

      {/* ---- NEWSLETTER ---- */}
      <section style={{ padding: "48px 0 0" }}>
        <NewsletterBand />
      </section>
    </div>
  );
}

Object.assign(window, { HomePage, SectionHead });
