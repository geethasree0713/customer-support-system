// ========================================
// EmailJS Configuration
// ========================================
import emailjs from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm";
const EMAIL_CONFIG = {

    PUBLIC_KEY: "RxEPW_JYyHeTFV5Qe",

    SERVICE_ID: "service_st3f49j",

    // Used for Created + Assigned emails
    TEMPLATE_TICKET: "template_ctv7ulq",

    // Used for Resolved emails
    TEMPLATE_RESOLVED: "template_5thaiew"

};


// ========================================
// Initialize EmailJS
// ========================================

(function () {

    emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);

})();



// ========================================
// Send Email Notification
// ========================================

export async function sendTicketNotification(type, data) {

    let templateID = "";


    switch (type.toLowerCase()) {


        // Same template for created and assigned

        case "created":

        case "assigned":

            templateID = EMAIL_CONFIG.TEMPLATE_TICKET;

            break;



        // Separate template for resolved

        case "resolved":

            templateID = EMAIL_CONFIG.TEMPLATE_RESOLVED;

            break;



        default:

            console.error("Unknown email type.");

            return false;

    }



    try {


        const response = await emailjs.send(

            EMAIL_CONFIG.SERVICE_ID,

            templateID,

            data

        );


        console.log("✅ Email Sent Successfully");

        console.log(response);


        return true;


    }


    catch (error) {


        console.error("❌ Email Sending Failed");

        console.error(error);


        return false;

    }

}



// ========================================
// Ticket Created Email
// ========================================

export function sendCreatedEmail(ticket) {


    return sendTicketNotification("created", {


        ticket_id: ticket.id,

        customer_name: ticket.customerName,

        customer_email: ticket.customerEmail,

        issue_title: ticket.title,

        priority: ticket.priority,

        status: "Created",

        agent_name: "Not Assigned"


    });


}




// ========================================
// Ticket Assigned Email
// ========================================

export function sendAssignedEmail(ticket) {


    return sendTicketNotification("assigned", {


        ticket_id: ticket.id,

        customer_name: ticket.customerName,

        customer_email: ticket.customerEmail,

        issue_title: ticket.title,

        priority: ticket.priority,

        status: "Assigned",

        agent_name: ticket.assignedAgent


    });


}





// ========================================
// Ticket Resolved Email
// ========================================

export function sendResolvedEmail(ticket) {


    return sendTicketNotification("resolved", {


        ticket_id: ticket.id,

        customer_name: ticket.customerName,

        customer_email: ticket.customerEmail,

        issue_title: ticket.title,

        status: "Resolved"


    });


}