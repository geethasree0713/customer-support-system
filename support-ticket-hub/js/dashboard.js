// =====================================
// THEME MANAGEMENT
// =====================================
import { db } from "./firebase.js";

import {
    collection,
    onSnapshot,
    updateDoc,
    doc,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {
    getPriorityBadge,
    getStatusBadge,
    calculateSLARemaining,
    getTicketAge,
    formatDate,
    generateTicketNumber,
    escapeHTML,
    sendTicketNotification,
    checkEmptyState
} from "./utils.js";
const themeButton = document.getElementById("theme-toggle");

const savedTheme = localStorage.getItem("theme") || "light";

document.documentElement.setAttribute("data-theme", savedTheme);

if (themeButton) {

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

}

function updateThemeButton(theme) {

    if (!themeButton) return;

    themeButton.innerHTML =

        theme === "dark"

        ? "☀️ Light Mode"

        : "🌙 Dark Mode";

}
// =====================================
// GLOBAL VARIABLES
// =====================================

let tickets = [];

let selectedTicket = null;

let selectedRating = 0;
// =====================================
// TOAST
// =====================================

function showToast(message, type = "success") {

    const container =
        document.getElementById("toast-container");

    if (!container) return;

    const toast =
        document.createElement("div");

    toast.className = `toast ${type}`;

    toast.innerHTML = message;

    container.appendChild(toast);

    setTimeout(() => {

        toast.style.opacity = "0";

        toast.style.transform =
            "translateX(30px)";

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3000);


}
// =====================================
// REALTIME FIREBASE
// =====================================

onSnapshot(

    collection(db, "tickets"),

    (snapshot) => {

        tickets = [];

        snapshot.forEach((docSnap) => {

            const data = docSnap.data();

            tickets.push({

                id: docSnap.id,

                ticketNumber:
                    data.ticketNumber || docSnap.id,

                customerName:
                    data.customer?.name || "",

                customerEmail:
                    data.customer?.email || "",

                title:
                    data.issue?.title || "",

                description:
                    data.issue?.description || "",

                priority:
                    data.issue?.priority || "Low",

                category:
                    data.issue?.category || "General",

                status:
                    data.status?.current || "Open",

                assignedAgent:
                    data.status?.assignedTo || "Unassigned",

                attachment:
                    data.attachment || "",

                createdAt:
                    data.timestamps?.createdAt || null,

                updatedAt:
                    data.timestamps?.updatedAt || null,

                resolvedAt:
                    data.timestamps?.resolvedAt || null,

                internalNotes:
                    data.internalNotes || [],

                timeline:
                    data.timeline || [],

                csatScore:
                    data.csatScore || null,

                csatComment:
                    data.csatComment || ""

            });

        });

        renderTable();

        checkEmptyState(tickets);

        if (selectedTicket) {

            loadDrawer(selectedTicket.id);

        }

    }

);
// =====================================
// FILTER EVENTS
// =====================================

document
.getElementById("search-bar")
.addEventListener("input", renderTable);

document
.getElementById("filter-status")
.addEventListener("change", renderTable);

document
.getElementById("filter-priority")
.addEventListener("change", renderTable);

document
.getElementById("filter-agent")
.addEventListener("change", renderTable);
// =====================================
// TABLE
// =====================================

function renderTable() {

    const tbody =
        document.getElementById("ticket-rows");

    tbody.innerHTML = "";

    const search =
        document
        .getElementById("search-bar")
        .value
        .toLowerCase()
        .trim();

    const status =
        document
        .getElementById("filter-status")
        .value;

    const priority =
        document
        .getElementById("filter-priority")
        .value;

    const agent =
        document
        .getElementById("filter-agent")
        .value;

    const filtered = tickets.filter(ticket => {

        const matchSearch =

            ticket.ticketNumber
                .toLowerCase()
                .includes(search)

            ||

            ticket.customerName
                .toLowerCase()
                .includes(search)

            ||

            ticket.customerEmail
                .toLowerCase()
                .includes(search)

            ||

            ticket.title
                .toLowerCase()
                .includes(search)

            ||

            ticket.category
                .toLowerCase()
                .includes(search);

        const matchStatus =

            status === "All"

            ||

            ticket.status === status;

        const matchPriority =

            priority === "All"

            ||

            ticket.priority === priority;

        const matchAgent =

            agent === "All"

            ||

            ticket.assignedAgent === agent;

        return (

            matchSearch

            &&

            matchStatus

            &&

            matchPriority

            &&

            matchAgent

        );

    });

    document.getElementById("queue-depth").textContent =
        filtered.length;

    if (filtered.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="7"
                    style="
                        text-align:center;
                        padding:40px;
                        color:#64748b;
                    ">

                    📭 No Tickets Found

                </td>

            </tr>

        `;

        return;

    }

    filtered.forEach(ticket => {

        const sla = calculateSLARemaining(

            ticket.createdAt,

            ticket.priority

        );

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>

                <strong>

                    ${ticket.ticketNumber}

                </strong>

            </td>

            <td>

                ${ticket.customerName}

                <br>

                <small style="color:#64748b;">

                    ${ticket.customerEmail}

                </small>

            </td>

            <td>

                <strong>

                    ${ticket.title}

                </strong>

                <br>

                <small style="color:#64748b;">

                    ${ticket.category}

                </small>

            </td>

            <td>

                ${getPriorityBadge(ticket.priority)}

            </td>

            <td>

                ${ticket.status}

            </td>

            <td>

                ${ticket.assignedAgent}

            </td>

            <td class="sla-${sla.status}">

                ${sla.text}

            </td>

        `;

        row.addEventListener("click", () => {

            document
                .querySelectorAll("#ticket-rows tr")
                .forEach(r => r.classList.remove("selected"));

            row.classList.add("selected");

            loadDrawer(ticket.id);

        });

        tbody.appendChild(row);

    });

}
// ======================================
// LOAD TICKET INTO RIGHT DRAWER
// ======================================

function loadDrawer(ticketId) {

    selectedTicket =
        tickets.find(ticket => ticket.id === ticketId);

    if (!selectedTicket) return;

    document
        .getElementById("drawer-default-msg")
        .classList.add("hidden");

    document
        .getElementById("drawer-content")
        .classList.remove("hidden");



    // =====================================
    // BASIC INFORMATION
    // =====================================

    document.getElementById("dw-title").textContent =
        selectedTicket.title;

    document.getElementById("dw-id").textContent =
        selectedTicket.ticketNumber;

    document.getElementById("dw-cust").textContent =
        selectedTicket.customerName;

    document.getElementById("dw-email").textContent =
        selectedTicket.customerEmail;

    document.getElementById("dw-desc").textContent =
        selectedTicket.description;



    // =====================================
    // DROPDOWNS
    // =====================================

    document.getElementById("dw-action-status").value =
        selectedTicket.status;

    document.getElementById("dw-action-agent").value =
        selectedTicket.assignedAgent;



    // =====================================
    // ATTACHMENT
    // =====================================

    const attachmentBlock =
        document.getElementById("dw-attachment-block");

    const attachmentLink =
        document.getElementById("dw-link");

    if (selectedTicket.attachment) {

        attachmentBlock.classList.remove("hidden");

        attachmentLink.href =
            selectedTicket.attachment;

        attachmentLink.target = "_blank";

        attachmentLink.innerHTML =
            "📎 Download Attachment";

    }

    else {

        attachmentBlock.classList.add("hidden");

    }



    // =====================================
    // INTERNAL NOTES
    // =====================================

    const notesBox =
        document.getElementById("dw-notes-log");

    notesBox.innerHTML = "";

    if (

        !selectedTicket.internalNotes ||

        selectedTicket.internalNotes.length === 0

    ) {

        notesBox.innerHTML =

        `<em>No internal notes available.</em>`;

    }

    else {

        selectedTicket.internalNotes.forEach(note => {

            const div =
                document.createElement("div");

            div.className = "note-item";

            div.innerHTML = `

                <small>

                    ${new Date(
                        note.timestamp
                    ).toLocaleString()}

                </small>

                <p>

                    ${note.note}

                </p>

            `;

            notesBox.appendChild(div);

        });

    }
        // =====================================
    // TIMELINE
    // =====================================

    const timelineBox =
        document.getElementById("dw-timeline");

    if (timelineBox) {

        timelineBox.innerHTML = "";

        if (
            !selectedTicket.timeline ||
            selectedTicket.timeline.length === 0
        ) {

            timelineBox.innerHTML =
                "<em>No timeline available.</em>";

        }

        else {

            selectedTicket.timeline
                .slice()
                .reverse()
                .forEach(item => {

                    const div =
                        document.createElement("div");

                    div.className =
                        "timeline-item";

                    div.innerHTML = `

                        <small>

                            ${new Date(
                                item.timestamp
                            ).toLocaleString()}

                        </small>

                        <p>

                            ${item.action}

                        </p>

                    `;

                    timelineBox.appendChild(div);

                });

        }

    }



    // =====================================
    // SLA
    // =====================================

    const sla =
        calculateSLARemaining(

            selectedTicket.createdAt,

            selectedTicket.priority

        );

    let slaColor = "#10b981";

    if (sla.status === "critical") {

        slaColor = "#f59e0b";

    }

    if (sla.status === "expired") {

        slaColor = "#ef4444";

    }



    document.getElementById("dw-title").innerHTML =

    `

        ${selectedTicket.title}

        <span
            style="
                float:right;
                color:${slaColor};
                font-size:13px;
                font-weight:600;
            ">

            ${sla.text}

        </span>

    `;



    // =====================================
    // EXTRA INFORMATION
    // =====================================

    const priorityElement =
        document.getElementById("dw-priority");

    if (priorityElement) {

        priorityElement.innerHTML =
            getPriorityBadge(
                selectedTicket.priority
            );

    }

    const categoryElement =
        document.getElementById("dw-category");

    if (categoryElement) {

        categoryElement.textContent =
            selectedTicket.category;

    }

    const createdElement =
        document.getElementById("dw-created");

    if (
        createdElement &&
        selectedTicket.createdAt
    ) {

        const createdDate =

            selectedTicket.createdAt.toDate

            ?

            selectedTicket.createdAt.toDate()

            :

            new Date(
                selectedTicket.createdAt
            );

        createdElement.textContent =
            createdDate.toLocaleString();

    }

    const updatedElement =
        document.getElementById("dw-updated");

    if (
        updatedElement &&
        selectedTicket.updatedAt
    ) {

        const updatedDate =

            selectedTicket.updatedAt.toDate

            ?

            selectedTicket.updatedAt.toDate()

            :

            new Date(
                selectedTicket.updatedAt
            );

        updatedElement.textContent =
            updatedDate.toLocaleString();

    }

}
// ======================================
// SAVE STATUS / AGENT CHANGES
// ======================================

document
.getElementById("dw-save-btn")
.addEventListener("click", async () => {

    if (!selectedTicket) {

        showToast("No ticket selected.", "error");

        return;

    }

    const newStatus =
        document
        .getElementById("dw-action-status")
        .value;

    const newAgent =
        document
        .getElementById("dw-action-agent")
        .value;

    const timeline =
        selectedTicket.timeline || [];

    const updates = {

        "status.current": newStatus,

        "status.assignedTo": newAgent,

        "timestamps.updatedAt": new Date()

    };



    // =============================
    // STATUS CHANGED
    // =============================

    if (

        selectedTicket.status !== newStatus

    ) {

        timeline.push({

            action:

                `Status changed to ${newStatus}`,

            timestamp:

                new Date().toISOString()

        });

    }



    // =============================
    // AGENT CHANGED
    // =============================

    if (

        selectedTicket.assignedAgent !== newAgent

    ) {

        timeline.push({

            action:

                `Assigned to ${newAgent}`,

            timestamp:

                new Date().toISOString()

        });

    }



    updates.timeline = timeline;



    // =============================
    // RESOLVED
    // =============================

    if (

        newStatus === "Resolved"

        &&

        selectedTicket.status !== "Resolved"

    ) {

        updates["timestamps.resolvedAt"] =
            new Date();

    }
        // =============================
    // UPDATE FIRESTORE
    // =============================

    try {

        await updateDoc(

            doc(
                db,
                "tickets",
                selectedTicket.id
            ),

            updates

        );



        // =============================
        // EMAIL : AGENT ASSIGNED
        // =============================

        if (

            selectedTicket.assignedAgent !== newAgent

        ) {

            await sendTicketNotification(

                "assigned",

                {

                    ticket_id:
                        selectedTicket.ticketNumber,

                    customer_name:
                        selectedTicket.customerName,

                    customer_email:
                        selectedTicket.customerEmail,

                    issue_title:
                        selectedTicket.title,

                    priority:
                        selectedTicket.priority,

                    status:
                        newStatus,

                    agent_name:
                        newAgent

                }

            );

        }



        // =============================
        // EMAIL : RESOLVED
        // =============================

        if (

            newStatus === "Resolved"

            &&

            selectedTicket.status !== "Resolved"

        ) {

            await sendTicketNotification(

                "resolved",

                {

                    ticket_id:
                        selectedTicket.ticketNumber,

                    customer_name:
                        selectedTicket.customerName,

                    customer_email:
                        selectedTicket.customerEmail,

                    issue_title:
                        selectedTicket.title,

                    priority:
                        selectedTicket.priority,

                    status:
                        "Resolved",

                    agent_name:
                        newAgent

                }

            );



            openCSATModal(

                selectedTicket.id

            );

        }



        // =============================
        // SUCCESS
        // =============================

        showToast(

            "✅ Ticket updated successfully."

        );



    }

    catch(error){

        console.error(error);

        showToast(

            "❌ Failed to update ticket.",

            "error"

        );

    }

});
// ======================================
// SUBMIT CSAT
// ======================================

document
.getElementById("csat-submit")
.addEventListener("click", submitRating);

async function submitRating() {

    if (!selectedTicket) {

        showToast(
            "No ticket selected.",
            "error"
        );

        return;

    }

    if (selectedRating === 0) {

        showToast(
            "Please select a rating.",
            "error"
        );

        return;

    }

    const feedback =
        document
        .getElementById("csat-comment")
        .value
        .trim();

    try {

        // ============================
        // SAVE RATING COLLECTION
        // ============================

        await addDoc(

            collection(db, "ratings"),

            {

                ticketId:
                    selectedTicket.ticketNumber,

                ticketDocId:
                    selectedTicket.id,

                customerName:
                    selectedTicket.customerName,

                customerEmail:
                    selectedTicket.customerEmail,

                score:
                    selectedRating,

                feedback,

                createdAt:
                    new Date()

            }

        );



        // ============================
        // UPDATE TICKET
        // ============================

        await updateDoc(

            doc(
                db,
                "tickets",
                selectedTicket.id
            ),

            {

                csatScore:
                    selectedRating,

                csatComment:
                    feedback

            }

        );
                // ============================
        // SUCCESS
        // ============================

        showToast(
            "⭐ Customer feedback saved successfully."
        );

        resetCSAT();

    }

    catch (error) {

        console.error(error);

        showToast(
            "Unable to save customer feedback.",
            "error"
        );

    }

}
// ======================================
// RESET CSAT
// ======================================

function resetCSAT() {

    selectedRating = 0;

    document
        .getElementById("csat-comment")
        .value = "";

    document
        .getElementById("csat-modal")
        .classList.add("hidden");

    document
        .querySelectorAll(".rating-stars span")
        .forEach(star => {

            star.style.opacity = "0.35";

            star.style.transform = "scale(1)";

        });

}
// ======================================
// OPEN CSAT MODAL
// ======================================

function openCSATModal(ticketId) {

    selectedRating = 0;

    document
        .getElementById("csat-comment")
        .value = "";

    document
        .querySelectorAll(".rating-stars span")
        .forEach(star => {

            star.style.opacity = "0.35";

            star.style.transform = "scale(1)";

        });

    document
        .getElementById("csat-target-id")
        .textContent = ticketId;

    document
        .getElementById("csat-modal")
        .classList.remove("hidden");

}