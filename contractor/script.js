/* Hartley Home Services - interactions */
(function () {
  "use strict";

  var doc = document;

  /* Mobile navigation */
  var toggle = doc.querySelector(".nav-toggle");
  var nav = doc.getElementById("primary-nav");

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeNav();
    });

    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) closeNav();
    });
  }

  /* Footer year */
  var year = doc.getElementById("contractor-year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* FAQ accordion */
  var triggers = Array.prototype.slice.call(doc.querySelectorAll(".accordion-trigger"));

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var expanded = trigger.getAttribute("aria-expanded") === "true";
      var panel = doc.getElementById(trigger.getAttribute("aria-controls"));

      trigger.setAttribute("aria-expanded", expanded ? "false" : "true");
      if (panel) panel.hidden = expanded;
    });
  });

  /* Contact form -> mailto fallback */
  var form = doc.getElementById("contractor-form");
  var status = doc.getElementById("contractor-status");

  function setInvalid(field, invalid) {
    var wrapper = field.closest(".field");
    if (wrapper) wrapper.classList.toggle("invalid", invalid);
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = form.elements.name;
      var phone = form.elements.phone;
      var email = form.elements.email;
      var service = form.elements.service;
      var message = form.elements.message;
      var valid = true;

      [name, phone, email].forEach(function (field) {
        var bad = !field.value.trim();
        if (!bad && field.type === "email") {
          bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        }
        setInvalid(field, bad);
        if (bad) valid = false;
      });

      if (!valid) {
        if (status) status.textContent = "Please add your name, phone, and a valid email.";
        var firstBad = form.querySelector(".field.invalid input");
        if (firstBad) firstBad.focus();
        return;
      }

      var subject = "Service request - " + (service ? service.value : "Hartley Home Services");
      var body =
        "Name: " + name.value.trim() + "\n" +
        "Phone: " + phone.value.trim() + "\n" +
        "Email: " + email.value.trim() + "\n" +
        "Service: " + (service ? service.value : "") + "\n\n" +
        (message && message.value.trim() ? message.value.trim() : "(no details)");

      var mailto = "mailto:service@hartleyhomeservices.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      if (status) status.textContent = "Opening your email app to send this request\u2026";
      window.location.href = mailto;
    });

    form.addEventListener("input", function (event) {
      if (event.target.closest(".field")) setInvalid(event.target, false);
    });
  }

})();
