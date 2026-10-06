import {
  selectedColor,
  selectColor,
  colorPreview,
  relatedProducts,
  find,
  products,
  card,
  add,
  read,
  save,
  money,
  toast,
  escape,
} from "./store.js";
export function productPage() {
  const host = document.querySelector("#product-view");
  if (!host) return;
  const p = find(new URLSearchParams(location.search).get("id"));
  if (!p) {
    host.innerHTML =
      '<section class="utility empty"><h1>This piece is unavailable.</h1><p>The product link is missing or no longer available.</p><a class="btn" href="404.html">Shop Men</a><a class="btn outline" href="404.html">Shop Women</a></section>';
    return;
  }
  document.title = p.name + " | STACKLY";
  let recent = read("recent").filter((x) => x !== p.id);
  save("recent", [p.id, ...recent].slice(0, 8));
  let size = "",
    color = selectedColor(p);
  host.innerHTML = `<div class="product-back"><a class="btn outline" href="${p.gender.toLowerCase()}.html" aria-label="Back to ${p.gender} collection"><span aria-hidden="true">&larr;</span> Back</a></div><div class="product-detail"><div class="product-gallery"><img id="gallery-main" src="${p.image}" alt="${escape(p.name)} garment illustration" width="600" height="650" fetchpriority="high"></div><div class="product-description"><p class="eyebrow">${p.gender.toUpperCase()} / ${p.category.toUpperCase()}</p><h1>${escape(p.name)}</h1><div class="price">${money(p.price)}</div><p>${escape(p.description)}</p><div>Colour <span id="chosen-color" class="caption">— choose a colour</span></div><div class="variant-options">${p.colors.map((c) => `<button data-color="${c}" aria-pressed="false">${c}</button>`).join("")}</div><div class="support-row"><span>Size</span><a class="text-link" href="size-guide.html">Size guide</a></div><div class="variant-options">${p.sizes.map((s) => `<button data-size="${s}" aria-pressed="false">${s}</button>`).join("")}</div><label for="product-qty">Quantity</label><input class="qty-input" id="product-qty" type="number" min="1" max="${p.stock}" value="1"><p class="caption">In demo stock · ${p.stock} units available</p><button class="full" id="add-product">Add to Bag</button><p id="variant-error" class="field-error" role="alert"></p><button class="outline full" data-save-product="${p.id}">Save to Wishlist</button><details open><summary>Fabric & fit</summary><p>${escape(p.fabric)}. ${escape(p.fit)} fit. Compare your measurements with our demonstration size guide.</p></details><details><summary>Care instructions</summary><p>${escape(p.care)}</p></details><details><summary>Delivery & returns</summary><p>Demo delivery: ₹99 below ₹3,000; complimentary at ₹3,000 or above. Draft terms require business approval.</p><a class="text-link" href="shipping-returns.html">Read delivery & return guidance</a></details></div></div><section class="section"><div class="section-heading"><p class="eyebrow">BETTER TOGETHER</p><h2>Complete your everyday edit.</h2></div><div class="product-grid" id="related-products">${relatedProducts(p).map(card).join("")}</div></section>`;
  const backLink = host.querySelector(".product-back a");
  backLink.setAttribute("aria-label", "Back to previous section");
  backLink.addEventListener("click", (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const source = document.referrer && new URL(document.referrer);
    if (history.length > 1 && source && source.origin === location.origin) {
      event.preventDefault();
      history.back();
    }
  });
  function updateColor() {
    color = selectedColor(p);
    host.querySelector("#chosen-color").textContent = "— " + color;
    host.querySelectorAll("[data-color]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.color === color)));
    host.querySelectorAll(".product-gallery img").forEach((img) => {
      img.src = p.colorImages?.[color] || p.image;
      img.alt = `${p.name} in ${color}`;
      img.style.filter = colorPreview(p, color);
    });
    host.querySelector("#related-products").innerHTML = relatedProducts(p).map(card).join("");
  }
  updateColor();
  window.addEventListener("storage", updateColor);
  document.querySelectorAll("[data-color]").forEach(
    (b) =>
      (b.onclick = () => {
        color = b.dataset.color;
        selectColor(p, color);
        updateColor();
        document.querySelector("#chosen-color").textContent = "— " + color;
        document
          .querySelectorAll("[data-color]")
          .forEach((x) => x.setAttribute("aria-pressed", x === b));
      }),
  );
  document.querySelectorAll("[data-size]").forEach(
    (b) =>
      (b.onclick = () => {
        size = b.dataset.size;
        document
          .querySelectorAll("[data-size]")
          .forEach((x) => x.setAttribute("aria-pressed", x === b));
      }),
  );
  document.querySelector("#add-product").onclick = () => {
    try {
      add(
        p.id,
        size,
        color,
        Number(document.querySelector("#product-qty").value),
      );
      document.querySelector("#variant-error").textContent = "";
      toast("Added to your shopping bag.");
    } catch (e) {
      document.querySelector("#variant-error").textContent = e.message;
    }
  };

}
export function bagPage() {
  const host = document.querySelector("#cart-view");
  if (!host) return;
  const render = () => {
    const bag = read("bag").filter((x) => find(x.id));
    if (!bag.length) {
      host.innerHTML =
        '<div class="empty"><h2>A little room for something new.</h2><p>Your bag is waiting for your next everyday favourite.</p><a class="btn" href="404.html">Shop Women</a><a class="btn outline" href="404.html">Shop Men</a></div>';
      return;
    }
    const subtotal = bag.reduce((s, x) => s + find(x.id).price * x.qty, 0),
      shipping = subtotal < 3000 ? 99 : 0;
    host.innerHTML = `<div class="bag-layout"><div>${bag
      .map((x) => {
        const p = find(x.id);
        return `<article class="bag-item"><a href="product-details.html?id=${p.id}"><img style="filter:${colorPreview(p, x.color)}" src="${p.image}" alt="${escape(p.name)} - ${escape(x.color)}" width="100" height="120"></a><div><h2><a href="product-details.html?id=${p.id}">${escape(p.name)}</a></h2><p>Size ${x.size} · ${x.color} · ${money(p.price)} each</p><div class="quantity"><button data-qty="${escape(x.key)}" data-change="-1" aria-label="Decrease quantity">−</button><span>${x.qty}</span><button data-qty="${escape(x.key)}" data-change="1" aria-label="Increase quantity">+</button></div></div><div><span>${money(p.price * x.qty)}</span><button class="remove-btn" data-remove="${escape(x.key)}">Remove</button></div></article>`;
      })
      .join(
        "",
      )}<a class="text-link" href="women.html">Continue shopping</a></div><aside class="order-summary"><h2>The details.</h2><div class="summary-row"><span>Subtotal</span><span>${money(subtotal)}</span></div><div class="summary-row"><span>Demo delivery</span><span>${money(shipping)}</span></div><div class="summary-row total"><span>Total</span><span>${money(subtotal + shipping)}</span></div><button class="full" id="checkout">Demo checkout</button><p class="caption">Illustrative shipping: ₹99 below ₹3,000. Free at ₹3,000 or above.</p><p id="checkout-message" role="status"></p></aside></div>`;
    host.querySelectorAll("[data-qty]").forEach(
      (b) =>
        (b.onclick = () => {
          const rows = read("bag"),
            item = rows.find((x) => x.key === b.dataset.qty),
            qty = item.qty + Number(b.dataset.change);
          if (qty < 1) return;
          if (qty > find(item.id).stock) {
            toast("Maximum demo stock reached.");
            return;
          }
          item.qty = qty;
          save("bag", rows);
          render();
        }),
    );
    host.querySelectorAll("[data-remove]").forEach(
      (b) =>
        (b.onclick = () => {
          save(
            "bag",
            read("bag").filter((x) => x.key !== b.dataset.remove),
          );
          render();
        }),
    );
    host.querySelector("#checkout").onclick = () => {
      history.replaceState({ ...history.state, storeScrollY: window.scrollY }, "");
      window.location.assign("404.html");
    };
  };
  render();
}
export function wishlistPage() {
  const host = document.querySelector("#wishlist-view");
  if (!host) return;
  const render = () => {
    const list = read("wishlist").map(find).filter(Boolean);
    host.innerHTML = list.length
      ? list.map(card).join("")
      : '<div class="empty"><h2>Your favourites belong here.</h2><p>Tap a heart on any piece to keep it close.</p><a class="btn" href="404.html">Shop Women</a><a class="btn outline" href="404.html">Shop Men</a></div>';
  };
  render();
  window.addEventListener("store-change", render);
}
