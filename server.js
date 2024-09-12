import { app } from "./app.js";
import pool from "./data/database.js"

pool.connect();

pool.query('SELECT * FROM  products', (error, results) => {
  if (error) {
    throw error
  }
  console.log(results.rows);
})

app.listen(process.env.PORT, () => {
  console.log(
    `Server is running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`
  );
});