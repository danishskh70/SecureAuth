import React, { useState, useEffect } from "react";

export default function App() {
  const [mode, setMode] = useState("email");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [resendCount, setResendCount] = useState(0);
  const [lastSentTime, setLastSentTime] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      setMode("verify");
      verifyToken(token);
    }

    // Check for existing session
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        const res = await fetch("http://localhost:8080/api/validate-session", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setMode("authenticated");
        }
      }
    } catch (err) {
      localStorage.removeItem("auth_token");
    }
  };

  const sendMagicLink = async () => {
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Rate limiting
    if (resendCount >= 3) {
      setError("Too many attempts. Please try again in 10 minutes.");
      return;
    }

    if (lastSentTime && Date.now() - lastSentTime < 30000) {
      setError("Please wait 30 seconds before requesting another link");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/send-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMode("sent");
        setResendCount(prev => prev + 1);
        setLastSentTime(Date.now());
      } else {
        setError(data.message || "Failed to send magic link");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async (token) => {
    setLoading(true);
    
    try {
      const res = await fetch(`http://localhost:8080/api/verify-token?token=${token}`);
      const data = await res.json();

      if (data.valid) {
        localStorage.setItem("auth_token", data.token);
        setUser({ email: data.email, name: data.name });
        setStatus(`Welcome back, ${data.name || data.email}!`);
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        setStatus("Invalid or expired link. Please request a new one.");
      }
    } catch (err) {
      setStatus("Verification failed. Please try again.");
    } finally {
      setLoading(false);
      setMode("result");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    setEmail("");
    setMode("email");
    setStatus("");
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleResend = () => {
    setMode("email");
    setError("");
  };

  const handleUseDifferentEmail = () => {
    setMode("email");
    setEmail("");
    setError("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header with Logo */}
        <div style={styles.header}>
          <div style={styles.logo}>🔐</div>
          <h1 style={styles.h1}>SecureAuth</h1>
          <p style={styles.subtitle}>Password-less Authentication</p>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div style={styles.loadingOverlay}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>
              {mode === "verify" ? "Verifying your identity..." : "Sending magic link..."}
            </p>
          </div>
        )}

        {/* Email Input Mode */}
        {mode === "email" && (
          <>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                style={{
                  ...styles.input,
                  ...(error ? styles.inputError : {})
                }}
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onKeyPress={(e) => e.key === 'Enter' && sendMagicLink()}
              />
              {error && <p style={styles.errorText}>{error}</p>}
            </div>

            <button 
              style={styles.button} 
              onClick={sendMagicLink}
              disabled={loading}
            >
              {loading ? "Sending..." : "Continue with Magic Link"}
            </button>

            <div style={styles.divider}>
              <span style={styles.dividerText}>or continue with</span>
            </div>

            <div style={styles.socialButtons}>
              <button style={styles.socialButton}>
                <span style={styles.socialIcon}>🔵</span>
                Google
              </button>
              <button style={styles.socialButton}>
                <span style={styles.socialIcon}>⚫</span>
                GitHub
              </button>
            </div>

            <p style={styles.footerText}>
              By continuing, you agree to our <a href="#" style={styles.link}>Terms</a> and <a href="#" style={styles.link}>Privacy Policy</a>
            </p>
          </>
        )}

        {/* Link Sent Mode */}
        {mode === "sent" && (
          <div style={styles.sentContainer}>
            <div style={styles.successIcon}>✉️</div>
            <h2 style={styles.h2}>Check your email</h2>
            <p style={styles.sentText}>
              We sent a magic link to <strong>{email}</strong>
            </p>
            <p style={styles.helpText}>
              Click the link in the email to sign in. The link will expire in 15 minutes.
            </p>
            <div style={styles.actionButtons}>
              <button style={styles.secondaryButton} onClick={handleResend}>
                Resend Link
              </button>
              <button style={styles.textButton} onClick={handleUseDifferentEmail}>
                Use different email
              </button>
            </div>
          </div>
        )}

        {/* Verification Mode */}
        {mode === "verify" && (
          <div style={styles.verifyContainer}>
            <div style={styles.spinner}></div>
            <h2 style={styles.h2}>Verifying your identity</h2>
            <p style={styles.helpText}>Please wait while we secure your login...</p>
          </div>
        )}

        {/* Result Mode */}
        {mode === "result" && (
          <div style={styles.resultContainer}>
            <div style={status.includes("Welcome") ? styles.successIcon : styles.errorIcon}>
              {status.includes("Welcome") ? "✅" : "❌"}
            </div>
            <h2 style={styles.h2}>{status}</h2>
            {status.includes("Welcome") ? (
              <button style={styles.button} onClick={() => setMode("authenticated")}>
                Continue to Dashboard
              </button>
            ) : (
              <button style={styles.button} onClick={handleUseDifferentEmail}>
                Try Again
              </button>
            )}
          </div>
        )}

        {/* Authenticated Mode */}
        {mode === "authenticated" && user && (
          <div style={styles.authenticatedContainer}>
            <div style={styles.successIcon}>🎉</div>
            <h2 style={styles.h2}>Authentication Successful!</h2>
            <div style={styles.userCard}>
              <div style={styles.avatar}>
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div style={styles.userInfo}>
                <h3 style={styles.userName}>{user.name || "User"}</h3>
                <p style={styles.userEmail}>{user.email}</p>
              </div>
            </div>
            <div style={styles.stats}>
              <div style={styles.stat}>
                <div style={styles.statNumber}>1</div>
                <div style={styles.statLabel}>Active Session</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statNumber}>100%</div>
                <div style={styles.statLabel}>Secure</div>
              </div>
            </div>
            <button style={styles.logoutButton} onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Security Badge */}
      <div style={styles.securityBadge}>
        <span style={styles.lockIcon}>🔒</span>
        SSL Secured • Password-less Auth
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: "20px",
  },
  card: {
    background: "rgba(255, 255, 255, 0.95)",
    color: "#333",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "440px",
    position: "relative",
    backdropFilter: "blur(10px)",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  logo: {
    fontSize: "3rem",
    marginBottom: "10px",
  },
  h1: {
    fontSize: "2rem",
    fontWeight: "700",
    margin: "0 0 5px 0",
    color: "#2d3748",
  },
  subtitle: {
    color: "#718096",
    margin: "0",
    fontSize: "0.9rem",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#4a5568",
    fontSize: "0.9rem",
  },
  input: {
    padding: "15px",
    width: "100%",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    fontSize: "16px",
    transition: "all 0.2s",
    boxSizing: "border-box",
  },
  inputError: {
    borderColor: "#fc8181",
  },
  errorText: {
    color: "#e53e3e",
    fontSize: "0.875rem",
    margin: "8px 0 0 0",
  },
  button: {
    padding: "15px",
    width: "100%",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "16px",
    transition: "all 0.2s",
    marginBottom: "20px",
  },
  secondaryButton: {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "2px solid #e2e8f0",
    background: "transparent",
    color: "#4a5568",
    cursor: "pointer",
    fontWeight: "600",
    marginRight: "10px",
  },
  textButton: {
    padding: "12px 16px",
    border: "none",
    background: "transparent",
    color: "#667eea",
    cursor: "pointer",
    fontWeight: "600",
  },
  logoutButton: {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "2px solid #e53e3e",
    background: "transparent",
    color: "#e53e3e",
    cursor: "pointer",
    fontWeight: "600",
    width: "100%",
    marginTop: "20px",
  },
  divider: {
    position: "relative",
    textAlign: "center",
    margin: "25px 0",
    color: "#a0aec0",
  },
  dividerText: {
    background: "rgba(255, 255, 255, 0.95)",
    padding: "0 15px",
    fontSize: "0.875rem",
  },
  socialButtons: {
    display: "flex",
    gap: "12px",
    marginBottom: "25px",
  },
  socialButton: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "2px solid #e2e8f0",
    background: "transparent",
    cursor: "pointer",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  socialIcon: {
    fontSize: "1.2rem",
  },
  footerText: {
    textAlign: "center",
    color: "#718096",
    fontSize: "0.8rem",
    lineHeight: "1.4",
  },
  link: {
    color: "#667eea",
    textDecoration: "none",
  },
  sentContainer: {
    textAlign: "center",
  },
  successIcon: {
    fontSize: "4rem",
    marginBottom: "20px",
  },
  errorIcon: {
    fontSize: "4rem",
    marginBottom: "20px",
  },
  h2: {
    fontSize: "1.5rem",
    fontWeight: "600",
    margin: "0 0 15px 0",
    color: "#2d3748",
  },
  sentText: {
    color: "#4a5568",
    marginBottom: "15px",
  },
  helpText: {
    color: "#718096",
    fontSize: "0.9rem",
    lineHeight: "1.5",
    marginBottom: "25px",
  },
  actionButtons: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
  },
  verifyContainer: {
    textAlign: "center",
    padding: "40px 0",
  },
  resultContainer: {
    textAlign: "center",
  },
  authenticatedContainer: {
    textAlign: "center",
  },
  userCard: {
    display: "flex",
    alignItems: "center",
    background: "#f7fafc",
    padding: "20px",
    borderRadius: "12px",
    margin: "20px 0",
  },
  avatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: "1.2rem",
    marginRight: "15px",
  },
  userInfo: {
    textAlign: "left",
  },
  userName: {
    margin: "0 0 5px 0",
    color: "#2d3748",
  },
  userEmail: {
    margin: "0",
    color: "#718096",
    fontSize: "0.9rem",
  },
  stats: {
    display: "flex",
    justifyContent: "space-around",
    margin: "25px 0",
  },
  stat: {
    textAlign: "center",
  },
  statNumber: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#667eea",
  },
  statLabel: {
    fontSize: "0.8rem",
    color: "#718096",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(255, 255, 255, 0.9)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "20px",
    zIndex: 10,
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e2e8f0",
    borderLeft: "4px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "15px",
  },
  loadingText: {
    color: "#4a5568",
    margin: 0,
  },
  securityBadge: {
    marginTop: "20px",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "0.8rem",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  lockIcon: {
    fontSize: "0.9rem",
  },
};

// Add CSS animation for spinner
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinnerStyle);