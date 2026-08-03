/* ============================================================
   ALCHIVON: Chijindu Nwigwe · main.js (vanilla, no dependencies)

   Nav, letter reveal, code flow, panel parallax, count-up,
   scroll reveal, timelines, carousel, accordion, GitHub section.

   Every block guards on its own elements, so sections can be added
   or removed from index.html without touching this file.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  /* ---------- Footer year ---------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav: solid glass on scroll ---------- */
  var nav = $("#nav");
  var onScroll = function () {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 20);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Nav: mobile toggle ---------- */
  var navToggle = $("#navToggle");
  var navLinks = $("#navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Nav: active link on scroll (scrollspy) ---------- */
  var sections = $$("main section[id]");
  var linkFor = {};
  $$(".nav__links a").forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    if (id) linkFor[id] = a;
  });
  if (sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var active = linkFor[en.target.id];
        if (!active) return;
        $$(".nav__links a").forEach(function (a) { a.classList.remove("is-active"); });
        active.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Letter-by-letter hero title ---------- */
  var heroTitle = $("#heroTitle");
  if (heroTitle) {
    var globalIndex = 0;
    $$(".line", heroTitle).forEach(function (line) {
      var text = line.dataset.text || line.textContent;
      line.textContent = "";
      // Split keeping whitespace; wrap each word so it can't break mid-word
      text.split(/(\s+)/).forEach(function (token) {
        if (token === "") return;
        if (/^\s+$/.test(token)) { line.appendChild(document.createTextNode(token)); return; }
        var word = document.createElement("span");
        word.className = "word";
        for (var i = 0; i < token.length; i++) {
          var span = document.createElement("span");
          span.className = "char";
          span.textContent = token[i];
          if (!reduceMotion) span.style.transitionDelay = globalIndex * 26 + "ms";
          word.appendChild(span);
          globalIndex++;
        }
        line.appendChild(word);
      });
    });
    requestAnimationFrame(function () {
      $$(".char", heroTitle).forEach(function (c) { c.classList.add("is-in"); });
    });
  }

  /* ---------- Hero background: drifting code columns ----------
     Real-looking Go/JS fragments rather than lorem, at 11px and 22%
     opacity you can't read them, but the shapes (short const lines,
     long func signatures, closing braces) are what sells it. */
  var codeflow = $("#codeflow");
  if (codeflow && !reduceMotion) {
    var SNIPPETS = [
      "func (s *Server) Handle(w http.ResponseWriter, r *http.Request) {",
      "  ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)",
      "  defer cancel()",
      "  if err := s.store.Ping(ctx); err != nil {",
      "    return fmt.Errorf(\"db unreachable: %w\", err)",
      "  }",
      "}",
      "const cache = new Redis({ host: process.env.REDIS_HOST })",
      "router.Use(middleware.RateLimit(100, time.Minute))",
      "SELECT id, email FROM users WHERE deleted_at IS NULL",
      "CREATE INDEX idx_orders_user ON orders (user_id, created_at);",
      "docker build -t alchivon/api:latest .",
      "kubectl rollout status deploy/api --timeout=90s",
      "export async function getServerSideProps(ctx) {",
      "  const token = await verifyJWT(ctx.req.cookies.session)",
      "  return { props: { user: token.sub } }",
      "}",
      "type Order struct {",
      "  ID        uuid.UUID `json:\"id\"`",
      "  Total     int64     `json:\"total_cents\"`",
      "  CreatedAt time.Time `json:\"created_at\"`",
      "}",
      "go func() { errCh <- srv.ListenAndServe() }()",
      "await tx.commit()",
      "if !bcrypt.CompareHashAndPassword(hash, pw) { return ErrAuth }",
      "location /api/ { proxy_pass http://127.0.0.1:8080; }"
    ];
    var COLS = 6;
    var frag = document.createDocumentFragment();
    for (var c = 0; c < COLS; c++) {
      var col = document.createElement("div");
      col.className = "codecol";
      // Uneven spacing, evenly pitched columns read as a table, not as code.
      col.style.left = (42 + c * 11 + (c % 2 ? 3 : 0)) + "%";
      col.style.animationDuration = (34 + c * 7) + "s";
      col.style.animationDelay = -(c * 9) + "s";
      var lines = [];
      for (var n = 0; n < 26; n++) {
        lines.push(SNIPPETS[(c * 5 + n) % SNIPPETS.length]);
      }
      // Duplicate the block so translateY(-50%) loops seamlessly
      col.textContent = lines.join("\n") + "\n" + lines.join("\n");
      frag.appendChild(col);
    }
    codeflow.appendChild(frag);
  }

  /* ---------- Hero panels: subtle pointer reaction ----------
     One rAF loop for every panel, lerped so the panels lag the cursor
     slightly. Writes only custom properties, so nothing hits layout. */
  var panels = $$(".hpanel");
  var heroVisual = $("#heroVisual");
  if (panels.length && heroVisual && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    var tgt = { x: 0, y: 0 };
    var cur = { x: 0, y: 0 };
    var running = false;

    panels.forEach(function (p) {
      if (p.dataset.float) p.style.setProperty("--dur", p.dataset.float);
    });

    window.addEventListener("pointermove", function (e) {
      tgt.x = (e.clientX / window.innerWidth - 0.5) * 2;
      tgt.y = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!running) { running = true; requestAnimationFrame(tick); }
    }, { passive: true });

    var tick = function () {
      cur.x += (tgt.x - cur.x) * 0.06;
      cur.y += (tgt.y - cur.y) * 0.06;
      panels.forEach(function (p) {
        var d = parseFloat(p.dataset.depth || "20");
        p.style.setProperty("--px", (cur.x * d).toFixed(2) + "px");
        p.style.setProperty("--py", (cur.y * d * 0.6).toFixed(2) + "px");
      });
      if (Math.abs(tgt.x - cur.x) > 0.001 || Math.abs(tgt.y - cur.y) > 0.001) {
        requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };
  }

  /* ---------- Count-up numbers ---------- */
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || "";
    var prefix = el.dataset.prefix || "";
    if (reduceMotion) { el.textContent = prefix + target + suffix; return; }
    var dur = 1500;
    var start = performance.now();
    var step = function (now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  var counters = $$("[data-count]");
  if (counters.length) {
    var cIO = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        countUp(en.target);
        obs.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (n) { cIO.observe(n); });
  }

  /* ---------- Scroll reveal + grid stagger ---------- */
  var io = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      obs.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal-up").forEach(function (el) { io.observe(el); });

  if (!reduceMotion) {
    $$("[data-stagger]").forEach(function (grid) {
      Array.prototype.slice.call(grid.children).forEach(function (child, i) {
        if (child.classList.contains("reveal-up")) {
          child.style.transitionDelay = Math.min(i * 55, 380) + "ms";
        }
      });
    });
  }

  /* ---------- Timelines: draw the rail, then pop each node ---------- */
  $$(".timeline").forEach(function (tl) {
    var fill = $(".timeline__fill", tl);
    var nodes = $$(".tnode", tl);
    var tIO = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tl.classList.add("is-in");            // drives the rail draw-on in CSS
        if (fill) fill.style.transform = "scaleX(1)";
        nodes.forEach(function (n, i) {
          if (reduceMotion) { n.classList.add("is-in"); return; }
          setTimeout(function () { n.classList.add("is-in"); }, 180 + i * 110);
        });
        obs.unobserve(en.target);
      });
    }, { threshold: 0.25 });
    tIO.observe(tl);
  });

  /* ---------- FAQ accordion (smooth height) ---------- */
  $$(".faq-item").forEach(function (item) {
    var body = $(".faq-item__body", item);
    if (!body) return;
    item.addEventListener("toggle", function () {
      body.style.maxHeight = item.open ? body.scrollHeight + 32 + "px" : "0px";
    });
  });

})();
