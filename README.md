# Multi-Warehouse Inventory Management System

## Overview
Enhance the existing Multi-Warehouse Inventory Management System built with Next.js and Material-UI (MUI) for GreenSupply Co, a sustainable product distribution company. The current system is functional but needs significant improvements to be production-ready.

## 🎯 Business Context
GreenSupply Co distributes eco-friendly products across multiple warehouse locations throughout North America. They need to efficiently track inventory across warehouses, manage stock movements, monitor inventory values, and prevent stockouts. This system is critical for their daily operations and customer satisfaction.

## 🛠️ Tech Stack
- [Next.js](https://nextjs.org/) - React framework
- [Material-UI (MUI)](https://mui.com/) - UI component library
- [React](https://reactjs.org/) - JavaScript library
- JSON file storage (for this assessment)

## 📋 Current Features (Already Implemented)
The basic system includes:
- ✅ Products management (CRUD operations)
- ✅ Warehouse management (CRUD operations)
- ✅ Stock level tracking per warehouse
- ✅ Basic dashboard with inventory overview
- ✅ Navigation between pages
- ✅ Data persistence using JSON files

**⚠️ Note:** The current UI is intentionally basic. We want to see YOUR design skills and creativity.

---

## 🚀 Your Tasks (Complete ALL 4)

---

## Task 1: Redesign & Enhance the Dashboard

**Objective:** Transform the basic dashboard into a professional, insightful command center for warehouse operations.

### Requirements:

Redesign the dashboard to provide warehouse managers with actionable insights at a glance. Your implementation should include:

- **Modern, professional UI** appropriate for a sustainable/eco-friendly company
- **Key business metrics** (inventory value, stock levels, warehouse counts, etc.)
- **Data visualizations** using a charting library of your choice
- **Enhanced inventory overview** with improved usability
- **Fully responsive design** that works across all device sizes
- **Proper loading states** and error handling

Focus on creating an interface that balances visual appeal with practical functionality for daily warehouse operations.

---

## Task 2: Implement Stock Transfer System

**Objective:** Build a complete stock transfer workflow with proper business logic, validation, and data integrity.

### Requirements:

**A. Stock Transfer System**

Build a complete stock transfer system that allows moving inventory between warehouses. Your implementation should include:

- Data persistence for transfer records (create `data/transfers.json`)
- API endpoints for creating and retrieving transfers
- Proper validation and error handling
- Stock level updates across warehouses
- Transfer history tracking

Design the data structure, API contracts, and business logic as you see fit for a production system.

**B. Data Integrity**

Transfers must be **atomic** — if the server crashes or an error occurs mid-transfer, neither warehouse should end up with incorrect stock levels. Consider what happens if the process fails after deducting from the source warehouse but before crediting the destination.

Document your approach to ensuring data integrity in code comments or your video walkthrough.

**C. Transfer Page UI**

Create a `/transfers` page that provides:
- A form to initiate stock transfers between warehouses
- Transfer history view
- Appropriate error handling and user feedback

Design the interface to be intuitive for warehouse managers performing daily operations.

---

## Task 3: Build Low Stock Alert & Reorder System

**Objective:** Create a practical system that helps warehouse managers identify and act on low stock situations.

### Requirements:

Build a low stock alert and reorder recommendation system that helps warehouse managers proactively manage inventory levels.

**A. Alert System**
- Identify products that need reordering based on current stock levels and reorder points
- Categorize inventory by stock status (critical, low, adequate, overstocked)
- Provide actionable reorder recommendations with calculated quantities (see below)
- Allow managers to track and update alert status
- Integrate alerts into the main dashboard

**B. Reorder Quantity Calculation**

Don't just flag low stock — calculate a **recommended reorder quantity** for each product. Your formula should factor in:

- Current total stock across all warehouses
- The product's reorder point
- **Transfer velocity** — how quickly stock is moving between warehouses (derived from the transfer history you built in Task 2)
- A **configurable lead time** (in days) representing how long a reorder takes to arrive

Design and document your formula. Explain your assumptions and how you handle edge cases (e.g., new products with no transfer history, zero velocity).

**C. Implementation Details**
- Create an `/alerts` page for viewing and managing alerts
- Calculate stock across all warehouses
- Persist alert tracking data (create `data/alerts.json`)
- Design appropriate status workflows and user actions

Use your judgment to determine appropriate thresholds, calculations, and user workflows for a production inventory management system.

---

## Task 4: Bug Investigation & System Design

**Objective:** Demonstrate debugging ability and architectural thinking.

### A. Bug Hunt

We've received reports from warehouse managers that **inventory values on the dashboard become incorrect after certain product management operations**. The values are fine initially but drift after normal use of the system.

- Investigate the existing codebase to find the root cause
- Document your debugging process (what you checked, how you traced it)
- Fix the bug
- Explain the fix in your video walkthrough

### B. Scaling Write-up

The current system uses JSON file storage and is designed for a small operation. Suppose GreenSupply Co grows to **500 warehouses, 10,000 products, and 50 concurrent users**.

In your README, write 1-2 paragraphs addressing:
- What breaks first in the current architecture?
- How would you evolve this system to handle that scale?
- What specific technologies or patterns would you introduce, and why?

This is not a trick question — we want to understand how you think about systems, not just how you write code.

---

## 📦 Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Screen recording software for video submission (Loom, OBS, QuickTime, etc.)

### Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:3000
```

### Project Structure
```
inventory-management-task/
├── data/                  # JSON data files
├── src/
│   └── pages/            # Next.js pages and API routes
└── package.json
```

The existing codebase includes product, warehouse, and stock management features. Explore the code to understand the current implementation before starting your tasks.

---

## 📝 Submission Requirements

### 1. Code Submission
- Push your code to **your own GitHub repository** (fork or new repo)
- Clear commit history showing your progression
- Update `package.json` with any new dependencies
- Application must run with: `npm install && npm run dev`

### 2. Video Walkthrough (5-10 minutes) - REQUIRED ⚠️

Record a video demonstration covering:

**Feature Demo (4-5 minutes)**
- Redesigned dashboard walkthrough (demonstrate responsiveness)
- Stock transfer workflow (show both successful and error scenarios)
- Alert system functionality and reorder calculations
- Bug investigation: explain how you found and fixed it

**Code Explanation (3-4 minutes)**
- Key technical decisions and approach
- How you ensured transfer atomicity
- Your reorder quantity formula and the reasoning behind it
- Code structure highlights

**Reflection (1-2 minutes)**
- What you're proud of
- Known limitations or trade-offs
- What you'd improve with more time

**Format:** Upload to YouTube (unlisted), Loom, or similar platform. Include link in your README.

### 3. Update This README

Add an implementation summary at the bottom with:
- Your name and completion time
- Features completed
- Key technical decisions
- Known limitations
- Testing instructions
- Video walkthrough link
- Any new dependencies added

---

## ⏰ Timeline

**Deadline:** 3 days (72 hours) from receiving this assignment

Submit:
1. GitHub repository link
2. Video walkthrough link
3. Updated README with implementation notes

**Estimated effort:** 15-18 hours total

**Note:** This timeline reflects real-world project constraints. Manage your time effectively and prioritize core functionality over bonus features.

---

## 🏆 Optional Enhancements

If you have extra time, consider adding:
- Live deployment (Vercel/Netlify)
- Dark mode
- Export functionality (CSV/PDF)
- Keyboard shortcuts
- Advanced filtering
- Accessibility features
- Unit tests
- TypeScript
- Additional features you think add value

**Important:** Complete all 4 core tasks before attempting bonuses. Quality of required features matters more than quantity of extras.

---

## 🤔 Frequently Asked Questions

**Q: Can I use additional libraries?**
A: Yes! Add them to package.json and document your reasoning.

**Q: What if I encounter technical blockers?**
A: Document the issue, explain what you tried, and move forward with the next task. Include this in your video explanation.

**Q: Can I modify the existing data structure?**
A: You can add fields, but don't break the existing structure that other features depend on.

**Q: What if I can't complete everything?**
A: Submit what you have with clear documentation. Quality over quantity.

**Q: How will my submission be used?**
A: This is solely for technical assessment. Your code will not be used commercially.

---

## 🧠 What We're Looking For

This assessment goes beyond "can you build features." We're evaluating:

- **Reasoning over output** — We care more about *why* you made a decision than how much code you wrote. A well-reasoned formula with clear documentation beats a complex implementation you can't explain.
- **Debugging ability** — Can you trace through unfamiliar code, form a hypothesis, and verify it?
- **Data integrity thinking** — Do you consider what happens when things go wrong, not just when they go right?
- **Architectural awareness** — Do you understand the system you're building on, including its limitations?
- **Clean, maintainable code** — Professional structure, proper error handling, good naming.
- **Communication** — Your video and written documentation should be clear and well-organized.

You are welcome to use any tools you like, including AI assistants. We are evaluating the quality of your *decisions and understanding*, not whether you typed every character yourself.

---

## 🚀 Final Notes

Do your best work, document your decisions, and show us how you think — not just what you can build.

Good luck! 💪

---

**Setup issues?** Verify Node.js is installed and you're using a modern browser. If problems persist, document them in your submission.
