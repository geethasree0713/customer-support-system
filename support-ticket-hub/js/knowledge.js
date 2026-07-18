// ==========================
// Theme
// ==========================

// ==========================
// Theme
// ==========================

const themeButton = document.getElementById("theme-toggle");

const savedTheme = localStorage.getItem("theme") || "light";

document.documentElement.setAttribute("data-theme", savedTheme);

updateThemeButton(savedTheme);

themeButton.addEventListener("click", () => {

    const current =
        document.documentElement.getAttribute("data-theme");

    const next =
        current === "dark"
            ? "light"
            : "dark";

    document.documentElement.setAttribute("data-theme", next);

    localStorage.setItem("theme", next);

    updateThemeButton(next);

});

function updateThemeButton(theme) {

    themeButton.innerHTML =

        theme === "dark"

            ? "☀️ Light Mode"

            : "🌙 Dark Mode";

}

// ==========================
// Knowledge Base Repository
// ==========================

const articlesRepository = [
    {
        id: 1,
        category: "Account",
        icon: "🔑",
        title: "Reset Account Password",
        tags: ["password", "login", "reset", "account"],
        difficulty: "Easy",
        time: "2 min",
        updated: "15 Jul 2026",
        solution: [
            "Open the company login portal.",
            "Click 'Forgot Password'.",
            "Verify your identity using email or OTP.",
            "Create a new password.",
            "Log in using the new password."
        ]
    },

    {
        id: 2,
        category: "Networking",
        icon: "🌐",
        title: "Wi-Fi Not Working",
        tags: ["wifi", "router", "internet", "network"],
        difficulty: "Easy",
        time: "3 min",
        updated: "10 Jul 2026",
        solution: [
            "Restart the router.",
            "Wait 30 seconds.",
            "Reconnect to the Wi-Fi.",
            "Check if the Internet LED is green."
        ]
    },

    {
        id: 3,
        category: "Printing",
        icon: "🖨️",
        title: "Printer Not Printing",
        tags: ["printer", "print", "spooler"],
        difficulty: "Medium",
        time: "5 min",
        updated: "08 Jul 2026",
        solution: [
            "Open Command Prompt as Administrator.",
            "Run: net stop spooler",
            "Run: net start spooler",
            "Try printing again."
        ]
    },

    {
        id: 4,
        category: "Software",
        icon: "💻",
        title: "Application Not Opening",
        tags: ["software", "crash", "application"],
        difficulty: "Easy",
        time: "4 min",
        updated: "05 Jul 2026",
        solution: [
            "Restart your computer.",
            "Check for software updates.",
            "Run the application as Administrator.",
            "If the issue persists, reinstall the application."
        ]
    }
];


// ==========================
// Search Function
// ==========================

function executeQueryFiltering() {

    const query = document
        .getElementById("kb-search")
        .value
        .trim()
        .toLowerCase();

    const container =
        document.getElementById("kb-results-container");

    container.innerHTML = "";

    const words =
        query.split(/\s+/).filter(Boolean);

    const results = articlesRepository.filter(article => {

        if (words.length === 0) return true;

        return words.every(word =>

            article.title.toLowerCase().includes(word) ||

            article.category.toLowerCase().includes(word) ||

            article.tags.some(tag =>
                tag.toLowerCase().includes(word)
            ) ||

            article.solution
                .join(" ")
                .toLowerCase()
                .includes(word)

        );

    });

    // Result Count

    const count = document.createElement("p");

    count.style.marginBottom = "15px";
    count.style.color = "#64748b";

    count.innerHTML =
        `<strong>${results.length}</strong> article(s) found`;

    container.appendChild(count);

    if (results.length === 0) {

        container.innerHTML += `
            <div class="card">
                <h3>❌ No matching articles</h3>
                <p>
                    Try different keywords like
                    <b>password</b>,
                    <b>wifi</b>,
                    or
                    <b>printer</b>.
                </p>
            </div>
        `;

        return;
    }

    results.forEach(article => {

        const card = document.createElement("div");

        card.className = "card";

        card.style.marginBottom = "18px";

        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <h3>${article.icon} ${article.title}</h3>
                <span class="badge">${article.category}</span>
            </div>

            <p style="margin:8px 0;color:#64748b;">
                Difficulty:
                <strong>${article.difficulty}</strong>

                •

                Time:
                <strong>${article.time}</strong>

                •

                Updated:
                ${article.updated}
            </p>

            <button class="toggle-btn">
                View Solution
            </button>

            <div class="solution" style="display:none;margin-top:12px;">
                <ol>
                    ${article.solution
                        .map(step => `<li>${step}</li>`)
                        .join("")}
                </ol>
            </div>

            <div style="margin-top:12px;">
                ${article.tags
                    .map(tag => `<span class="badge">#${tag}</span>`)
                    .join(" ")}
            </div>
        `;

        const button =
            card.querySelector(".toggle-btn");

        const solution =
            card.querySelector(".solution");

        button.addEventListener("click", () => {

            if (solution.style.display === "none") {

                solution.style.display = "block";
                button.textContent = "Hide Solution";

            } else {

                solution.style.display = "none";
                button.textContent = "View Solution";

            }

        });

        container.appendChild(card);

    });

}


// ==========================
// Events
// ==========================

document
    .getElementById("kb-search")
    .addEventListener("input", executeQueryFiltering);

window.addEventListener(
    "DOMContentLoaded",
    executeQueryFiltering
);