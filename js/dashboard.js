import {
  products,
  find,
  read,
  money,
  escape,
  card,
} from "./store.js";
const sample = [
  {
    id: "ST-2041",
    date: "2026-07-12",
    customer: "Meera Rao",
    email: "meera@example.com",
    product: "women-everyday-midi-dress",
    size: "S",
    color: "Ivory",
    qty: 1,
    status: "Delivered",
  },
  {
    id: "ST-2067",
    date: "2026-08-08",
    customer: "Arjun Shah",
    email: "arjun@example.com",
    product: "mens-cotton-shirt",
    size: "M",
    color: "Sand",
    qty: 2,
    status: "Delivered",
  },
  {
    id: "ST-2098",
    date: "2026-08-22",
    customer: "Meera Rao",
    email: "meera@example.com",
    product: "women-modern-linen-co-ord-set",
    size: "S",
    color: "Ivory",
    qty: 1,
    status: "Delivered",
  },
  {
    id: "ST-2113",
    date: "2026-09-10",
    customer: "Arjun Shah",
    email: "arjun@example.com",
    product: "men-relaxed-knit-pullover",
    size: "L",
    color: "Blue",
    qty: 1,
    status: "Processing",
  },
  {
    id: "ST-2127",
    date: "2026-09-23",
    customer: "Riya Sen",
    email: "riya@example.com",
    product: "women-high-rise-straight-jeans",
    size: "M",
    color: "Sand",
    qty: 1,
    status: "Dispatched",
  },
  {
    id: "ST-2136",
    date: "2026-09-26",
    customer: "Meera Rao",
    email: "meera@example.com",
    product: "women-soft-cotton-wrap-top",
    size: "S",
    color: "Rose",
    qty: 2,
    status: "Processing",
  },
];
// Prices are fixed at the time of each sample order; editing catalogue prices does not rewrite historical purchases.
const orders = sample.map((o) => ({
  ...o,
  unitPrice: {
    "women-everyday-midi-dress": 2890,
    "mens-cotton-shirt": 1890,
    "women-modern-linen-co-ord-set": 3990,
    "men-relaxed-knit-pullover": 2690,
    "women-high-rise-straight-jeans": 2490,
    "women-soft-cotton-wrap-top": 1490,
  }[o.product],
}));
const orderTotal = (o) => o.unitPrice * o.qty;
function table(rows, admin) {
  return (
    '<div class="table-wrap"><table><thead><tr><th>Order</th><th>Clothing & variant</th>' +
    (admin ? "<th>Customer</th>" : "") +
    "<th>Date</th><th>Status</th><th>Total</th></tr></thead><tbody>" +
    rows
      .map(
        (o) =>
          `<tr><td>${o.id}</td><td><a href="product-details.html?id=${o.product}">${escape(find(o.product).name)}</a><br><span class="caption">${o.size} · ${o.color} · Qty ${o.qty}</span></td>${admin ? `<td>${o.customer}</td>` : ""}<td>${o.date}</td><td><span class="status">${o.status}</span></td><td>${money(orderTotal(o))}</td></tr>`,
      )
      .join("") +
    "</tbody></table></div>"
  );
}
function chart(rows, category = false) {
  const group = {};
  rows.forEach((o) => {
    const key = category ? find(o.product).category : o.date.slice(0, 7);
    group[key] = (group[key] || 0) + orderTotal(o);
  });
  const max = Math.max(...Object.values(group), 1);
  return (
    '<div class="bar-chart" role="img" aria-label="' +
    (category ? "Category" : "Monthly") +
    ' spending chart">' +
    Object.entries(group)
      .map(
        ([k, v]) =>
          `<div class="bar-row"><span>${k}</span><div><i style="width:${(v / max) * 100}%"></i></div><strong>${money(v)}</strong></div>`,
      )
      .join("") +
    "</div>"
  );
}
export function dashboard() {
  const root = document.querySelector(".dashboard");
  if (!root) return;
  const sidebarIcons = {
    overview: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    orders: '<path d="M8 3H5v18h14V3h-3"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M8 11h8M8 16h6"/>',
    purchases: '<path d="M4 7h16l1 14H3L4 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
    wishlist: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    spending: '<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18M7 15h4"/>',
    products: '<path d="m8 3-5 3-2 5 4 2 2-3v11h10V10l2 3 4-2-2-5-5-3a4 4 0 0 1-8 0Z"/>',
    inventory: '<path d="m12 3 9 5v9l-9 5-9-5V8l9-5ZM3 8l9 5 9-5M12 13v9M7.5 5.5l9 5"/>',
    customers: '<circle cx="9" cy="7" r="4"/><path d="M2 21v-3a7 7 0 0 1 14 0v3M17 3a4 4 0 0 1 0 8M22 21v-3a7 7 0 0 0-4-6"/>',
    analytics: '<path d="M3 3v18h18M7 16v-4M12 16V8M17 16V5"/>',
    reports: '<path d="M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8"/>',
    messages: '<path d="M21 11a8 8 0 0 1-8 8H7l-5 3 2-6a8 8 0 0 1-1-5 9 9 0 0 1 18 0Z"/><path d="M7 10h10M7 14h6"/>',
    store: '<path d="M3 10v11h18V10M2 10l2-7h16l2 7M2 10a3 3 0 0 0 5 2 3 3 0 0 0 5 0 3 3 0 0 0 5 0 3 3 0 0 0 5-2M9 21v-7h6v7"/>',
    logout: '<path d="M9 3H3v18h6M9 12h12m-4-4 4 4-4 4"/>',
  };
  root.querySelectorAll('.dashboard-sidebar nav button, .dashboard-sidebar nav a').forEach((item) => {
    const key = item.dataset.panel || (item.hasAttribute('data-logout') ? 'logout' : 'store');
    if (!sidebarIcons[key] || item.querySelector('.dashboard-nav-icon')) return;
    item.insertAdjacentHTML('afterbegin', `<svg class="dashboard-nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${sidebarIcons[key]}</svg>`);
  });
  const admin = root.dataset.role === "admin";
  let session;
  try {
    session = JSON.parse(sessionStorage.getItem("stackly-session"));
  } catch {}
  document.querySelector("#session-email").textContent = session
    ? session.email
    : "Guest demonstration · sign in to display your email";
  const rows = admin
    ? orders
    : orders.filter((o) => o.customer === "Meera Rao");
  const total = rows.reduce((s, o) => s + orderTotal(o), 0),
    host = document.querySelector("#dashboard-panel");
  function render(panel) {
    document
      .querySelectorAll("[data-panel]")
      .forEach((b) => b.classList.toggle("active", b.dataset.panel === panel));
    let body = "";
    if (panel === "overview") {
      body = `<div class="stat-grid"><article><span>${admin ? "Demo revenue" : "Demo spending"}</span><strong>${money(total)}</strong><small>From the displayed orders</small></article><article><span>Orders</span><strong>${rows.length}</strong><small>Sample clothing purchases</small></article><article><span>${admin ? "Catalogue products" : "Saved pieces"}</span><strong>${admin ? products().length : read("wishlist").length}</strong><small>${admin ? products().filter((p) => p.gender === "Men").length + " men · " + products().filter((p) => p.gender === "Women").length + " women" : "Your browser-local wishlist"}</small></article><article><span>${admin ? "Low stock" : "In progress"}</span><strong>${admin ? products().filter((p) => p.stock < 10).length : rows.filter((o) => o.status !== "Delivered").length}</strong><small>Demonstration records</small></article></div><div class="dashboard-charts"><section><h2>${admin ? "Sales trend" : "Monthly spending"}</h2>${chart(rows)}</section><section><h2>${admin ? "Category sales" : "Category spending"}</h2>${chart(rows, true)}</section></div><section class="dashboard-box"><h2>Recent clothing orders</h2>${table(rows, admin)}</section>`;
    }
    if (panel === "orders" || panel === "purchases") {
      body =
        '<section class="dashboard-box"><h2>' +
        (panel === "orders" ? "Clothing orders" : "Purchase history") +
        "</h2>" +
        table(rows, admin) +
        "</section>";

      body += '<section class="dashboard-box"><h2>' + (panel === "purchases" ? 'Your purchase details' : 'Order progress') + '</h2><div class="info-grid"><article class="info-card"><h3>Delivered pieces</h3><p>' + rows.filter((o) => o.status === 'Delivered').length + ' orders have been delivered. Keep the order number and garment details handy for any fit or care enquiries.</p></article><article class="info-card"><h3>Preparing for delivery</h3><p>' + rows.filter((o) => o.status !== 'Delivered').length + ' orders are in progress. Processing means the pieces are being prepared; dispatched means the parcel has left the store.</p></article><article class="info-card"><h3>Sizes, colours & quantities</h3><p>Each order lists the selected size, colour, and number of pieces. Check these details when reviewing your purchase history.</p></article><article class="info-card"><h3>' + (admin ? 'Fulfilment review' : 'Care for your wardrobe') + '</h3><p>' + (admin ? 'Review processing orders before dispatch and check return enquiries against the original order details.' : 'Follow the care label on each garment. Wash similar colours together and allow delicate fabrics to air dry.') + '</p></article></div></section>';
      if (admin)
        body +=
          '<section class="dashboard-box"><h2>Returns & exchanges</h2><p class="caption">Demonstration requests; no real return is processed.</p><div class="info-grid"><article class="info-card"><h3>ST-2041 / size exchange</h3><p>Everyday Midi Dress · S / Ivory → M / Ivory. Sample status: awaiting review.</p></article><article class="info-card"><h3>ST-2067 / return enquiry</h3><p>Everyday Cotton Shirt · M / Sand. Sample status: guidance provided.</p></article></div></section>';
    }
    if (panel === "wishlist") {
      const list = read("wishlist").map(find).filter(Boolean);
      body =
        '<section class="dashboard-box"><h2>Your saved clothing</h2><div class="product-grid">' +
        (list.length
          ? list.map(card).join("")
          : '<p>No saved pieces yet. <a class="text-link" href="women.html">Explore womenswear</a></p>') +
        "</div></section>";
    }
    if (["spending", "analytics"].includes(panel)) {
      body =
        '<div class="dashboard-charts"><section><h2>Monthly ' +
        (admin ? "sales" : "spending") +
        "</h2>" +
        chart(rows) +
        "</section><section><h2>By clothing category</h2>" +
        chart(rows, true) +
        '</section></div><section class="dashboard-box"><h2>Behind the numbers</h2><p>Total ' +
        money(total) +
        " across " +
        rows.length +
        " demonstration orders. Shipping is excluded from these merchandise totals. Historical order prices remain unchanged when catalogue prices are edited.</p>" +
        table(rows, admin) +
        "</section>";
    }
    if (panel === "products") {
      body =
        '<section class="dashboard-box"><h2>The clothing catalogue</h2><p>Review product names, prices, and stock quantities. Save opens the page unavailable screen.</p><div class="table-wrap"><table><thead><tr><th>Product</th><th>Price INR</th><th>Demo stock</th><th>Action</th></tr></thead><tbody>' +
        products()
          .map(
            (p) =>
              `<tr><td><input aria-label="Name for ${escape(p.name)}" data-edit-name="${p.id}" value="${escape(p.name)}"></td><td><input aria-label="Price for ${escape(p.name)}" type="number" min="1" data-edit-price="${p.id}" value="${p.price}"></td><td><input aria-label="Stock for ${escape(p.name)}" type="number" min="0" data-edit-stock="${p.id}" value="${p.stock}"></td><td><button data-edit="${p.id}">Save</button></td></tr>`,
          )
          .join("") +
        "</tbody></table></div></section>";
    }
    if (panel === "inventory") {
      body =
        '<section class="dashboard-box"><h2>Inventory by variant</h2><p class="caption">Demo allocation divides total product stock among all available size and colour combinations.</p><div class="table-wrap"><table><thead><tr><th>Product</th><th>Size / colour</th><th>Units</th><th>Stock status</th></tr></thead><tbody>' +
        products()
          .map((p) => {
            const variants = p.sizes.flatMap((s) =>
              p.colors.map((c) => ({ s, c })),
            );
            return variants
              .map((v, i) => {
                const stock =
                  Math.floor(p.stock / variants.length) +
                  (i < p.stock % variants.length ? 1 : 0);
                return `<tr><td>${escape(p.name)}</td><td>${v.s} / ${v.c}</td><td>${stock}</td><td>${stock < 2 ? "Low demo stock" : "Available"}</td></tr>`;
              })
              .join("");
          })
          .join("") +
        "</tbody></table></div></section>";
    }
    if (panel === "customers") {
      const names = [...new Set(orders.map((o) => o.customer))];
      body =
        '<section class="dashboard-box"><h2>Sample customer records</h2><div class="table-wrap"><table><thead><tr><th>Customer</th><th>Demo email</th><th>Orders</th><th>Merchandise total</th></tr></thead><tbody>' +
        names
          .map((name) => {
            const list = orders.filter((o) => o.customer === name);
            return `<tr><td>${name}</td><td>${list[0].email}</td><td>${list.length}</td><td>${money(list.reduce((s, o) => s + orderTotal(o), 0))}</td></tr>`;
          })
          .join("") +
        "</tbody></table></div></section>";
    }
    if (panel === "reports") {
      body =
        '<section class="dashboard-box"><h2>Your clothing report.</h2><p>Review the ' +
        rows.length +
        " sample records shown in the dashboard. Total merchandise value: " +
        money(total) +
        '.</p><button id="download-report">Download CSV report</button>' +
        table(rows, admin) +
        "</section>";
      body += '<section class="dashboard-box"><h2>Report summary</h2><div class="info-grid"><article class="info-card"><h3>Merchandise value</h3><p>' + money(total) + ' across ' + rows.length + ' sample orders. Totals include garment quantities and exclude shipping.</p></article><article class="info-card"><h3>Order status breakdown</h3><p>' + rows.filter((o) => o.status === 'Delivered').length + ' delivered, ' + rows.filter((o) => o.status === 'Processing').length + ' processing, and ' + rows.filter((o) => o.status === 'Dispatched').length + ' dispatched.</p></article></div><h3>Monthly overview</h3>' + chart(rows) + '<p class="caption">This report uses the sample records displayed above and the price recorded at purchase.</p></section>';
    }
    if (panel === "messages") {
      const enquiries = admin ? read("enquiries") : [];
      body =
        '<section class="dashboard-box"><h2>' +
        (admin ? "Customer enquiries" : "Support messages") +
        '</h2><p>Find guidance on your orders, delivery, returns, and garment care below.</p><div class="message"><h3>Finding a comfortable fit</h3><p>Demo support: compare your measurements with the guide, then check the product fit notes. Choose according to the area where the garment sits closest.</p><a class="text-link" href="404.html">Open size guide</a></div>' +
        '<div class="message"><h3>Tracking your order</h3><p>Review the Orders section for the latest sample status. Processing orders are being prepared, while dispatched orders are on their way.</p><span class="caption">Order support · Delivery updates</span></div><div class="message"><h3>Returns and size exchanges</h3><p>Have your order number, product name, and selected size ready when asking about an exchange. Keep garments with their original tags while reviewing return guidance.</p><span class="caption">Customer care · Fit assistance</span></div><div class="message"><h3>Looking after your pieces</h3><p>Check the sewn-in care label before washing. Gentle cycles and air drying help preserve fabric texture, shape, and colour.</p><span class="caption">Wardrobe advice · Garment care</span></div>' +
        enquiries
          .map(
            (e) =>
              `<div class="message"><h3>${escape(e.subject)}</h3><p>${escape(e.firstName)} ${escape(e.lastName)} · ${escape(e.email)}</p><p>${escape(e.message)}</p><span class="caption">Recorded in this browser. No message sent.</span></div>`,
          )
          .join("") +
        "</section>";
    }
    host.innerHTML = body;
    host.querySelectorAll('#download-report, [data-edit]').forEach((button) => {
      button.addEventListener('click', () => { location.href = '404.html'; });
    });
  }
  const menu = root.querySelector(".dashboard-menu");
  const mobileView = window.matchMedia("(max-width: 768px)");
  function setMenuOpen(open) {
    root.classList.toggle("sidebar-collapsed", !open);
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Close dashboard menu" : "Open dashboard menu");
  }
  setMenuOpen(!mobileView.matches);
  mobileView.addEventListener("change", (event) => setMenuOpen(!event.matches));
  document
    .querySelectorAll("[data-panel]")
    .forEach((b) => (b.onclick = () => {
      render(b.dataset.panel);
      if (mobileView.matches) {
        setMenuOpen(false);
        menu.focus();
      }
    }));
  document.querySelector("[data-logout]").onclick = () => {
    sessionStorage.removeItem("stackly-session");
    location.href = "signin.html";
  };
  menu.onclick = () => setMenuOpen(root.classList.contains("sidebar-collapsed"));
  root.querySelector(".dashboard-sidebar").addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileView.matches) {
      setMenuOpen(false);
      menu.focus();
    }
  });
  render("overview");
}
