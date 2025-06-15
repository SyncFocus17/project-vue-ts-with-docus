import express from 'express'
import cors from 'cors'
import mysql, { RowDataPacket } from 'mysql2/promise'
import bcrypt from 'bcrypt'

const app = express()
app.use(cors())
app.use(express.json())

const db = mysql.createPool({
    host: 'db-par-01.apollopanel.com',
    port: 3306,
    user: 'u174631_cPt0mOQ0QA',
    password: 'ZQTCtTWPM@+W3tVwgnkjUaY=',
    database: 's174631_kitesurfschool',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})