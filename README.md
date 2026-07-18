# Customer Support Ticketing System

A responsive web-based Customer Support Ticketing System that enables customers to submit support requests and allows support agents to efficiently manage, track, and resolve tickets. The application features real-time ticket management, SLA monitoring, analytics, customer satisfaction feedback, and a searchable knowledge base.

#vercel
vercel-https://customer-support-system-ochre.vercel.app/
## Features

- Customer ticket submission with issue details and file attachments
- Real-time ticket management using Firebase Firestore
- Agent dashboard with ticket filtering and search
- Ticket assignment and status management
- Internal notes and activity timeline
- SLA tracking based on ticket priority
- Email notifications using EmailJS
- Analytics dashboard with ticket insights
- Customer Satisfaction (CSAT) rating after ticket resolution
- Searchable Knowledge Base for common issues
- Responsive UI with Light/Dark mode

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6)
- Firebase Firestore
- Firebase Storage
- EmailJS
- Vercel

## Project Structure

```
customer-support-system/
│── assets/
│── css/
│── js/
│── index.html
│── dashboard.html
│── analytics.html
│── knowledge.html
│── firebase.js
│── README.md
```

## Installation

1. Clone the repository

```bash
git clone https://github.com/your-username/customer-support-system.git
```

2. Navigate to the project

```bash
cd customer-support-system
```

3. Configure Firebase

- Create a Firebase project
- Enable Firestore Database
- Enable Firebase Storage
- Update Firebase configuration in `firebase.js`

4. Configure EmailJS

- Create an EmailJS account
- Add Email Service
- Create required email templates
- Update Service ID, Template IDs, and Public Key

5. Run the project

Open `index.html` using Live Server or deploy using Vercel.

## Usage

1. Submit a support ticket.
2. Ticket is stored in Firebase.
3. Support agents manage tickets from the dashboard.
4. Customers receive email notifications.
5. Analytics update automatically.
6. Customers submit satisfaction ratings after resolution.

## Deployment

The project is deployed using **Vercel**.

## Author

**Manyam Geetha Sree**
