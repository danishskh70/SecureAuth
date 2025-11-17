require('dotenv').config();
const path = require("path");
const express = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// --- Token logic --- (API routes first)
const tokens = new Map();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
});
app.post("/api/send-magic-link", async (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(32).toString("hex");
  const link = `http://localhost:8080/?token=${token}`;
  tokens.set(token, { email, expires: Date.now() + 10 * 60 * 1000 }); // 10 min

  // Professional HTML email matching React UI
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Magic Login Link - SecureAuth</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .email-container {
      max-width: 500px;
      width: 100%;
      margin: 20px;
    }
    
    .email-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    
    .logo {
      font-size: 3rem;
      margin-bottom: 15px;
    }
    
    .header {
      margin-bottom: 30px;
    }
    
    h1 {
      color: #2d3748;
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 8px 0;
    }
    
    .subtitle {
      color: #718096;
      font-size: 1rem;
      margin: 0;
    }
    
    .content {
      margin: 30px 0;
    }
    
    .welcome-text {
      color: #4a5568;
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 25px;
    }
    
    .magic-button {
      display: inline-block;
      padding: 16px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      margin: 15px 0;
    }
    
    .magic-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    
    .expiry-notice {
      background: #f7fafc;
      padding: 15px;
      border-radius: 12px;
      margin: 25px 0;
      border-left: 4px solid #0ebeff;
    }
    
    .expiry-text {
      color: #4a5568;
      font-size: 0.9rem;
      margin: 0;
      font-weight: 500;
    }
    
    .security-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin: 20px 0;
      padding: 15px;
      background: #f0fff4;
      border-radius: 12px;
      border: 1px solid #9ae6b4;
    }
    
    .security-icon {
      font-size: 1.2rem;
    }
    
    .security-text {
      color: #276749;
      font-size: 0.85rem;
      font-weight: 500;
      margin: 0;
    }
    
    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 30px 0;
    }
    
    .footer {
      margin-top: 30px;
    }
    
    .help-text {
      color: #718096;
      font-size: 0.8rem;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    
    .footer-links {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 20px;
    }
    
    .footer-link {
      color: #667eea;
      text-decoration: none;
      font-size: 0.8rem;
      transition: color 0.2s ease;
    }
    
    .footer-link:hover {
      color: #764ba2;
    }
    
    .copyright {
      color: #a0aec0;
      font-size: 0.75rem;
      margin-top: 25px;
    }
    
    @media (max-width: 600px) {
      .email-card {
        margin: 10px;
        padding: 30px 20px;
      }
      
      h1 {
        font-size: 1.6rem;
      }
      
      .magic-button {
        padding: 14px 28px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-card">
      <!-- Header -->
      <div class="header">
        <div class="logo">🔐</div>
        <h1>SecureAuth</h1>
        <p class="subtitle">Password-less Authentication</p>
      </div>
      
      <!-- Content -->
      <div class="content">
        <p class="welcome-text">
          Hello there!<br>
          We've received a request to sign in to your SecureAuth account.
        </p>
        
        <a href="${link}" class="magic-button">
          Sign In Securely
        </a>
        
        <div class="expiry-notice">
          <p class="expiry-text">
            <strong>⚠️ This link expires in 10 minutes</strong><br>
            For security reasons, this magic link will become invalid after the expiration time.
          </p>
        </div>
        
        <div class="security-info">
          <span class="security-icon">🔒</span>
          <p class="security-text">
            SSL Secured • No Password Required • Encrypted Connection
          </p>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <!-- Footer -->
      <div class="footer">
        <p class="help-text">
          If you didn't request this email, you can safely ignore it. Your account remains secure.
        </p>
        
        <div class="footer-links">
          <a href="#" class="footer-link">Help Center</a>
          <a href="#" class="footer-link">Privacy Policy</a>
          <a href="#" class="footer-link">Terms of Service</a>
        </div>
        
        <p class="copyright">
          © ${new Date().getFullYear()} SecureAuth. All rights reserved.<br>
          This email was sent to ${email}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  // Plain text fallback
  const text = `
SecureAuth - Password-less Login

Hello there!

We've received a request to sign in to your SecureAuth account.

Click the link below to sign in securely:
${link}

⚠️ This link expires in 10 minutes. For security reasons, this magic link will become invalid after the expiration time.

If you didn't request this email, you can safely ignore it. Your account remains secure.

🔒 SSL Secured • No Password Required • Encrypted Connection

© ${new Date().getFullYear()} SecureAuth. All rights reserved.
This email was sent to ${email}
  `;

  try {
    await transporter.sendMail({
      to: email,
      subject: "🔑 Your Secure Magic Login Link - Expires in 10 minutes",
      html,
      text,
      from: '"SecureAuth" <noreply@secureauth.com>',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    });
    
    console.log(`Magic link sent to: ${email}`);
    res.json({ sent: true, message: "Magic link sent successfully" });
    
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ 
      sent: false, 
      error: "Failed to send magic link",
      details: err.message 
    });
  }
});


app.get("/api/verify-token", (req, res) => {
  const token = req.query.token;
  const record = tokens.get(token);
  if (!record || record.expires < Date.now()) {
    tokens.delete(token);
    return res.json({ valid: false });
  }
  tokens.delete(token);
  res.json({ valid: true, email: record.email });
});

// --- Serve frontend build ---
app.use(express.static(path.join(__dirname, "../../dist")));

// --- React Router fallback ---
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../dist/index.html"));
});

app.listen(8080, () => console.log("Server running on http://localhost:8080"));
