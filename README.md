# FBLA Website Coding and Development - WHHS Digital Lost and Found

A comprehensive full-stack lost and found platform specifically designed to digitize and streamline the lost and found process at Walnut Hills High School. This project was developed for the FBLA 2025-26 Website Coding and Development competition.

---

## Project Overview

The FBLA Lost and Found platform addresses the inefficiencies of traditional lost and found systems by providing a centralized digital solution. Students can report lost items, browse found items, submit claims, and earn credits for returning items. The platform features a credits-based rewards system to incentivize community engagement and responsible item returns.

**Note:** The frontend is built off my previous project displaying the computer science classes at my school. This approach enabled me to focus on project-based learning of backend development, spending more time working with APIs, database management, and server-side logic.

---

## FBLA Competition Context

This project was created for the FBLA 2025-26 Website Coding and Development event, focusing on:

- A home page with clear layout and navigation menu
- A submission form for reporting found items with photo upload capability
- A searchable listing of all found items
- A claim/inquiry form for students to request information about or claim items
- A backend system and admin view to review, approve, and manage item postings

**Competition Resources:**
- [Full Rubric](https://www.fbla.org/competitive-events/website-coding-development/)
- [Project Script](https://docs.google.com/document/d/1YQ2jPIj2uP7jZfQi2Du8O4SvgM8_Dn1hM6OfC6A6h78/edit?usp=sharing)

---

## Features

### Core Features

- **Item Reporting:** Users can submit lost or found items with descriptions, locations, dates, and photo uploads
- **Advanced Search & Filtering:** Powerful search system to help students find their lost items quickly
- **Claims Management:** Track claims for items with status workflow (pending/approved/denied)
- **Credits System:** Students earn credits for returning found items, redeemable in a virtual rewards shop
- **Admin Panel:** Comprehensive backend system for reviewing, approving, and managing all item postings
- **Email Notifications:** Automated email alerts using Resend for claim updates and status changes
- **Image Optimization:** Automatic image compression using Sharp for efficient storage and loading

### Advanced Features

- **User Authentication:** Secure registration and login system with session management
- **Contact System:** Built-in messaging for communication between finders and claimants
- **Pending Items Queue:** Admin workflow for reviewing submissions before they go live
- **Purchase System:** Virtual store where students can redeem earned credits for rewards
- **Responsive Design:** Mobile-first approach ensuring accessibility across all devices
- **File Management:** Secure file upload system using Multer middleware

---

## Tech Stack

### Frontend

- **HTML5/CSS3** for structure and styling
- **JavaScript (ES6+)** for interactivity and dynamic content
- **Responsive Design** for mobile and desktop compatibility

### Backend

- **Node.js** runtime environment
- **Express.js** web application framework
- **MongoDB** NoSQL database for flexible data storage
- **Multer** middleware for handling multipart/form-data and file uploads
- **Resend** email service for automated notifications
- **Sharp** image processing library for compression and optimization
- **Express-session** for session management

---

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm (comes with Node.js)
- Git (for version control)

---

## Folder Structure

```
FBLA - Lost and Found/
├── Backend/
│   ├── config/
│   │   ├── database.js
│   │   ├── multer.js
│   │   └── session.js
│   ├── helpers/
│   │   ├── emailHelper.js
│   │   └── fileHelpers.js
│   ├── models/
│   │   ├── ClaimedItem.js
│   │   ├── ContactAnswered.js
│   │   ├── ContactWaiting.js
│   │   ├── Item.js
│   │   ├── ItemClaim.js
│   │   ├── LostItem.js
│   │   ├── Pending.js
│   │   ├── Purchase.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── claims.js
│   │   ├── contact.js
│   │   ├── items.js
│   │   ├── purchases.js
│   │   └── user.js
│   └── server.js
├── Frontend/
│   ├── External/
│   │   ├── CSS/
│   │   └── js/
│   ├── HTML/
│   └── Images/
├── uploads/
├── node_modules/
├── .gitignore
├── emailTemplates.js
├── package-lock.json
├── package.json
└── README.md
```

---

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/alex-hou-09/FBLA-Website-Coding-and-Development-2026.git
```

2. Navigate into the project folder:
```bash
cd FBLA-Website-Coding-and-Development-2026
```
3. Navigate into the Backend folder:
```bash
cd Backend
```

4. Install dependencies:
```bash
npm install
```

5. Start the server:
```bash
node server.js
```

6. Open a browser and go to:
```
http://localhost:3000
```

---

## Usage Guide

### For Students

1. **Report a Lost Item:**
   - Navigate to the "Report Lost" page
   - Fill out the item description form
   - Add relevant details (location, date, description)
   - Submit for admin review

2. **Report a Found Item:**
   - Navigate to the "Report Found" page
   - Upload photos of the item using the file upload form
   - Provide details about where and when it was found
   - Submit for admin approval

3. **Search for Items:**
   - Use the search page to browse all approved items
   - Filter by category, location, or date
   - View detailed item information and photos

4. **Submit a Claim:**
   - Find your lost item in the listing
   - Click "Claim This Item"
   - Provide verification details
   - Wait for admin approval

5. **Earn & Redeem Credits:**
   - Earn credits by returning items
   - Visit the rewards shop
   - Browse available rewards
   - Redeem credits for desired items

### For Administrators

1. **Review Pending Items:**
   - Access the admin panel
   - View all pending item submissions
   - Review photos and descriptions
   - Approve or deny based on guidelines

2. **Manage Claims:**
   - Review incoming claim requests
   - Verify claimant information
   - Approve legitimate claims
   - Notify both parties via email

3. **Monitor System:**
   - Track active items and claims
   - Manage user accounts
   - Respond to contact requests
   - Oversee credits distribution

---

### Topics
`nodejs` `express` `mongodb` `fbla` `lost-and-found` `resend` `multer` `sharp`

### Languages
- JavaScript: 65.0%
- HTML: 25.0%
- CSS: 10.0%
