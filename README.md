# SecureAuth – Password-less Authentication System

SecureAuth is a **modern, password-less authentication system** built with **React** for the frontend and **Node.js/Express** for the backend. Users can log in **securely via magic links** sent through email, eliminating the need for passwords while maintaining strong security.

## 🚀 Features

- Password-less login using **temporary magic links**
- Token-based authentication with **10-minute expiration**
- **Rate-limiting & anti-spam** to prevent abuse
- Secure, professional **email notifications**
- Dynamic React frontend: email input, confirmation, verification, dashboard
- **Mobile-responsive** UI with modern gradient styling
- Session validation using **local storage** and **token verification**

## 🧱 Tech Stack

- **Frontend:** React (functional components, hooks)
- **Backend:** Node.js, Express
- **Email:** Nodemailer (SMTP Gmail integration)
- **Token Management:** Crypto for secure random token generation
- **Security:** SSL-ready, no passwords stored, token expiry handling

## ⚙️ Getting Started

### Prerequisites

- Node.js v14+
- npm or yarn
- Gmail account for SMTP (or any SMTP provider)

### Installation

Clone the repository:

```bash

git clone <your-repo-url>
cd simple-react-full-stack

```

### Install dependencies for backend and frontend:

`bash npm install`

## Environment Variables

Create a `.env` file at project root with:

```
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
PORT=8080
TOKEN_EXPIRY_MINUTES=10

```
Note: Use an App Password for Gmail to avoid authentication issues.
Running the App
`bash npm start`
The frontend will be served via React build in dist/.
Backend API endpoints:

```bash
POST /api/send-magic-link – send login link
GET /api/verify-token – verify token from link
```

Open http://localhost:8080 to access the app.
## 💻 Usage
- Enter your email in the input field.
- Click Continue with Magic Link.
- Check your email for a SecureAuth magic link.
- Click the link to log in.
- Upon successful verification, the dashboard will display your session info.

Supports **resending links, using a different email, and logging out**.
## 🔒 Security Considerations
- Magic links expire after 10 minutes
- Each token is single-use
- **Rate limiting** prevents abuse (max 3 requests within 10 minutes)
- No passwords are stored; authentication relies solely on **token validation**
- Emails include **SSL and encryption badges** for user reassurance

## 📁 Project Structure
```bash

simple-react-full-stack/
├── dist/                 # React build output
├── src/
│   ├── client/           # React components
│   └── server/           # Express server & API logic
├── package.json
└── README.md

```

App.js – main React component with all UI states
server/index.js – Express backend with email sending & token verification

## 🔮 Future Enhancements

- Add OAuth login (Google, GitHub)
- Store sessions in a database for persistence
- Add JWT authentication for secure API access
- Deploy to production server with HTTPS

## 📄 License

MIT License © 2025 SecureAuth
