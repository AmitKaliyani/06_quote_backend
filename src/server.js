import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";



connectDB();

app.listen(env.PORT,() => {
    console.log(`Sever running on PORT no. ${env.PORT}`);
    
})