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

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Database connected successfully!');
        client.release();
    } catch (err) {
        console.error('Database connection error:', err.stack);
    }
}

testConnection();

export default pool;