/* ============================================================
   Kingston.FYI — app router + tweaks
   ============================================================ */
const { useState: useStateApp, useEffect: useEffectApp } = React;

const ACCENTS = {
  Amber:      { a: "#c4801f", strong: "#a86714", soft: "#f6e7cb", tint: "#fbf3e2" },
  Terracotta: { a: "#c0573b", strong: "#9e432c", soft: "#f4ddd2", tint: "#fbeee8" },
  Clay:       { a: "#b06a3a", strong: "#8f5226", soft: "#f1e0cf", tint: "#faefe2" },
  Harbour:    { a: "#2f7d78", strong: "#226763", soft: "#cfe6e3", tint: "#e6f2f0" },
};
const HEAD_FONTS = {
  "Newsreader":       '"Newsreader", Georgia, serif',
  "Spectral":         '"Spectral", Georgia, serif',
  "Bitter":           '"Bitter", Georgia, serif',
  "Playfair Display": '"Playfair Display", Georgia, serif',
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "Amber",
  "headFont": "Newsreader",
  "cardStyle": "border",
  "radius": "soft",
  "density": "regular",
  "darkMast": false
}/*EDITMODE-END*/;

function TweaksUI({ t, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Brand" />
      <TweakColor label="Accent" value={ACCENTS[t.accent].a}
        options={Object.values(ACCENTS).map((x) => x.a)}
        onChange={(hex) => {
          const name = Object.keys(ACCENTS).find((k) => ACCENTS[k].a === hex) || "Amber";
          setTweak("accent", name);
        }} />
      <TweakToggle label="Dark masthead" value={t.darkMast} onChange={(v) => setTweak("darkMast", v)} />

      <TweakSection label="Typography" />
      <TweakSelect label="Headline font" value={t.headFont}
        options={Object.keys(HEAD_FONTS)} onChange={(v) => setTweak("headFont", v)} />

      <TweakSection label="Layout" />
      <TweakRadio label="Cards" value={t.cardStyle} options={["border", "shadow"]}
        onChange={(v) => setTweak("cardStyle", v)} />
      <TweakRadio label="Corners" value={t.radius} options={["sharp", "soft", "round"]}
        onChange={(v) => setTweak("radius", v)} />
      <TweakRadio label="Density" value={t.density} options={["compact", "regular", "airy"]}
        onChange={(v) => setTweak("density", v)} />
    </TweaksPanel>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useStateApp(() => {
    const h = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (h) { try { return JSON.parse(h); } catch (e) {} }
    return { name: "home", params: {} };
  });

  const navigate = (name, params = {}) => {
    setRoute({ name, params });
    window.scrollTo({ top: 0, behavior: "auto" });
    try { location.hash = encodeURIComponent(JSON.stringify({ name, params })); } catch (e) {}
  };

  useEffectApp(() => {
    const onHash = () => {
      const h = decodeURIComponent(location.hash.replace(/^#/, ""));
      if (h) { try { setRoute(JSON.parse(h)); } catch (e) {} }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // apply tweaks -> CSS variables + data attributes
  useEffectApp(() => {
    const r = document.documentElement;
    const ac = ACCENTS[t.accent] || ACCENTS.Amber;
    r.style.setProperty("--accent", ac.a);
    r.style.setProperty("--accent-strong", ac.strong);
    r.style.setProperty("--accent-soft", ac.soft);
    r.style.setProperty("--accent-tint", ac.tint);
    r.style.setProperty("--serif", HEAD_FONTS[t.headFont] || HEAD_FONTS.Newsreader);
    const radii = { sharp: ["2px", "3px", "5px"], soft: ["5px", "9px", "14px"], round: ["9px", "16px", "22px"] }[t.radius] || ["5px", "9px", "14px"];
    r.style.setProperty("--r-sm", radii[0]); r.style.setProperty("--r", radii[1]); r.style.setProperty("--r-lg", radii[2]);
    const dens = { compact: ["16px", "16px"], regular: ["24px", "22px"], airy: ["34px", "30px"] }[t.density] || ["24px", "22px"];
    r.style.setProperty("--gap", dens[0]); r.style.setProperty("--pad", dens[1]);
    r.setAttribute("data-cardstyle", t.cardStyle);
  }, [t]);

  const { name, params = {} } = route;
  const dark = t.darkMast;
  const hideFooter = name === "directory";

  let page;
  switch (name) {
    case "news": page = <NewsPage navigate={navigate} params={params} />; break;
    case "article": page = <ArticlePage navigate={navigate} params={params} />; break;
    case "events": page = <EventsPage navigate={navigate} params={params} />; break;
    case "event": page = <EventPage navigate={navigate} params={params} />; break;
    case "directory": page = <DirectoryPage navigate={navigate} params={params} />; break;
    case "business": page = <BusinessPage navigate={navigate} params={params} />; break;
    case "submit": page = <SubmitPage navigate={navigate} params={params} />; break;
    default: page = <HomePage navigate={navigate} />;
  }
  const pageKey = name + ":" + (params.id || params.q || params.cat || "");

  return (
    <div className="kf-app">
      <Header route={route} navigate={navigate} dark={dark} />
      <main className="kf-main" key={pageKey}>{page}</main>
      {!hideFooter && <Footer navigate={navigate} />}
      <TweaksUI t={t} setTweak={setTweak} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
