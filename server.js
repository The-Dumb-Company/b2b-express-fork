import { app } from "./app.js";

// import pool from "./data/database.js";

// pool.connect();

// const result = await pool.query("SELECT * FROM sellers");
// const row = result.rows[0];

// console.log(row);

app.listen(process.env.PORT, () => {
  console.log(
    `Server is running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`
  );
});