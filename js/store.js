import { catalog } from "./catalog.js";
export const read = (key, fallback = []) => {
  try {
    return JSON.parse(localStorage.getItem("stackly-" + key)) ?? fallback;
  } catch {
    return fallback;
  }
};
export const save = (key, value) => {
  localStorage.setItem("stackly-" + key, JSON.stringify(value));
  window.dispatchEvent(new Event("store-change"));
};
export const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
export const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const products = () =>
  catalog.map((p) => ({ ...p, ...read("product-edits", {})[p.id] }));
export const find = (id) => products().find((p) => p.id === id);
export function wish(id) {
  if (!find(id)) return;
  let list = read("wishlist");
  list = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  save("wishlist", list);
  return list.includes(id);
}
export function add(id, size, color, qty = 1) {
  const p = find(id);
  qty = Number(qty);
  if (
    !p ||
    !p.sizes.includes(size) ||
    !p.colors.includes(color) ||
    !Number.isInteger(qty) ||
    qty < 1 ||
    qty > p.stock
  )
    throw Error("Choose an available size, colour, and valid quantity.");
  const bag = read("bag"),
    key = [id, size, color].join("|"),
    item = bag.find((x) => x.key === key);
  if ((item?.qty || 0) + qty > p.stock)
    throw Error("This quantity exceeds the demo stock available.");
  if (item) item.qty += qty;
  else bag.push({ key, id, size, color, qty });
  save("bag", bag);
  return { id, size, color, qty };
}
export function totals() {
  const bag = read("bag");
  const subtotal = bag.reduce(
    (s, x) => s + (find(x.id)?.price || 0) * x.qty,
    0,
  );
  const shipping = subtotal > 0 && subtotal < 3000 ? 99 : 0;
  return { subtotal, shipping, total: subtotal + shipping };
}
export function toast(message) {
  const box = document.querySelector("#toast");
  box.textContent = message;
  box.classList.add("visible");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => box.classList.remove("visible"), 3500);
}
export function selectedColor(p) {
  const value = read("colours", {})[p.id];
  return p.colors.includes(value) ? value : p.colors[0];
}
export function selectColor(p, color) {
  if (p.colors.includes(color)) save("colours", { ...read("colours", {}), [p.id]: color });
}
export function relatedProducts(p) {
  const score = (x) => (p.related.includes(x.id) ? 8 : 0) + (x.category === p.category ? 4 : 0) + (x.colors.includes(selectedColor(p)) ? 2 : 0) + (x.fit === p.fit ? 1 : 0);
  return products().filter((x) => x.id !== p.id && x.gender === p.gender).sort((a,b) => score(b)-score(a)).slice(0,4);
}
export function colorPreview(p, color) {
  if (p.colorImages?.[color]) return "none";
  if (color === p.colors[0]) return "none";
  return ({Taupe:"sepia(.35) saturate(.65) brightness(.85)", Black:"grayscale(1) brightness(.55)", Charcoal:"grayscale(1) brightness(.7)", Ivory:"grayscale(1) brightness(1.15)", Sand:"sepia(.45) saturate(.7)", Rose:"sepia(.4) hue-rotate(315deg) saturate(1.3)", Blue:"sepia(.5) hue-rotate(155deg)", Indigo:"sepia(.5) hue-rotate(165deg) brightness(.8)", Navy:"sepia(.5) hue-rotate(165deg) brightness(.65)", Olive:"sepia(.5) hue-rotate(35deg)", Sage:"sepia(.4) hue-rotate(50deg)", Camel:"sepia(.6) saturate(1.2)"})[color] || "none";
}
export function syncColors() {
  document.querySelectorAll("[data-product-card]").forEach((el) => {
    const p = find(el.dataset.productCard);
    if (!p) return;
    const color = selectedColor(p);
    el.querySelectorAll("[data-card-color]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cardColor === color)));
    const image = el.querySelector(".product-image img");
    image.src = p.colorImages?.[color] || p.image;
    image.style.filter = colorPreview(p, color);
  });
}
export function card(p) {
  const saved = read("wishlist").includes(p.id);
  const color = {
    Sand: "#c3a68d",
    Taupe: "#a58d7f",
    Ivory: "#d8c7ae",
    Black: "#252322",
    Rose: "#cfa092",
    Blue: "#637991",
    Olive: "#687154",
    Charcoal: "#464343",
    Navy: "#27354b",
    Indigo: "#394863",
    Camel: "#b58b64",
    Sage: "#99a88c",
  };
  return `<article class="product-card" data-product-card="${p.id}"><div class="product-image ${p.imageWidth / p.imageHeight > 1.25 ? "landscape-product" : "portrait-product"}"><a href="product-details.html?id=${p.id}"><img style="filter:${colorPreview(p, selectedColor(p))}" src="${p.colorImages?.[selectedColor(p)] || p.image}" alt="${escape(p.name)} — illustrative clothing image" width="362" height="420" loading="lazy"></a><button class="wish-btn" data-wish="${p.id}" aria-label="${saved ? "Remove" : "Save"} ${escape(p.name)} ${saved ? "from" : "to"} wishlist" aria-pressed="${saved}">${saved ? "♥" : "♡"}</button></div><h3><a href="product-details.html?id=${p.id}">${escape(p.name)}</a></h3><div class="product-meta"><span class="caption">${escape(p.category)} · ${escape(p.fit)} fit</span><span>${money(p.price)}</span></div><div class="swatches" aria-label="Colours: ${p.colors.join(", ")}">${p.colors.map((c) => `<button type="button" class="swatch" data-card-color="${c}" aria-label="${escape(c)} for ${escape(p.name)}" title="${c}" aria-pressed="${selectedColor(p) === c}" style="background:${color[c]}"></button>`).join("")}</div><p class="product-card-description">${escape(p.fabric)}. ${escape(p.styling)}</p><a class="quick-link" href="product-details.html?id=${p.id}">Select size & add to bag</a></article>`;
}
export function counts() {
  document
    .querySelectorAll("[data-wish-count]")
    .forEach((e) => (e.textContent = read("wishlist").length));
  document
    .querySelectorAll("[data-bag-count]")
    .forEach(
      (e) => (e.textContent = read("bag").reduce((s, x) => s + x.qty, 0)),
    );
  document.querySelectorAll("[data-wish]").forEach((e) => {
    const saved = read("wishlist").includes(e.dataset.wish);
    e.setAttribute("aria-pressed", saved);
    e.textContent = saved ? "♥" : "♡";
  });
}
