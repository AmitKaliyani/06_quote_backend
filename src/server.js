import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import logger from "./config/logger.js";

connectDB();

app.listen(env.PORT, () => {
  //   console.log(`Sever running on PORT no. ${env.PORT}`);
  logger.info(`Server running on ${env.PORT}`);
});
