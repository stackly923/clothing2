import { catalog } from "./catalog.js";
import { articles } from "./articles.js";
import {
  selectColor,
  syncColors,
  products,
  find,
  card,
  wish,
  read,
  save,
  money,
  toast,
  counts,
  escape,
  add,
  totals,
} from "./store.js";
import { productPage, bagPage, wishlistPage } from "./product.js";
import { forms } from "./validation.js";
import { dashboard } from "./dashboard.js";
const page = document.body.dataset.page;
// Keep the position of each history entry when opening another store page.
document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link || event.defaultPrevented || event.button !== 0 ||
      event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
      link.target === "_blank" || link.hasAttribute("download")) return;
  const destination = new URL(link.href, location.href);
  if (destination.origin !== location.origin) return;
  history.replaceState({ ...history.state, storeScrollY: window.scrollY }, "");
});
window.addEventListener("pageshow", (event) => {
  const returning = event.persisted ||
    performance.getEntriesByType("navigation")[0]?.type === "back_forward";
  const position = history.state?.storeScrollY;
  if (returning && Number.isFinite(position)) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.scrollTo({ top: position, behavior: "instant" });
    }));
  }
});
document.querySelector("[data-error-back]")?.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.assign("index.html");
  }
});
counts();
window.addEventListener("store-change", counts);
window.addEventListener("store-change", syncColors);
window.addEventListener("storage", () =>
  window.dispatchEvent(new Event("store-change")),
);
document.addEventListener("click", (e) => {
  const swatch = e.target.closest("[data-card-color]");
  if (swatch) selectColor(find(swatch.closest("[data-product-card]").dataset.productCard), swatch.dataset.cardColor);
  const b = e.target.closest("[data-wish],[data-save-product]");
  if (b) {
    const state = wish(b.dataset.wish || b.dataset.saveProduct);
    toast(state ? "Saved to your wishlist." : "Removed from your wishlist.");
  }
});
const menu = document.querySelector(".menu"),
  nav = document.querySelector("header nav");
if (menu && nav) {
  const signIn = document.querySelector(".header-actions .signin");
  if (signIn) {
    const mobileSignIn = signIn.cloneNode(true);
    mobileSignIn.className = "btn mobile-signin";
    nav.appendChild(mobileSignIn);
  }
menu.onclick = () => {
  const open = nav.classList.toggle("open");
  menu.setAttribute("aria-expanded", open);
  menu.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
};
nav.querySelectorAll("a").forEach(
  (a) =>
    (a.onclick = () => {
      nav.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
    }),
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
  }
});
}
const dialog = document.querySelector("#search-dialog");
document.querySelector("[data-search]")?.addEventListener("click", () => {
  dialog.showModal();
  document.querySelector("#global-search").focus();
});
document
  .querySelectorAll("[data-close]")
  .forEach((b) => (b.onclick = () => b.closest("dialog").close()));
document.querySelectorAll("dialog").forEach((d) =>
  d.addEventListener("click", (e) => {
    if (e.target === d) {
      const r = d.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        d.close();
    }
  }),
);
const search = document.querySelector("#global-search"),
  results = document.querySelector("#search-results");
search.oninput = () => {
  const q = search.value.trim().toLowerCase();
  const found = products().filter((p) =>
    (p.name + " " + p.category + " " + p.gender + " " + p.fabric)
      .toLowerCase()
      .includes(q),
  );
  results.innerHTML = q
    ? found.length
      ? found
          .map(
            (p) =>
              `<a class="search-item" href="product-details.html?id=${p.id}"><img src="${p.image}" alt="${escape(p.name)}" width="75" height="85"><div>${escape(p.name)}<br><span class="caption">${money(p.price)} · ${p.gender}</span></div></a>`,
          )
          .join("")
      : "<p>No pieces found. Try “cotton”, “dress”, or “denim”.</p>"
    : '<p class="caption">Search by product, collection, or fabric.</p>';
};
search.oninput();
document
  .querySelectorAll("[data-products]")
  .forEach(
    (e) =>
      (e.innerHTML = e.dataset.products
        .split(",")
        .map(find)
        .filter(Boolean)
        .map(card)
        .join("")),
  );
