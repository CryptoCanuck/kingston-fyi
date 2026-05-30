/* ============================================================
   Kingston.FYI — placeholder content (fictional, Kingston-flavoured)
   Exposed as window.KFY
   ============================================================ */
(function () {
  // ---- category color map (matches styles.css tag-* tokens) ----
  const NEWS_CATS = [
    { key: "local",    label: "Local",          color: "var(--tag-local)" },
    { key: "politics", label: "Politics",       color: "var(--tag-politics)" },
    { key: "business", label: "Business",       color: "var(--tag-business)" },
    { key: "sports",   label: "Sports",         color: "var(--tag-sports)" },
    { key: "arts",     label: "Arts & Culture", color: "var(--tag-arts)" },
    { key: "opinion",  label: "Opinion",        color: "var(--tag-opinion)" },
  ];

  const EVENT_CATS = ["Music", "Food", "Family", "Arts", "Sports"];
  const NEIGHBOURHOODS = [
    "Downtown", "Williamsville", "Portsmouth", "Sydenham", "Inner Harbour",
    "Kingscourt", "Reddendale", "Cataraqui",
  ];

  // ---- NEWS ----
  const NEWS = [
    {
      id: "n1", cat: "local", ph: "ph-e",
      title: "Third Crossing opens new active-transport lane over the Cataraqui",
      dek: "Cyclists and pedestrians get a dedicated link between the east end and downtown as the city wraps phase two of the waterfront connection.",
      author: "Maeve Tanner", date: "May 28, 2026", read: "5 min read",
      relatedEvents: ["e2"], relatedBiz: ["b3"],
    },
    {
      id: "n2", cat: "business", ph: "ph-c",
      title: "Williamsville main-street redesign breaks ground on Princess",
      dek: "Wider sidewalks, patios and angled parking come to the Princess Street corridor this fall — merchants weigh the summer of detours against the payoff.",
      author: "Devon Ruiz", date: "May 27, 2026", read: "4 min read",
      relatedEvents: ["e4"], relatedBiz: ["b2", "b6"],
    },
    {
      id: "n3", cat: "arts", ph: "ph-d",
      title: "Skeleton Park Arts Festival returns with biggest lineup yet",
      dek: "Three days of music, makers and mischief take over the McBurney Park neighbourhood the last weekend of June.",
      author: "Priya Chandel", date: "May 26, 2026", read: "3 min read",
      relatedEvents: ["e1"], relatedBiz: ["b4"],
    },
    {
      id: "n4", cat: "politics", ph: "ph-a",
      title: "Council greenlights limestone heritage grant for downtown facades",
      dek: "A new matching fund will help building owners restore the city's signature limestone storefronts along Brock and Wellington.",
      author: "Maeve Tanner", date: "May 25, 2026", read: "6 min read",
      relatedEvents: [], relatedBiz: ["b1", "b5"],
    },
    {
      id: "n5", cat: "sports", ph: "ph-b",
      title: "Frontenacs clinch playoff berth in front of sold-out Slush Puppie Place",
      dek: "A late third-period surge sends the home side to the post-season for the first time in four years.",
      author: "Cole Whitford", date: "May 24, 2026", read: "3 min read",
      relatedEvents: ["e5"], relatedBiz: [],
    },
    {
      id: "n6", cat: "local", ph: "ph-f",
      title: "Wolfe Island ferry adds weekend sailings ahead of summer rush",
      dek: "MTO confirms two extra crossings on Saturdays and Sundays through Labour Day to ease the foot-passenger backlog at the downtown dock.",
      author: "Devon Ruiz", date: "May 23, 2026", read: "2 min read",
      relatedEvents: [], relatedBiz: [],
    },
    {
      id: "n7", cat: "opinion", ph: "ph-a",
      title: "Opinion: The Inner Harbour deserves a real neighbourhood plan",
      dek: "Patchwork development is filling in the waterfront one condo at a time. It's time the city zoomed out.",
      author: "R. Beaumont", date: "May 22, 2026", read: "4 min read",
      relatedEvents: [], relatedBiz: ["b7"],
    },
    {
      id: "n8", cat: "business", ph: "ph-c",
      title: "Springer Market Square vendors report record spring season",
      dek: "Canada's oldest continuously running public market is drawing bigger crowds than pre-pandemic, organizers say.",
      author: "Priya Chandel", date: "May 21, 2026", read: "3 min read",
      relatedEvents: ["e3"], relatedBiz: ["b4", "b8"],
    },
    {
      id: "n9", cat: "arts", ph: "ph-d",
      title: "The Grand unveils a season built around homegrown playwrights",
      dek: "Five of the eight mainstage productions next year are written by Kingston-connected artists.",
      author: "Priya Chandel", date: "May 20, 2026", read: "4 min read",
      relatedEvents: [], relatedBiz: [],
    },
  ];

  // ---- EVENTS ---- (bucket: today | weekend | nextweek | month)
  const EVENTS = [
    {
      id: "e1", cat: "Arts", ph: "ph-d", bucket: "weekend",
      title: "Skeleton Park Arts Festival",
      date: "Sat, Jun 27", time: "11:00 AM – 9:00 PM",
      venue: "McBurney (Skeleton) Park", hood: "Sydenham",
      price: "Free", free: true, day: 27,
      blurb: "A beloved neighbourhood festival of live music, local makers and family fun under the maples of McBurney Park.",
      bizId: null, relatedNews: ["n3"],
    },
    {
      id: "e2", cat: "Sports", ph: "ph-b", bucket: "weekend",
      title: "Waterfront Pathway 10K",
      date: "Sun, Jun 28", time: "8:00 AM",
      venue: "Confederation Basin", hood: "Inner Harbour",
      price: "$45", free: false, day: 28,
      blurb: "A flat, fast course along the Lake Ontario waterfront with finish-line views of the harbour.",
      bizId: "b3", relatedNews: ["n1"],
    },
    {
      id: "e3", cat: "Food", ph: "ph-c", bucket: "weekend",
      title: "Saturday Public Market",
      date: "Sat, Jun 27", time: "8:00 AM – 2:00 PM",
      venue: "Springer Market Square", hood: "Downtown",
      price: "Free", free: true, day: 27,
      blurb: "Produce, baking and crafts from across the region at the historic market behind City Hall.",
      bizId: "b4", relatedNews: ["n8"],
    },
    {
      id: "e4", cat: "Music", ph: "ph-a", bucket: "today",
      title: "Live on the Patio: The Limestoners",
      date: "Fri, Jun 26", time: "7:30 PM",
      venue: "Harbourview Tap & Table", hood: "Downtown",
      price: "Free", free: true, day: 26,
      blurb: "Roots-rock from a Kingston five-piece to kick off the weekend on the waterfront patio.",
      bizId: "b6", relatedNews: ["n2"],
    },
    {
      id: "e5", cat: "Sports", ph: "ph-b", bucket: "nextweek",
      title: "Frontenacs vs. 67's — Playoff Game 3",
      date: "Tue, Jun 30", time: "7:00 PM",
      venue: "Slush Puppie Place", hood: "Downtown",
      price: "$28+", free: false, day: 30,
      blurb: "The post-season rolls on downtown. Doors open an hour before puck drop.",
      bizId: null, relatedNews: ["n5"],
    },
    {
      id: "e6", cat: "Family", ph: "ph-e", bucket: "nextweek",
      title: "Sunset Ceremony at Fort Henry",
      date: "Wed, Jul 1", time: "8:30 PM",
      venue: "Fort Henry National Historic Site", hood: "Portsmouth",
      price: "$25", free: false, day: 1,
      blurb: "Canada Day drill, music and cannon fire from the Fort Henry Guard above the harbour.",
      bizId: null, relatedNews: [],
    },
    {
      id: "e7", cat: "Arts", ph: "ph-d", bucket: "month",
      title: "Movies in the Square: Open-Air Cinema",
      date: "Thu, Jul 9", time: "Dusk (~9:15 PM)",
      venue: "Springer Market Square", hood: "Downtown",
      price: "Free", free: true, day: 9,
      blurb: "Bring a blanket for a family-friendly classic projected against the limestone of City Hall.",
      bizId: "b4", relatedNews: [],
    },
    {
      id: "e8", cat: "Food", ph: "ph-c", bucket: "month",
      title: "Williamsville Night Market",
      date: "Fri, Jul 17", time: "5:00 – 10:00 PM",
      venue: "Princess Street (400 block)", hood: "Williamsville",
      price: "Free", free: true, day: 17,
      blurb: "Street food, makers and live sets along the revamped Princess Street corridor.",
      bizId: "b2", relatedNews: ["n2"],
    },
    {
      id: "e9", cat: "Music", ph: "ph-a", bucket: "month",
      title: "Limestone City Blues Brunch",
      date: "Sun, Jul 19", time: "11:00 AM",
      venue: "The Tett Centre", hood: "Inner Harbour",
      price: "$20", free: false, day: 19,
      blurb: "A lazy Sunday of blues and brunch in the converted limestone works on the waterfront.",
      bizId: "b7", relatedNews: [],
    },
  ];

  // ---- BUSINESSES ----
  const BUSINESSES = [
    {
      id: "b1", name: "Cataraqui Books", cat: "Bookstore", parentCat: "Shopping",
      ph: "ph-c", rating: 4.8, reviews: 214, price: "$$", hood: "Downtown",
      openNow: true, hours: "9 AM – 8 PM", x: 41, y: 58,
      blurb: "Independent bookseller on Princess with a deep local-history section and a back-room reading nook.",
      address: "182 Princess St", phone: "(613) 555-0142", web: "cataraquibooks.fyi",
      tags: ["Local authors", "Free wifi", "Wheelchair access"], events: [],
    },
    {
      id: "b2", name: "Skeleton Park Roasters", cat: "Coffee Shop", parentCat: "Food & Drink",
      ph: "ph-f", rating: 4.7, reviews: 389, price: "$", hood: "Williamsville",
      openNow: true, hours: "7 AM – 6 PM", x: 28, y: 40,
      blurb: "Small-batch roaster and café beloved by the Williamsville crowd. Patio, oat milk, good playlists.",
      address: "612 Princess St", phone: "(613) 555-0178", web: "skeletonparkroasters.fyi",
      tags: ["Patio", "Vegan options", "Takeout"], events: ["e8"],
    },
    {
      id: "b3", name: "Inner Harbour Paddle Co.", cat: "Outdoor Recreation", parentCat: "Recreation",
      ph: "ph-e", rating: 4.9, reviews: 96, price: "$$", hood: "Inner Harbour",
      openNow: false, hours: "Opens 9 AM", x: 55, y: 30,
      blurb: "Kayak and paddleboard rentals right on the Cataraqui. Sunrise tours along the waterfront in summer.",
      address: "5 Anglin Bay", phone: "(613) 555-0190", web: "innerharbourpaddle.fyi",
      tags: ["Rentals", "Guided tours", "Seasonal"], events: ["e2"],
    },
    {
      id: "b4", name: "Market Square Creamery", cat: "Dessert", parentCat: "Food & Drink",
      ph: "ph-c", rating: 4.6, reviews: 520, price: "$", hood: "Downtown",
      openNow: true, hours: "11 AM – 10 PM", x: 46, y: 55,
      blurb: "Hand-churned ice cream steps from Springer Market Square. The maple-walnut sells out by August.",
      address: "23 Market St", phone: "(613) 555-0111", web: "marketsquarecreamery.fyi",
      tags: ["Family friendly", "Cash & card", "Outdoor seating"], events: ["e3", "e7"],
    },
    {
      id: "b5", name: "Limestone & Oak", cat: "Restaurant", parentCat: "Food & Drink",
      ph: "ph-f", rating: 4.7, reviews: 642, price: "$$$", hood: "Downtown",
      openNow: true, hours: "5 PM – 11 PM", x: 43, y: 52,
      blurb: "Seasonal Ontario cooking in a restored limestone building on Brock. Reservations recommended.",
      address: "64 Brock St", phone: "(613) 555-0166", web: "limestoneandoak.fyi",
      tags: ["Reservations", "Local sourcing", "Date night"], events: [],
    },
    {
      id: "b6", name: "Harbourview Tap & Table", cat: "Pub & Live Music", parentCat: "Food & Drink",
      ph: "ph-a", rating: 4.5, reviews: 411, price: "$$", hood: "Downtown",
      openNow: true, hours: "11 AM – 1 AM", x: 49, y: 49,
      blurb: "Waterfront patio, regional taps and live local music most weekends.",
      address: "1 Ontario St", phone: "(613) 555-0155", web: "harbourviewtap.fyi",
      tags: ["Live music", "Patio", "Late night"], events: ["e4"],
    },
    {
      id: "b7", name: "The Tett Centre", cat: "Arts Venue", parentCat: "Arts & Culture",
      ph: "ph-d", rating: 4.8, reviews: 158, price: "$$", hood: "Inner Harbour",
      openNow: true, hours: "10 AM – 9 PM", x: 58, y: 38,
      blurb: "Creative hub in a heritage limestone complex on the water — studios, classes and a performance hall.",
      address: "370 King St W", phone: "(613) 555-0133", web: "tettcentre.fyi",
      tags: ["Classes", "Gallery", "Accessible"], events: ["e9"],
    },
    {
      id: "b8", name: "Portsmouth Provisions", cat: "Grocer & Deli", parentCat: "Food & Drink",
      ph: "ph-c", rating: 4.6, reviews: 233, price: "$$", hood: "Portsmouth",
      openNow: true, hours: "8 AM – 9 PM", x: 22, y: 66,
      blurb: "Neighbourhood deli and grocer near Portsmouth Olympic Harbour with house-made sandwiches.",
      address: "85 Yonge St", phone: "(613) 555-0120", web: "portsmouthprovisions.fyi",
      tags: ["Takeout", "Local goods", "Catering"], events: [],
    },
    {
      id: "b9", name: "Sydenham Street Cycles", cat: "Bike Shop", parentCat: "Shopping",
      ph: "ph-b", rating: 4.9, reviews: 187, price: "$$", hood: "Sydenham",
      openNow: false, hours: "Opens 10 AM", x: 38, y: 47,
      blurb: "Full-service bike shop and rental fleet a block from City Park. Trail maps on the house.",
      address: "210 Sydenham St", phone: "(613) 555-0182", web: "sydenhamcycles.fyi",
      tags: ["Repairs", "Rentals", "Trade-ins"], events: [],
    },
  ];

  const REVIEWS = [
    { id: "r1", name: "Jordan M.", rating: 5, date: "2 weeks ago", text: "A neighbourhood gem. The patio is the best spot in Williamsville on a warm evening." },
    { id: "r2", name: "Aïsha K.", rating: 5, date: "1 month ago", text: "Staff know their stuff and the space is gorgeous. Limestone walls, big windows, calm energy." },
    { id: "r3", name: "Tom R.", rating: 4, date: "1 month ago", text: "Reliably good. Gets busy on weekends so go early or be ready to wait a few minutes." },
  ];

  const helpers = {
    newsById: (id) => NEWS.find((n) => n.id === id),
    eventById: (id) => EVENTS.find((e) => e.id === id),
    bizById: (id) => BUSINESSES.find((b) => b.id === id),
    catMeta: (key) => NEWS_CATS.find((c) => c.key === key) || NEWS_CATS[0],
    eventsByBucket: (bucket) => EVENTS.filter((e) => e.bucket === bucket),
  };

  window.KFY = {
    NEWS_CATS, EVENT_CATS, NEIGHBOURHOODS,
    NEWS, EVENTS, BUSINESSES, REVIEWS,
    ...helpers,
  };
})();
