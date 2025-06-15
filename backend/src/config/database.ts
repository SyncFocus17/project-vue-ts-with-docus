import mysql from 'mysql2/promise'

const pool = mysql.createPool({
    host: 'db-par-01.apollopanel.com',
    port: 3306,
    user: 'u174631_cPt0mOQ0QA',
    password: 'ZQTCtTWPM@+W3tVwgnkjUaY=',
    database: 's174631_kitesurfschool',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

export default pool