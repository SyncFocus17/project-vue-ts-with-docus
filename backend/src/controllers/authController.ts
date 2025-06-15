import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import db from '../config/database'
import { RowDataPacket } from 'mysql2'

interface User extends RowDataPacket {
    id: number
    email: string
    password: string
    role: 'customer' | 'instructor' | 'owner'
    first_name: string
    last_name: string
    is_active: boolean
    email_verified: boolean
    blocked: boolean
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        console.log('Login attempt:', email)

        const [users] = await db.execute<User[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        )

        const user = users[0]
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

        if (!user.is_active || user.blocked || !user.email_verified) {
            let message = 'Account is niet toegankelijk'
            if (!user.email_verified) message = 'Email adres is nog niet geverifieerd'
            else if (user.blocked) message = 'Account is geblokkeerd'
            else if (!user.is_active) message = 'Account is inactief'

            return res.status(401).json({
                success: false,
                message
            })
        }

        const now = new Date()
        const timestamp = now.toISOString().slice(0, 19).replace('T', ' ') + '.' +
            now.getMilliseconds().toString().padStart(6, '0')

        await db.execute(
            'INSERT INTO logins (user_id, email, action, timestamp, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
            [
                user.id,
                email,
                'login',
                timestamp,
                req.ip,
                req.headers['user-agent']
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
}

export const logout = async (req: Request, res: Response) => {
    try {
        const { userId, email } = req.body

        const now = new Date()
        const timestamp = now.toISOString().slice(0, 19).replace('T', ' ') + '.' +
            now.getMilliseconds().toString().padStart(6, '0')

        await db.execute(
            'INSERT INTO logins (user_id, email, action, timestamp, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
            [
                userId,
                email,
                'logout',
                timestamp,
                req.ip,
                req.headers['user-agent']
            ]
        )

        res.json({
            success: true,
            message: 'Succesvol uitgelogd'
        })

    } catch (error) {
        console.error('Logout error:', error)
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden bij het uitloggen'
        })
    }
}