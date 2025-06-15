import express from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'
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

app.get('/api/test', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT 1')
        res.json({ success: true, data: rows })
    } catch (error) {
        res.status(500).json({ success: false, error: 'Database error' })
    }
})

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body
        console.log('Login attempt:', email, password)

        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        )

        const user = users[0]
        console.log('Found user:', user)

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email of wachtwoord is onjuist'
            })
        }

        const validPassword = await bcrypt.compare(password, user.password)
        console.log('Password valid:', validPassword)

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Email of wachtwoord is onjuist'
            })
        }

        const now = new Date()
        await db.execute(
            'INSERT INTO logins (user_id, email, action, timestamp, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
            [
                user.id,
                email,
                'login',
                now,
                req.ip || '0.0.0.0',
                req.headers['user-agent'] || 'Unknown'
            ]
        )

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name
            }
        })

    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het inloggen'
        })
    }
})

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})