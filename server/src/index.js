import "dotenv/config";
import app from "./app.js";
import { connectDb } from "./db.js";

const port = Number(process.env.PORT) || 4000;

if (!process.env.VERCEL) {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log(`BorrowBox API listening on http://127.0.0.1:${port}`);
    });
  } catch (error) {
    console.error("Could not connect to MongoDB.", error.message);
    process.exit(1);
  }
}

export default app;
