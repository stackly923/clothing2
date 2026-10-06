export function forms() {
  const accountCreated = document.querySelector("[data-account-created]");
  if (accountCreated && sessionStorage.getItem("stackly-account-created") === "true") {
    accountCreated.textContent = "Your account is created. You can now sign in.";
    accountCreated.hidden = false;
    sessionStorage.removeItem("stackly-account-created");
  }
  document.querySelectorAll('.auth-panel select').forEach((select) => {
    const wrapper = document.createElement("div");
    wrapper.className = "auth-dropdown";
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "auth-dropdown-trigger";
    trigger.id = select.id + "-trigger";
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-describedby", select.getAttribute("aria-describedby") || "");
    const options = document.createElement("div");
    options.className = "auth-dropdown-options";
    options.id = select.id + "-options";
    options.hidden = true;
    options.setAttribute("role", "group");
    options.setAttribute("aria-label", "Role options");
    trigger.setAttribute("aria-controls", options.id);
    const sync = () => {
      trigger.textContent = select.selectedOptions[0]?.textContent || "Role";
      options.querySelectorAll("button").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.value === select.value));
      });
    };
    const close = () => {
      options.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    };
    [...select.options].filter((option) => !option.disabled).forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option.textContent;
      button.dataset.value = option.value;
      button.addEventListener("click", () => {
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        sync();
        close();
        trigger.focus();
      });
      options.append(button);
    });
    trigger.addEventListener("click", () => {
      options.hidden = !options.hidden;
      trigger.setAttribute("aria-expanded", String(!options.hidden));
    });
    wrapper.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        close();
        trigger.focus();
      }
    });
    wrapper.addEventListener("focusout", (event) => {
      if (!wrapper.contains(event.relatedTarget)) close();
    });
    document.addEventListener("click", (event) => {
      if (!wrapper.contains(event.target)) close();
    });
    select.before(wrapper);
    wrapper.append(trigger, options);
    select.hidden = true;
    const label = select.closest(".field").querySelector("label");
    if (label) label.htmlFor = trigger.id;
    select.addEventListener("change", sync);
    select.form.addEventListener("reset", () => { close(); setTimeout(sync, 0); });
    sync();
  });
  document.querySelectorAll("[data-form]").forEach((form) => {
    if (form.dataset.form === "contact") {
      form.querySelectorAll('[name="firstName"], [name="lastName"]').forEach((input) => {
        input.addEventListener("input", () => {
          input.value = input.value.replace(/[^\p{L}]/gu, "");
        });
      });
    }
    if (form.dataset.form === "newsletter") {
      const email = form.querySelector('[name="email"]');
      email.addEventListener("input", () => email.setCustomValidity(""));
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        email.value = email.value.trim();
        email.setCustomValidity(
          !email.value
            ? "Please enter your email address."
            : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
              ? "Please enter a valid email address."
              : "",
        );
        if (form.reportValidity()) {
          email.value = "";
          email.setCustomValidity("");
          window.location.assign("404.html");
        }
      });
      return;
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const type = form.dataset.form,
        fields = [...form.querySelectorAll("[name]")],
        data = Object.fromEntries(fields.map((x) => [x.name, x.value.trim()]));
      let valid = true,
        empty = false;
      fields.forEach((input) => {
        let error = "";
        const value = input.value.trim();
        if (input.required && !value) {
          error = "This field is required.";
          empty = true;
        } else if (value) {
          if (
            /Name$/.test(input.name) &&
            !/^[\p{L}][\p{L}\s'’-]*$/u.test(value)
          )
            error = "Use letters, spaces, apostrophes, or hyphens.";
          if (
            input.name === "email" &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          )
            error = "Enter a valid email address.";
          if (input.name === "phone" && !/^\d{10,15}$/.test(value))
            error = "Enter 10–15 digits, without spaces or symbols.";
          if (input.name === "password" && input.value.length < 8)
            error = "Use at least 8 characters.";
          if (
            input.name === "confirmPassword" &&
            input.value !== form.querySelector("[name=password]").value
          )
            error = "Passwords must match.";
        }
        input.setAttribute("aria-invalid", Boolean(error));
        if (input.hidden && input.tagName === "SELECT") {
          document.getElementById(input.id + "-trigger")?.setAttribute("aria-invalid", Boolean(error));
        }
        if (type === "contact" && /^(firstName|lastName)$/.test(input.name) &&
            value && !/^\p{L}+$/u.test(value)) {
          error = "Use letters only.";
          input.setAttribute("aria-invalid", "true");
        }
        const span = form.querySelector("#" + input.name + "-error");
        if (span) span.textContent = error;
        if (error) valid = false;
      });
      const feedback = form.querySelector(".feedback");
      if (!valid) {
        feedback.textContent = empty
          ? "Please fill in all required fields."
          : "Please correct the highlighted fields.";
        form.querySelector("[aria-invalid=true]:not([hidden])")?.focus();
        return;
      }
      if (type === "contact") {
        fields.forEach((input) => {
          input.value = "";
          input.removeAttribute("aria-invalid");
        });
        feedback.textContent = "";
        window.location.assign("404.html");
        return;
      }
      if (type === "register") {
        form
          .querySelectorAll(
            "input[type=password],input[name=password],input[name=confirmPassword]",
          )
          .forEach((x) => (x.value = ""));
        sessionStorage.setItem("stackly-account-created", "true");
        window.location.assign("signin.html");
        return;
      }
      if (type === "signin") {
        sessionStorage.setItem(
          "stackly-session",
          JSON.stringify({
            email: data.email,
            displayName: data.email.split("@")[0],
            role: data.role,
          }),
        );
        form.querySelector("[name=password]").value = "";
        location.href =
          data.role === "admin"
            ? "admin-dashboard.html"
            : "customer-dashboard.html";
      }
    });
    form
      .querySelector("[data-show-password]")
      ?.addEventListener("change", (e) => {
        form
          .querySelectorAll("[name=password],[name=confirmPassword]")
          .forEach((i) => (i.type = e.target.checked ? "text" : "password"));
      });
    form
      .querySelector("[name=phone]")
      ?.addEventListener(
        "input",
        (e) => (e.target.value = e.target.value.replace(/\D/g, "")),
      );
  });
}
