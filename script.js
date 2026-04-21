// Horizontal panels: responsive, wheel & touch controlled, nav support
(() => {
  const hOuter = document.getElementById("hPanelsOuter");
  const hInner = document.getElementById("hPanelsInner");
  const panels = Array.from(hInner.querySelectorAll(".panel"));
  const navLinks = document.querySelectorAll(
    "nav [data-index], .btn[data-index]",
  );

  let vw = Math.max(window.innerWidth, 320);
  let maxTranslate = 0;
  let current = 0; // current translated px (0 .. maxTranslate)
  let touchStartY = null;

  function isPageAtBottom(threshold = 12) {
    const scrolled = window.scrollY + window.innerHeight;
    const total = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
    );
    return total - scrolled <= threshold;
  }

  function updateSizes() {
    vw = Math.max(window.innerWidth, 320);
    panels.forEach((p) => (p.style.minWidth = vw + "px"));
    hInner.style.width = panels.length * vw + "px";
    maxTranslate = Math.max(0, panels.length * vw - vw);

    const idx = Math.round(current / vw);
    current = Math.min(maxTranslate, Math.max(0, idx * vw));
    setTranslate(current, false);
  }

  function setTranslate(px, animate = true) {
    px = Math.min(maxTranslate, Math.max(0, px));
    current = px;
    if (!animate) {
      hInner.style.transition = "none";
    } else {
      hInner.style.transition = "transform 420ms cubic-bezier(.22,.9,.27,1)";
    }
    hInner.style.transform = "translateX(" + -px + "px)";
    if (!animate) {
      void hInner.offsetWidth;
      hInner.style.transition = "";
    }
  }

  // nav clicks -> scroll to the horizontal section then set transform to panel
  navLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      const idx = Number(a.getAttribute("data-index"));
      if (!isNaN(idx) && panels[idx]) {
        // ensure the horizontal panels area is visible on the page first
        if (hOuter)
          hOuter.scrollIntoView({ behavior: "smooth", block: "nearest" });

        setTimeout(() => setTranslate(idx * vw, true), 220);
      }
    });
  });

  function onWheel(e) {
    const rect = hOuter.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      if (!isPageAtBottom()) return;
      e.preventDefault();
      const delta = e.deltaY;
      setTranslate(current + delta, false);
    }
  }

  function onTouchStart(e) {
    if (e.touches && e.touches.length === 1) {
      touchStartY = e.touches[0].clientY;
    }
  }
  function onTouchMove(e) {
    if (!touchStartY) return;
    const rect = hOuter.getBoundingClientRect();
    if (!(rect.top < window.innerHeight && rect.bottom > 0)) return;
    if (!isPageAtBottom()) return;
    const y = e.touches[0].clientY;
    const delta = touchStartY - y;
    touchStartY = y;
    e.preventDefault();
    setTranslate(current + delta, false);
  }
  function onTouchEnd() {
    touchStartY = null;
  }

  function onScroll() {
    const rect = hOuter.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) {
      hInner.style.transition = "transform 260ms ease";
      hInner.style.transform = "";
      setTimeout(() => {
        if (hInner) hInner.style.transition = "";
      }, 300);
    }
  }

  if (hOuter) {
    hOuter.addEventListener("wheel", onWheel, { passive: false });
    // Touch listeners
    hOuter.addEventListener("touchstart", onTouchStart, { passive: false });
    hOuter.addEventListener("touchmove", onTouchMove, { passive: false });
    hOuter.addEventListener("touchend", onTouchEnd, { passive: true });
  }

  window.addEventListener("resize", updateSizes, { passive: true });
  window.addEventListener("load", updateSizes);
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("DOMContentLoaded", updateSizes);

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const rect = hOuter
        ? hOuter.getBoundingClientRect()
        : { top: Number.POSITIVE_INFINITY, bottom: Number.NEGATIVE_INFINITY };
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        e.preventDefault();
        const step = vw;
        if (e.key === "ArrowRight") setTranslate(current + step, true);
        else setTranslate(current - step, true);
      }
    }
  });

  window.DisasterX = {
    goToPanel: (idx) => {
      if (typeof idx === "number" && panels[idx]) {
        if (hOuter)
          hOuter.scrollIntoView({ behavior: "smooth", block: "nearest" });
        setTimeout(() => setTranslate(idx * vw, true), 220);
      }
    },
  };
})();

