/* ==========================================
   Helpdesk Portal
   Global App Controller
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeTheme();

    initializeNavigation();

    initializePageAnimation();

    initializeScrollTop();

});


/* ==========================================
   DARK MODE
========================================== */

function initializeTheme() {

    const btn = document.getElementById("theme-toggle");

    if (!btn) return;

    const savedTheme =
        localStorage.getItem("theme") || "light";

    document.documentElement.setAttribute(
        "data-theme",
        savedTheme
    );

    updateThemeButton(savedTheme);

    btn.addEventListener("click", () => {

        const current =
            document.documentElement.getAttribute("data-theme");

        const next =
            current === "light"
                ? "dark"
                : "light";

        document.documentElement.setAttribute(
            "data-theme",
            next
        );

        localStorage.setItem("theme", next);

        updateThemeButton(next);

    });

}

function updateThemeButton(theme) {

    const btn = document.getElementById("theme-toggle");

    if (!btn) return;

    if (theme === "dark") {

        btn.innerHTML = "☀️ Light Mode";

    } else {

        btn.innerHTML = "🌙 Dark Mode";

    }

}


/* ==========================================
   ACTIVE NAVIGATION
========================================== */

function initializeNavigation() {

    const currentPage =
        window.location.pathname.split("/").pop();

    document
        .querySelectorAll("nav a")
        .forEach(link => {

            const href = link.getAttribute("href");

            if (href === currentPage) {

                link.classList.add("active");

            }

        });

}


/* ==========================================
   PAGE FADE ANIMATION
========================================== */

function initializePageAnimation() {

    document.body.classList.add("loaded");

    document
        .querySelectorAll("a")
        .forEach(link => {

            const href = link.getAttribute("href");

            if (
                href &&
                !href.startsWith("#") &&
                !href.startsWith("http")
            ) {

                link.addEventListener("click", e => {

                    e.preventDefault();

                    document.body.classList.add("fade-out");

                    setTimeout(() => {

                        window.location.href = href;

                    }, 250);

                });

            }

        });

}


/* ==========================================
   SCROLL TO TOP
========================================== */

function initializeScrollTop() {

    const btn = document.createElement("button");

    btn.id = "scrollTopBtn";

    btn.innerHTML = "↑";

    document.body.appendChild(btn);

    btn.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

    window.addEventListener("scroll", () => {

        if (window.scrollY > 250) {

            btn.classList.add("show");

        } else {

            btn.classList.remove("show");

        }

    });

}


/* ==========================================
   GLOBAL TOAST
========================================== */

window.showToast = function (

    message,

    type = "success"

) {

    const container =
        document.getElementById("toast-container");

    if (!container) return;

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type}`;

    toast.innerHTML = message;

    container.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("hide");

    }, 3000);

    setTimeout(() => {

        toast.remove();

    }, 3400);

};