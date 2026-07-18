// ========================================
// Priority Badge
// ========================================

export function getPriorityBadge(priority = "Low") {

    switch (priority.toLowerCase()) {

        case "critical":
            return `<span class="badge badge-critical">🚨 Critical</span>`;

        case "high":
            return `<span class="badge badge-high">🔴 High</span>`;

        case "medium":
            return `<span class="badge badge-medium">🟡 Medium</span>`;

        case "low":
            return `<span class="badge badge-low">🟢 Low</span>`;

        default:
            return `<span class="badge">⚪ Unknown</span>`;
    }

}

// ========================================
// Status Badge
// ========================================

export function getStatusBadge(status = "Open") {

    switch (status.toLowerCase()) {

        case "open":
            return `<span class="badge badge-open">🟢 Open</span>`;

        case "in progress":
            return `<span class="badge badge-progress">🟡 In Progress</span>`;

        case "resolved":
            return `<span class="badge badge-resolved">🔵 Resolved</span>`;

        case "closed":
            return `<span class="badge badge-closed">⚫ Closed</span>`;

        default:
            return `<span class="badge">${status}</span>`;
    }

}



// ========================================
// SLA Remaining
// ========================================

export function calculateSLARemaining(createdTimestamp, priority = "Low") {

    if (!createdTimestamp) {

        return {

            text: "N/A",

            status: "neutral",

            percentage: 0

        };

    }

    const created =
        createdTimestamp.toDate
            ? createdTimestamp.toDate()
            : new Date(createdTimestamp);

    const now = new Date();

    let allowedHours = 24;

    switch (priority.toLowerCase()) {

        case "critical":
            allowedHours = 2;
            break;

        case "high":
            allowedHours = 4;
            break;

        case "medium":
            allowedHours = 8;
            break;

        case "low":
            allowedHours = 24;
            break;

    }

    const deadline =
        new Date(
            created.getTime() +
            allowedHours *
            60 *
            60 *
            1000
        );

    const diff =
        deadline - now;

    if (diff <= 0) {

        return {

            text: "SLA Expired",

            status: "expired",

            percentage: 100

        };

    }

    const hours =
        Math.floor(
            diff /
            (1000 * 60 * 60)
        );

    const mins =
        Math.floor(
            (
                diff %
                (1000 * 60 * 60)
            ) /
            (1000 * 60)
        );

    const elapsed =
        now - created;

    const total =
        allowedHours *
        60 *
        60 *
        1000;

    const percentage =
        Math.min(
            100,
            Math.round(
                (elapsed / total) *
                100
            )
        );

    let status = "good";

    if (percentage >= 75)
        status = "critical";

    else if (percentage >= 50)
        status = "warning";

    return {

        text:
            `${hours}h ${mins}m remaining`,

        status,

        percentage

    };

}



// ========================================
// Ticket Age
// ========================================

export function getTicketAge(createdTimestamp) {

    if (!createdTimestamp)
        return "N/A";

    const created =
        createdTimestamp.toDate
            ? createdTimestamp.toDate()
            : new Date(createdTimestamp);

    const now =
        new Date();

    const diff =
        now - created;

    const days =
        Math.floor(
            diff /
            (1000 * 60 * 60 * 24)
        );

    const hours =
        Math.floor(
            (
                diff %
                (1000 * 60 * 60 * 24)
            ) /
            (1000 * 60 * 60)
        );

    if (days > 0)
        return `${days}d ${hours}h`;

    return `${hours}h`;

}



// ========================================
// Format Date
// ========================================

export function formatDate(timestamp) {

    if (!timestamp)
        return "N/A";

    const date =
        timestamp.toDate
            ? timestamp.toDate()
            : new Date(timestamp);

    return date.toLocaleString(
        undefined,
        {

            dateStyle: "medium",

            timeStyle: "short"

        }
    );

}



// ========================================
// Generate Ticket Number
// ========================================

export function generateTicketNumber() {

    return (
        "TKT-" +
        new Date().getFullYear() +
        "-" +
        Math.floor(
            100000 +
            Math.random() *
            900000
        )
    );

}



// ========================================
// Escape HTML
// ========================================

export function escapeHTML(text = "") {

    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
export function checkEmptyState(tickets) {

    const tbody = document.getElementById("ticket-rows");

    if (!tbody) return;

    if (tickets.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:30px;">
                    📭 No Tickets Available
                </td>
            </tr>
        `;
    }
}
export async function sendTicketNotification(type, data) {

    console.log("Email Notification");

    console.log(type);

    console.log(data);

    return Promise.resolve();

}