// ======================================================
// ANALYTICS.JS
// PART 1
// ======================================================

import { db } from "./firebase.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Theme Code Here
const savedTheme = localStorage.getItem("theme") || "light";

document.documentElement.setAttribute("data-theme", savedTheme);

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



let priorityChart = null;
let lifecycleChart = null;
function calculateAverageResolutionTime(tickets){

    let totalTime = 0;

    let count = 0;


    tickets.forEach(ticket=>{


        if(
            ticket.timestamps?.createdAt &&
            ticket.timestamps?.resolvedAt
        ){


            const created =

                ticket.timestamps.createdAt.toDate

                ?

                ticket.timestamps.createdAt.toDate()

                :

                new Date(
                    ticket.timestamps.createdAt
                );



            const resolved =

                ticket.timestamps.resolvedAt.toDate

                ?

                ticket.timestamps.resolvedAt.toDate()

                :

                new Date(
                    ticket.timestamps.resolvedAt
                );



            totalTime +=

                resolved - created;


            count++;


        }


    });



    if(count === 0){


        updateCard(

            "kpi-art",

            "N/A"

        );


        return;

    }



    const averageHours =

        totalTime /

        (1000 * 60 * 60) /

        count;



    updateCard(

        "kpi-art",

        averageHours.toFixed(1) + " hrs"

    );

}
/* ============================================
   Initialize Analytics Dashboard
============================================ */

window.addEventListener("DOMContentLoaded", () => {

    loadAnalytics();

});

/* ============================================
   Main Loader
============================================ */

async function loadAnalytics() {

    try {

        showLoading();

        const ticketsSnapshot =
            await getDocs(collection(db, "tickets"));

        const ratingsSnapshot =
            await getDocs(collection(db, "ratings"));

        const tickets = [];
        const ratings = [];

        ticketsSnapshot.forEach(doc => {

            tickets.push({

                id: doc.id,

                ...doc.data()

            });

        });

        ratingsSnapshot.forEach(doc => {

            ratings.push(doc.data());

        });

        calculateKPIs(tickets, ratings);

        generateCharts(tickets);

    }

    catch (error) {

        console.error(error);

        showError(error.message);

    }

}

/* ============================================
   Loading
============================================ */

function showLoading() {

    document.getElementById("kpi-total").innerHTML = "...";

    document.getElementById("kpi-active").innerHTML = "...";

    document.getElementById("kpi-resolved").innerHTML = "...";

    document.getElementById("kpi-art").innerHTML = "...";

    document.getElementById("kpi-csat").innerHTML = "...";

}

/* ============================================
   Error
============================================ */

function showError(message){

    console.error(message);

    document.getElementById("kpi-total").innerHTML="Error";

}
function updateCard(id, value) {

    const element = document.getElementById(id);

    if (!element) return;

    element.textContent = value;

}
/* ============================================
   KPI Calculator
============================================ */
function calculateKPIs(tickets, ratings){

    const totalTickets = tickets.length;


    const activeTickets = tickets.filter(

        ticket => 
        ticket.status?.current !== "Resolved"

    ).length;


    const resolvedTickets = tickets.filter(

        ticket =>
        ticket.status?.current === "Resolved"

    ).length;


    updateCard(
        "kpi-total",
        totalTickets
    );


    updateCard(
        "kpi-active",
        activeTickets
    );


    updateCard(
        "kpi-resolved",
        resolvedTickets
    );


    calculateAverageResolutionTime(
        tickets
    );


    calculateCSAT(
        ratings
    );

}

/* ============================================
   Customer Satisfaction
============================================ */

function calculateCSAT(ratings){

    if(ratings.length===0){

        updateCard(

            "kpi-csat",

            "N/A"

        );

        return;

    }

    const average=

        ratings.reduce(

            (sum,item)=>

            sum+item.score,

            0

        )/

        ratings.length;

    updateCard(

        "kpi-csat",

        average.toFixed(1)+" ⭐"

    );

}
/* ============================================
   Generate Charts
============================================ */

function generateCharts(tickets){

    const priorityData = {

        High:0,

        Medium:0,

        Low:0

    };


    const statusData = {

        Open:0,

        "In Progress":0,

        Resolved:0

    };



    tickets.forEach(ticket=>{


        // Priority count

        if(
            priorityData.hasOwnProperty(ticket.priority)
        ){

            priorityData[ticket.priority]++;

        }



        // Status count

        const status =

            ticket.status?.current || "Open";



        if(
            statusData.hasOwnProperty(status)
        ){

            statusData[status]++;

        }


    });



    createPriorityChart(priorityData);


    createStatusChart(statusData);


}
/* ============================================
   Priority Chart
============================================ */

function createPriorityChart(priority){

    if(priorityChart){
        priorityChart.destroy();
    }

    priorityChart=new Chart(

        document.getElementById("chart-priority"),

        {

            type:"bar",

            data:{

                labels:["High","Medium","Low"],

                datasets:[{

                    label:"Tickets",

                    data:[

                        priority.High,

                        priority.Medium,

                        priority.Low

                    ],

                    backgroundColor:[

                        "#ef4444",

                        "#f59e0b",

                        "#10b981"

                    ],

                    borderRadius:10,

                    borderWidth:0

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false,

                plugins:{

                    legend:{

                        display:false

                    },

                    tooltip:{

                        backgroundColor:"#1e293b",

                        titleColor:"#fff",

                        bodyColor:"#fff"

                    }

                },

                scales:{

                    y:{

                        beginAtZero:true,

                        ticks:{

                            precision:0

                        }

                    }

                }

            }

        }

    );

}

/* ============================================
   Status Chart
============================================ */

function createStatusChart(status){

    if(lifecycleChart){
        lifecycleChart.destroy();
    }

    lifecycleChart=new Chart(

        document.getElementById("chart-lifecycle"),

        {

            type:"doughnut",

            data:{

                labels:[

                    "Open",

                    "In Progress",

                    "Resolved"

                ],

                datasets:[{

                    data:[

                        status.Open,

                        status["In Progress"],

                        status.Resolved

                    ],

                    backgroundColor:[

                        "#3b82f6",

                        "#6366f1",

                        "#10b981"

                    ],

                    hoverOffset:10

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false,

                cutout:"60%",

                plugins:{

                    legend:{

                        position:"bottom"

                    },

                    tooltip:{

                        backgroundColor:"#1e293b",

                        titleColor:"#fff",

                        bodyColor:"#fff"

                    }

                }

            }

        }

    );

}

/* ============================================
   Refresh Analytics
============================================ */

async function refreshAnalytics(){

    await loadAnalytics();

}

/* ============================================
   Auto Refresh Every Minute
============================================ */

setInterval(()=>{

    refreshAnalytics();

},60000);