if ((page === "men" || page === "women") && document.querySelector("#filter-search")) {
  const fields = ["search", "category", "size", "color", "price", "sort"].map(
    (k) => document.querySelector("#filter-" + k),
  );
  const params = new URLSearchParams(location.search);
  fields[1].value = params.get("category") || "";
  function filter() {
    let rows = products().filter((p) => p.gender.toLowerCase() === page);
    const [q, category, size, color, price, sort] = fields.map((f) => f.value);
    rows = rows.filter(
      (p) =>
        (!q ||
          (p.name + " " + p.category)
            .toLowerCase()
            .includes(q.toLowerCase())) &&
        (!category || p.category === category) &&
        (!size || p.sizes.includes(size)) &&
        (!color || p.colors.includes(color)) &&
        (!price || p.price <= Number(price)),
    );
    if (sort === "asc") rows.sort((a, b) => a.price - b.price);
    if (sort === "desc") rows.sort((a, b) => b.price - a.price);
    if (sort === "name") rows.sort((a, b) => a.name.localeCompare(b.name));
    document.querySelector("#result-count").textContent =
      rows.length + " pieces found";
    document.querySelector("#filtered-products").innerHTML = rows.length
      ? rows.map(card).join("")
      : '<div class="empty"><h3>A fresh search might help.</h3><p>No pieces match these filters. Clear filters to see the complete collection.</p></div>';
    counts();
  }
  fields.forEach((f) => f.addEventListener("input", filter));
  document.querySelector("#clear-filters").onclick = () => {
    fields.forEach((f, i) => (f.value = i === 5 ? "new" : ""));
    filter();
  };
  filter();
}
document.querySelectorAll("[data-recent]").forEach((e) => {
  const rows = read("recent")
    .map(find)
    .filter((p) => p && p.gender === e.dataset.recent);
  e.innerHTML = rows.length
    ? rows.slice(0, 4).map(card).join("")
    : '<p class="caption">Your recently viewed pieces will appear here after you explore a product.</p>';
});
function articleCard(a) {
  return `<article class="article-card"><a href="blog.html?article=${a.id}"><img src="${a.image}" alt="Clothing inspiration for ${escape(a.title)}" width="500" height="300" loading="lazy"></a><p class="eyebrow">${a.topic}</p><h3><a href="blog.html?article=${a.id}">${escape(a.title)}</a></h3><div class="article-meta">${a.date} · ${a.time} min read · ${a.author}</div><p>${escape(a.intro)}</p><a class="text-link" href="404.html">Read Article</a></article>`;
}
document.querySelectorAll("[data-article-cards]").forEach(
  (e) =>
    (e.innerHTML = e.dataset.articleCards
      .split(",")
      .map((i) => articles[Number(i)])
      .map(articleCard)
      .join("")),
);
if (page === "blog") {
  const articleDialog = document.querySelector("#article-dialog");
  let returnLink = null;
  let returnScroll = 0;
  document.querySelector("#article-results").innerHTML = articles.map(articleCard).join("");
  function openArticle(a, link = null) {
    returnLink = link;
    returnScroll = window.scrollY;
    document.querySelector("#article-content").innerHTML =
      `<div class="article-toolbar"><button class="outline article-back" type="button" data-article-back>Back to journal</button></div><p class="eyebrow">${a.topic} / ${a.author}</p><h2 class="article-title">${escape(a.title)}</h2><p class="caption">${a.date} · ${a.time} minute read</p><img src="${a.image}" alt="${escape(a.title)}"><p>${escape(a.intro)}</p>${a.paragraphs.map(([t, c]) => `<h3>${escape(t)}</h3><p>${escape(c)}</p>`).join("")}<p class="caption">Editorial demonstration content. Explore our product-specific fit and care information before choosing.</p><a class="btn" href="404.html">Explore the collection</a>`;
    document.querySelector("[data-article-back]").onclick = () =>
      articleDialog.close();
    articleDialog.showModal();
    articleDialog.scrollTop = 0;
  }
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href*="blog.html?article="]');
    if (
      !link ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const id = new URL(link.href).searchParams.get("article");
    const a = articles.find((a) => a.id === id);
    if (!a) return;
    event.preventDefault();
    history.replaceState(null, "", "blog.html?article=" + id);
    openArticle(a, link);
  });
  articleDialog.addEventListener("close", () => {
    history.replaceState(null, "", "blog.html");
    if (returnLink) {
      returnLink.focus({ preventScroll: true });
      window.scrollTo({ top: returnScroll, behavior: "instant" });
    } else {
      document
        .querySelector("#article-results")
        .scrollIntoView({ behavior: "instant", block: "start" });
    }
  });
  const initial = articles.find(
    (a) => a.id === new URLSearchParams(location.search).get("article"),
  );
  if (initial) openArticle(initial);
}
document.querySelectorAll("[data-unit]").forEach(
  (b) =>
    (b.onclick = () => {
      const inch = b.dataset.unit === "in";
      document
        .querySelectorAll("[data-cm]")
        .forEach(
          (cell) =>
            (cell.textContent = inch
              ? (Number(cell.dataset.cm) / 2.54).toFixed(1) + " in"
              : cell.dataset.cm + " cm"),
        );
      document.querySelectorAll("[data-unit]").forEach((x) => {
        x.setAttribute("aria-pressed", x === b);
        x.classList.toggle("outline", x !== b);
      });
    }),
);
productPage();
bagPage();
wishlistPage();
forms();
dashboard();
counts();
if (document.modelContext?.registerTool) {
  for (const tool of [
    {
      name: "search_clothing",
      description: "Find STACKLY clothing by name, category, or fabric.",
      inputSchema: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute({ query }) {
        if (typeof query !== "string") throw Error("Query must be text.");
        search.value = query;
        search.oninput();
        if (!dialog.open) dialog.showModal();
        return products()
          .filter((p) =>
            (p.name + " " + p.category + " " + p.fabric)
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .map((p) => ({ id: p.id, name: p.name, price: p.price }));
      },
    },
    {
      name: "add_clothing_to_demo_bag",
      description:
        "Add a valid clothing variant to the browser-local demo shopping bag.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string" },
          size: { type: "string" },
          color: { type: "string" },
          qty: { type: "integer", minimum: 1 },
        },
        required: ["id", "size", "color", "qty"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute({ id, size, color, qty }) {
        const result = add(id, size, color, qty);
        if (page === "cart") bagPage();
        toast("Added to your shopping bag.");
        return { ...result, totals: totals() };
      },
    },
  ])
    try {
      Promise.resolve(document.modelContext.registerTool(tool)).catch(() => {});
    } catch {}
}