// Navigation smooth scrolling for more info, download, news, and features sections
(() => {
  const moreInfoNavLink = document.getElementById("moreInfoNavLink");
  const moreInfoSection = document.getElementById("more-info-section");

  const downloadNavLink = document.getElementById("downloadNavLink");
  const downloadSection = document.getElementById("download");

  const newsNavLink = document.getElementById("newsNavLink");
  const newsSection = document.getElementById("news-section");

  const featuresNavLink = document.getElementById("featuresNavLink");
  const featuresSection = document.getElementById("features-section");

  if (featuresNavLink && featuresSection) {
    featuresNavLink.addEventListener("click", (e) => {
      e.preventDefault();
      featuresSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (moreInfoNavLink && moreInfoSection) {
    moreInfoNavLink.addEventListener("click", (e) => {
      e.preventDefault();
      moreInfoSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (downloadNavLink && downloadSection) {
    downloadNavLink.addEventListener("click", (e) => {
      e.preventDefault();
      downloadSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (newsNavLink && newsSection) {
    newsNavLink.addEventListener("click", (e) => {
      e.preventDefault();
      newsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
})();

// Video play button functionality
(() => {
  const playButtonOverlay = document.getElementById("playButtonOverlay");
  const videoOverlay = document.getElementById("videoTextOverlay");
  const gameplayVideo = document.getElementById("gameplayVideo");

  if (playButtonOverlay && gameplayVideo) {
    playButtonOverlay.addEventListener("click", () => {
      playButtonOverlay.style.display = "none";
      if (videoOverlay) videoOverlay.style.display = "none";
      gameplayVideo.muted = !gameplayVideo.muted;
    });
  }

  if (gameplayVideo) {
    gameplayVideo.addEventListener("click", () => {
      gameplayVideo.muted = !gameplayVideo.muted;
    });
  }
})();
(() => {
  const contactForm = document.getElementById("contactForm");
  const emailInput = document.getElementById("emailInput");
  const emailError = document.getElementById("emailError");

  // Common email domains for validation
  const validDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
    "aol.com",
    "protonmail.com",
    "zoho.com",
    "mail.com",
    "yandex.com",
    "gmx.com",
    "live.com",
    "me.com",
    "msn.com",
    "inbox.com",
  ];

  function validateEmail(email) {
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: "Please enter a valid email address" };
    }

    // Extract domain
    const domain = email.split("@")[1];
    if (!domain) {
      return {
        valid: false,
        message: "Email must include a domain (e.g., @gmail.com)",
      };
    }

    // Check if domain is in valid list or has proper structure
    const hasValidDomain = validDomains.some(
      (validDomain) => domain.toLowerCase() === validDomain,
    );
    const hasValidStructure =
      domain.includes(".") && domain.split(".")[1].length >= 2;

    if (!hasValidDomain && !hasValidStructure) {
      return {
        valid: false,
        message: "Please use a valid email provider (e.g., @gmail.com)",
      };
    }

    return { valid: true, message: "" };
  }

  if (emailInput) {
    // Real-time validation on blur
    emailInput.addEventListener("blur", () => {
      const email = emailInput.value.trim();
      if (email) {
        const validation = validateEmail(email);
        if (!validation.valid) {
          emailError.textContent = validation.message;
          emailError.style.display = "block";
          emailInput.style.borderColor = "#ff4444";
        } else {
          emailError.style.display = "none";
          emailInput.style.borderColor = "rgba(94, 234, 255, 0.2)";
        }
      }
    });

    // Clear error on focus
    emailInput.addEventListener("focus", () => {
      emailError.style.display = "none";
      emailInput.style.borderColor = "rgba(94, 234, 255, 0.5)";
    });
  }

  //contact form elements
  const nameInput = document.getElementById("nameInput");
  const subjectInput = document.getElementById("subjectInput");
  const messageInput = document.getElementById("messageInput");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const subject = subjectInput.value.trim();
      const message = messageInput.value.trim();

      const validation = validateEmail(email);
      if (!validation.valid) {
        emailError.textContent = validation.message;
        emailError.style.display = "block";
        emailInput.style.borderColor = "#ff4444";
        emailInput.focus();
        return;
      }

      emailError.style.display = "none";
      emailInput.style.borderColor = "rgba(94, 234, 255, 0.2)";

      try {
        const response = await fetch("connect.php", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            action: "contact", // Important
            name,
            email,
            subject,
            message,
          }),
        });

        const result = await response.json();

        if (result.status === "success") {
          alert(result.message);
          contactForm.reset();
        } else {
          alert(result.message);
        }
      } catch (error) {
        alert("Something went wrong. Please try again.");
      }
    });
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  // --------------------- SIGNUP ---------------------
  const signupForm = document.getElementById("signupForm");
  const signupName = document.getElementById("signupName");
  const signupEmail = document.getElementById("signupEmail");
  const signupPassword = document.getElementById("signupPassword");

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fullname = signupName.value.trim();
      const email = signupEmail.value.trim();
      const password = signupPassword.value.trim();

      if (!fullname || !email || !password) {
        alert("All fields are required");
        return;
      }

      if (!email.includes("@")) {
        alert("Invalid email address");
        return;
      }

      try {
        const response = await fetch("connect.php", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            action: "signup",
            fullname,
            email,
            password,
          }),
        });

        const result = await response.json();
        if (result && result.message) {
          alert(result.message); // shows the PHP message
        } else {
          alert("Something went wrong. Please try again.");
        }

        if (result.status === "success") {
          signupForm.reset();
          if (typeof showLoginForm === "function") {
            showLoginForm();
          }
        }
      } catch (error) {
        console.error(error);
        alert("Something went wrong. Please try again.");
      }
    });
  }

  // --------------------- LOGIN ---------------------
  const loginForm = document.getElementById("loginForm");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const signinModal = document.getElementById("signinModal");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = loginEmail.value.trim();
      const password = loginPassword.value.trim();

      try {
        const response = await fetch("connect.php", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            action: "login",
            email,
            password,
          }),
        });

        const result = await response.json();
        if (result && result.message) {
          alert(result.message); // shows the PHP message
        } else {
          alert("Something went wrong. Please try again.");
        }

        if (result.status === "success") {
          loginForm.reset();
          signinModal.style.display = "none"; // close modal
        }
      } catch (error) {
        console.error(error);
        alert("Something went wrong. Please try again.");
      }
    });
  }

  // --------------------- FORGOT PASSWORD ---------------------
  const forgotForm = document.getElementById("forgotPasswordForm");
  const forgotEmail = document.getElementById("forgotEmail");
  const forgotModal = document.getElementById("forgotPasswordModal");

  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = forgotEmail.value.trim();

      try {
        const response = await fetch("connect.php", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            action: "forgot",
            email,
          }),
        });

        const result = await response.json();
        if (result && result.message) {
          alert(result.message); // shows the PHP message
        } else {
          alert("Something went wrong. Please try again.");
        }

        if (result.status === "success") {
          forgotForm.reset();
          forgotModal.style.display = "none"; // close modal
        }
      } catch (error) {
        console.error(error);
        alert("Something went wrong. Please try again.");
      }
    });
  }
});
