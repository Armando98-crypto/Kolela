(function () {
  var doc = document.documentElement;
  doc.classList.add("js");

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("menu");
  var form = document.getElementById("f");
  var statusEl = document.getElementById("form-status");
  var toTop = document.getElementById("to-top");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var navLinks = nav ? nav.querySelectorAll('a[href^="#"]:not(.btn)') : [];
  var sections = ["areas", "empresa", "software", "porque-kolela", "processo", "contacto"];

  function onScroll() {
    if (header) header.classList.toggle("min", window.scrollY > 24);
    if (toTop) toTop.classList.toggle("on", window.scrollY > 600);
    var current = "";
    for (var s = 0; s < sections.length; s += 1) {
      var el = document.getElementById(sections[s]);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= 140) current = sections[s];
    }
    navLinks.forEach(function (link) {
      var id = (link.getAttribute("href") || "").slice(1);
      var active = id && id === current;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toTop) {
    toTop.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      var main = document.getElementById("inicio");
      if (main && main.focus) main.focus({ preventScroll: true });
    });
  }

  function menuItems() {
    if (!nav) return [];
    return [toggle].concat(Array.prototype.slice.call(nav.querySelectorAll("a, button"))).filter(Boolean);
  }

  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    doc.classList.toggle("menu-open", open);
    if (open) {
      var first = nav.querySelector("a");
      if (first && first.focus) first.focus();
    }
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("open"));
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        setMenu(false);
        toggle.focus();
        return;
      }
      if (e.key !== "Tab" || !nav.classList.contains("open")) return;
      var items = menuItems();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("open")) return;
      if (!nav.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 960) setMenu(false);
    });
  }

  var targets = document.querySelectorAll(
    ".service-card, .passos li, .product-copy, .product-stage, .trust-card, .contacto-grid > div, .cartao, .cta-box, .benefit, .essence-head, .values-head, .pillar, .value-card"
  );
  targets.forEach(function (el, i) {
    el.classList.add("rv");
    el.style.setProperty("--d", (i % 4) * 0.08 + "s");
  });

  function countUp(el) {
    var n = +el.dataset.n;
    if (reduced || n < 2) return;
    var t = 0;
    var id = setInterval(function () {
      t += 1;
      el.textContent = Math.min(n, t);
      if (t >= n) clearInterval(id);
    }, 280);
    el.textContent = "0";
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("on");
          entry.target.querySelectorAll("b[data-n]").forEach(countUp);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "80px 0px" }
    );
    targets.forEach(function (el) {
      io.observe(el);
    });
  } else {
    targets.forEach(function (el) {
      el.classList.add("on");
    });
  }

  var words = ["crescer.", "organizar.", "avançar.", "faturar."];
  var i = 0;
  var rot = document.getElementById("rot");
  if (rot && !reduced) {
    setInterval(function () {
      rot.classList.add("troca");
      setTimeout(function () {
        i = (i + 1) % words.length;
        rot.textContent = words[i];
        rot.classList.remove("troca");
      }, 320);
    }, 3200);
  }

  function setFieldError(el, invalid) {
    if (!el) return;
    el.setAttribute("aria-invalid", invalid ? "true" : "false");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var nome = String(data.get("nome") || "").trim();
      var servico = String(data.get("servico") || "").trim();
      var msg = String(data.get("msg") || "").trim();
      var nomeEl = form.elements.namedItem("nome");
      var msgEl = form.elements.namedItem("msg");
      if (statusEl) {
        statusEl.textContent = "";
        statusEl.classList.remove("is-error");
      }
      if (nome.length < 2) {
        setFieldError(nomeEl, true);
        if (statusEl) {
          statusEl.textContent = "Indique o seu nome para continuar.";
          statusEl.classList.add("is-error");
        }
        if (nomeEl && nomeEl.focus) nomeEl.focus();
        return;
      }
      setFieldError(nomeEl, false);
      if (msg.length < 8) {
        setFieldError(msgEl, true);
        if (statusEl) {
          statusEl.textContent = "Descreva o que precisa na mensagem.";
          statusEl.classList.add("is-error");
        }
        if (msgEl && msgEl.focus) msgEl.focus();
        return;
      }
      setFieldError(msgEl, false);
      var text = "Olá, sou " + nome + ".\nServiço: " + servico + "\n" + msg;
      var url = "https://wa.me/244957148351?text=" + encodeURIComponent(text);
      if (statusEl) statusEl.textContent = "A abrir o WhatsApp com o seu pedido…";
      var w = window.open(url, "_blank", "noopener,noreferrer");
      if (!w && statusEl) {
        statusEl.innerHTML =
          'Não foi possível abrir automaticamente. <a href="' +
          url +
          '" target="_blank" rel="noopener noreferrer">Abrir o WhatsApp</a>';
      }
    });
  }
})();
