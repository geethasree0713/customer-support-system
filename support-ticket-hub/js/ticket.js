import { db, storage } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

import { sendTicketNotification } from "./email.js";


// =========================
// Theme Toggle
// =========================

const themeButton = document.getElementById("theme-toggle");

if (themeButton) {

    themeButton.addEventListener("click", () => {

        const current =
            document.documentElement.getAttribute("data-theme");

        const next =
            current === "dark"
            ? "light"
            : "dark";

        document.documentElement.setAttribute(
            "data-theme",
            next
        );

        themeButton.innerText =
            next === "dark"
            ? "☀️ Light Mode"
            : "🌙 Dark Mode";

        localStorage.setItem("theme", next);

    });

}


// Restore Theme

const savedTheme =
    localStorage.getItem("theme");

if (savedTheme) {

    document.documentElement.setAttribute(
        "data-theme",
        savedTheme
    );

    if (themeButton) {

        themeButton.innerText =
            savedTheme === "dark"
            ? "☀️ Light Mode"
            : "🌙 Dark Mode";

    }

}


// =========================
// Toast Notification
// =========================

function showToast(message, type = "success") {

    const container =
        document.getElementById("toast-container");

    if (!container) return;

    const toast =
        document.createElement("div");

    toast.className = `toast ${type}`;

    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 4000);

}


// =========================
// Email Validation
// =========================

function isValidEmail(email) {

    const regex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);

}


// =========================
// Generate Ticket Number
// =========================

function generateTicketNumber() {

    return (
        "TKT-" +
        new Date().getFullYear() +
        "-" +
        Math.floor(
            100000 + Math.random() * 900000
        )
    );

}


// =========================
// Auto Category Detection
// =========================

function detectCategory(title) {

    const text =
        title.toLowerCase();

    if (
        text.includes("password") ||
        text.includes("login")
    ) {

        return "Account";

    }

    if (
        text.includes("wifi") ||
        text.includes("internet") ||
        text.includes("network")
    ) {

        return "Networking";

    }

    if (
        text.includes("printer") ||
        text.includes("print")
    ) {

        return "Hardware";

    }

    if (
        text.includes("software") ||
        text.includes("app")
    ) {

        return "Software";

    }

    return "General";

}


// =========================
// File Validation
// =========================

function validateFile(file) {

    if (!file)
        return true;

    const allowedTypes = [

        "image/png",

        "image/jpeg",

        "application/pdf"

    ];

    const maxSize =
        5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {

        showToast(
            "Only PDF, PNG and JPG files are allowed.",
            "error"
        );

        return false;

    }

    if (file.size > maxSize) {

        showToast(
            "Maximum file size is 5 MB.",
            "error"
        );

        return false;

    }

    return true;

}
// =========================
// Ticket Form Submission
// =========================

const ticketForm = document.getElementById("ticket-form");

ticketForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const submitButton =
        ticketForm.querySelector(
            "button[type='submit']"
        );

    submitButton.disabled = true;
    submitButton.innerText = "Creating Ticket...";

    try {

        // -------------------------
        // Read Form Values
        // -------------------------

        const customerName =
            document
                .getElementById("cust-name")
                .value
                .trim();

        const customerEmail =
            document
                .getElementById("cust-email")
                .value
                .trim();

        const ticketTitle =
            document
                .getElementById("ticket-title")
                .value
                .trim();

        const priority =
            document
                .getElementById("ticket-priority")
                .value;

        const description =
            document
                .getElementById("ticket-desc")
                .value
                .trim();

        const fileInput =
            document.getElementById(
                "ticket-file"
            );

        // -------------------------
        // Validation
        // -------------------------

        if (
            !customerName ||
            !customerEmail ||
            !ticketTitle ||
            !description
        ) {

            showToast(
                "Please fill all required fields.",
                "error"
            );

            return;

        }

        if (
            !isValidEmail(
                customerEmail
            )
        ) {

            showToast(
                "Invalid email address.",
                "error"
            );

            return;

        }

        // -------------------------
        // File Validation
        // -------------------------

        let attachmentUrl = "";

        if (
            fileInput.files.length > 0
        ) {

            const file =
                fileInput.files[0];

            if (
                !validateFile(file)
            ) {

                return;

            }

            showToast(
                "Uploading attachment...",
                "success"
            );

            const storageReference =
                ref(
                    storage,
                    `uploads/${Date.now()}_${file.name}`
                );

            const uploadSnapshot =
                await uploadBytes(
                    storageReference,
                    file
                );

            attachmentUrl =
                await getDownloadURL(
                    uploadSnapshot.ref
                );

        }

        // -------------------------
        // Generate Ticket Details
        // -------------------------

        const ticketNumber =
            generateTicketNumber();

        const category =
            detectCategory(
                ticketTitle
            );

        // -------------------------
        // Save to Firestore
        // -------------------------

        const documentReference =
            await addDoc(
                collection(
                    db,
                    "tickets"
                ),
                {

                    ticketNumber,

                    customer: {

                        name:
                            customerName,

                        email:
                            customerEmail

                    },

                    issue: {

                        title:
                            ticketTitle,

                        description,

                        priority,

                        category

                    },

                    attachment:
                        attachmentUrl,

                    status: {

                        current:
                            "Open",

                        assignedTo:
                            "Unassigned"

                    },

                    timestamps: {

                        createdAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()

                    },

                    timeline: [

                        {

                            action:
                                "Ticket Created",

                            actor:
                                customerName,

                            timestamp:
                                new Date().toISOString()

                        }

                    ]

                }

            );

        // -------------------------
        // Success Message
        // -------------------------

        showToast(
            `Ticket ${ticketNumber} created successfully.`
        );

        // -------------------------
        // Send Email
        // -------------------------

        try {

            await sendTicketNotification(
                "created",
                {

                    ticket_id:
                        documentReference.id,

                    ticket_number:
                        ticketNumber,

                    customer_email:
                        customerEmail,

                    customer_name:
                        customerName,

                    issue_title:
                        ticketTitle

                }
            );

        }

        catch (emailError) {

            console.error(
                emailError
            );

            showToast(
                "Ticket created but email notification failed.",
                "error"
            );

        }

        // -------------------------
        // Reset Form
        // -------------------------

        ticketForm.reset();

    }

    catch (error) {

        console.error(error);

        showToast(
            error.message,
            "error"
        );

    }

    finally {

        submitButton.disabled = false;

        submitButton.innerText =
            "Submit Ticket";

    }

});
// =========================
// Auto Save Draft
// =========================

const draftFields = [

    "cust-name",
    "cust-email",
    "ticket-title",
    "ticket-priority",
    "ticket-desc"

];

draftFields.forEach(id => {

    const element =
        document.getElementById(id);

    if (!element) return;

    const saved =
        localStorage.getItem(id);

    if (saved !== null) {

        element.value = saved;

    }

    element.addEventListener("input", () => {

        localStorage.setItem(
            id,
            element.value
        );

    });

});


// =========================
// Clear Draft
// =========================

function clearDraft() {

    draftFields.forEach(id => {

        localStorage.removeItem(id);

    });

}


// =========================
// Upload Progress Display
// =========================

function showUploadStatus(message) {

    let status =
        document.getElementById(
            "upload-status"
        );

    if (!status) {

        status =
            document.createElement("div");

        status.id = "upload-status";

        status.style.marginTop = "12px";
        status.style.fontWeight = "600";
        status.style.color = "#2563eb";

        document
            .getElementById("ticket-form")
            .appendChild(status);

    }

    status.innerText = message;

}


function hideUploadStatus() {

    const status =
        document.getElementById(
            "upload-status"
        );

    if (status) {

        status.remove();

    }

}


// =========================
// Success Card
// =========================

function showSuccessCard(ticketNumber) {

    let card =
        document.getElementById(
            "success-card"
        );

    if (card) {

        card.remove();

    }

    card =
        document.createElement("div");

    card.id = "success-card";

    card.className = "card";

    card.style.marginTop = "20px";

    card.innerHTML = `

        <h3>✅ Ticket Created Successfully</h3>

        <p style="margin-top:10px;">
            Ticket Number
        </p>

        <h2 style="color:#2563eb;">
            ${ticketNumber}
        </h2>

        <button
            id="copy-ticket-btn"
            style="
                margin-top:15px;
                padding:8px 16px;
                cursor:pointer;
            "
        >
            📋 Copy Ticket Number
        </button>

    `;

    document.body.appendChild(card);

    document
        .getElementById(
            "copy-ticket-btn"
        )
        .addEventListener(
            "click",
            () => {

                navigator.clipboard.writeText(
                    ticketNumber
                );

                showToast(
                    "Ticket number copied."
                );

            }
        );

}


// =========================
// Page Load
// =========================

window.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Support Ticket Portal Ready"
        );

    }
);