# Notes App

A beautiful animated notes application built with HTML, CSS, JavaScript, Node.js, Express.js, and MongoDB.

## Features

- Create, read, update, and delete notes
- Pin important notes to the top
- Search notes by title or content
- Color-code notes for better organization
- Dark mode support
- Responsive design for all devices
- Beautiful animations and transitions
- MongoDB database for data persistence

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Other**: Font Awesome for icons

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

## Installation

1. Clone the repository

```bash
git clone <repository-url>
cd notes-app
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/notes-app
NODE_ENV=development
```

## Running the Application

1. Start the server

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:5000`

## API Endpoints

- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get a specific note
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note
- `PATCH /api/notes/:id/pin` - Toggle pin status of a note

## Project Structure

```
├── public/               # Static files
│   ├── css/             # CSS stylesheets
│   ├── js/              # Client-side JavaScript
│   ├── favicon.svg      # App favicon
│   └── index.html       # Main HTML file
├── controllers/         # Route controllers
├── models/              # Database models
├── routes/              # API routes
├── .env                 # Environment variables
├── package.json         # Project dependencies
├── README.md            # Project documentation
└── server.js           # Entry point
```

## License

MIT