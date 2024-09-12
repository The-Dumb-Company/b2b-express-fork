import pg from 'pg';
const { Pool } = pg;

const pool= new Pool({
    user: "postgres",
    host: "database-1.ctmkakqy092d.ap-south-1.rds.amazonaws.com",
    database: "b2b-express",
    password: "abc123def#",
    port: 5432,
    ssl: {
        rejectUnauthorized: false,
    }
});

export default pool;