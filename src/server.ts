import app from "./app/app";
import { AppDataSource } from "./config/client";
import { verifyMailTransport } from "./utils/mailer";

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Database connected");
    // Verify SMTP once at boot so email misconfiguration is visible in logs.
    verifyMailTransport();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB init failed:", err);
    process.exit(1);
  });