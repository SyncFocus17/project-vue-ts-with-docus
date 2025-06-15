import db from '@/config/database'
import bcrypt from 'bcrypt'

export interface User {
    id: number
    email: string
    role: 'customer' | 'instructor' | 'owner'
    is_active: boolean
    email_verified: boolean
}

export class UserService {
    static async createUser(email: string): Promise<number> {
        const connection = await db.getConnection()
        try {
            await connection.beginTransaction()

            // Check if user exists
            const [users] = await connection.execute<any[]>(
                'SELECT id FROM users WHERE email = ?',
                [email]
            )

            if (users.length > 0) {
                throw new Error('Email already registered')
            }

            // Create user
            const [result] = await connection.execute(`
                INSERT INTO users (email, role, created_at, updated_at)
                VALUES (?, 'customer', NOW(), NOW())
            `, [email])

            await connection.commit()
            return result.insertId
        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    }

    static async createActivationToken(userId: number): Promise<string> {
        const token = Math.random().toString(36).substring(2, 15)
        await db.execute(`
            INSERT INTO user_activations (user_id, token, expires_at, created_at)
            VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR), NOW())
        `, [userId, token])
        return token
    }

    static async setPassword(email: string, password: string): Promise<void> {
        const hashedPassword = await bcrypt.hash(password, 12)
        await db.execute(`
            UPDATE users 
            SET password = ?, updated_at = NOW()
            WHERE email = ?
        `, [hashedPassword, email])
    }

    static async updateProfile(
        email: string,
        data: {
            firstName: string
            lastName: string
            address: string
            city: string
            birthdate: string
            phone: string
        }
    ): Promise<void> {
        const connection = await db.getConnection()
        try {
            await connection.beginTransaction()

            await connection.execute(`
                UPDATE users
                SET first_name = ?,
                    last_name = ?,
                    address = ?,
                    city = ?,
                    birthdate = ?,
                    phone = ?,
                    is_active = true,
                    email_verified = true,
                    updated_at = NOW()
                WHERE email = ?
            `, [
                data.firstName,
                data.lastName,
                data.address,
                data.city,
                data.birthdate,
                data.phone,
                email
            ])

            await connection.execute(`
                INSERT INTO email_log (
                    user_id, 
                    email_to, 
                    subject, 
                    body, 
                    sent_at, 
                    status
                ) SELECT 
                    id,
                    email,
                    'Welcome to Windkracht-12',
                    'Your registration is complete. You can now log in to your account.',
                    NOW(),
                    'queued'
                FROM users
                WHERE email = ?
            `, [email])

            await connection.commit()
        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    }
}