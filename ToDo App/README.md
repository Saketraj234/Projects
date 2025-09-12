# 📝 MERN ToDo App

=> Ye ek **ToDo Application** hai jo **MERN Stack (MongoDB, Express, React, Node.js)** ka use karke banaya gaya hai.  
Isme user **tasks add, complete aur delete** kar sakta hai.  
Data localStorage aur MongoDB dono me store ho sakta hai (backend configure hone ke baad).

---

## 🚀 Features
- Add new tasks
- Mark tasks as complete / incomplete
- Delete tasks
- Data persist (localStorage + MongoDB backend)
- Responsive UI (mobile/tablet/desktop)

---

## 🛠 Tech Stack
- **Frontend:** React, CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB, Mongoose

---

## 📂 Project Structure

=> ToDo App/
    │── README.md                 # Project ka documentation
    │
    ├── backend/                  # Node.js + Express + MongoDB server
    │     │── package.json          # Backend dependencies
    │     │── package-lock.json
    │     │── server.js             # Server + API routes
    │     │
    │     └── models/
    │          └── Task.js           # Mongoose schema (task text, completed)
    │
    └── frontend/                 # React frontend (UI)
         │── package.json          # Frontend dependencies
         │── package-lock.json
         │
         └── src/
              │── App.js            # Main React component (Todo logic + UI)
              │── App.css           # Styling for App.js
              │── index.js          # React entry point
              │── index.css         # Global CSS
              │── ... (baaki images/icons agar ho)
