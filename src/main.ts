import { createApp } from "vue"
import mysql from 'mysql2/promise'
import App from "./App.vue"
import "./assets/index.css"
import router from "./components/router"
import { authService } from './services/AuthService'
import { dbConfig } from './config/database'

const pool = mysql.createPool(dbConfig)

const db = {
    async execute(query: string, params?: any[]) {
        return await pool.execute(query, params)
    },
    async query(query: string, params?: any[]) {
        return await pool.query(query, params)
    },
    async connect() {
        await pool.getConnection()
    },
    async end() {
        await pool.end()
    }
}

authService.setDatabase(db)

const app = createApp(App)
app.provide('database', db)
app.use(router)
app.mount("#app")