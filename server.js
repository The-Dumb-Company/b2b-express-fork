import { app } from "./app.js";
import pool from "./data/database.js";

pool.connect();

console.log(await pool.query("SELECT NOW()"));
// console.log(await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
console.log(await pool.query("SELECT * FROM person"));


app.listen(process.env.PORT, () => {
  console.log(
    `Server is running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`
  );
});