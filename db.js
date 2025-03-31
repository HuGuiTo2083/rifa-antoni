// db.js
import postgres from 'postgres';
const connectionString = process.env.DATABASE_URL;
console.log('Conectando a la BD con:', connectionString); // Debug
const sql = postgres(connectionString);
export default sql;

