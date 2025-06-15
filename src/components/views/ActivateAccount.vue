<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Database } from '@/types/database'

interface ActivationData {
  token: string
  userId: number
  email: string
  password: string
  confirmPassword: string
}

const db = inject<Database>('database')
const router = useRouter()
const route = useRoute()

const activationData = ref<ActivationData>({
  token: route.params.token as string,
  userId: 0,
  email: '',
  password: '',
  confirmPassword: ''
})

const error = ref('')
const isLoading = ref(false)
const tokenValid = ref(false)

const validateToken = async () => {
  try {
    const [rows] = await db?.execute(
        `SELECT
        ua.user_id,
        u.email,
        ua.expires_at,
        ua.used
      FROM user_activations ua
      JOIN users u ON u.id = ua.user_id
      WHERE ua.token = ?
      AND ua.token_type = 'activation'
      AND ua.used = false
      LIMIT 1`,
        [activationData.value.token]
    )

    if (!rows || rows.length === 0) {
      error.value = 'Ongeldige activatielink'
      return false
    }

    const activation = rows[0]
    const now = new Date()
    const expiryDate = new Date(activation.expires_at)

    if (now > expiryDate) {
      error.value = 'Deze activatielink is verlopen'
      return false
    }

    activationData.value.userId = activation.user_id
    activationData.value.email = activation.email
    return true
  } catch (err) {
    console.error('Token validation error:', err)
    error.value = 'Er is een fout opgetreden bij het valideren van de activatielink'
    return false
  }
}

const validatePassword = (password: string): boolean => {
  const minLength = password.length >= 12
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[@#$%^&*(),.?":{}|<>]/.test(password)
  return minLength && hasUpperCase && hasNumber && hasSpecialChar
}

const logLoginAttempt = async (userId: number, success: boolean) => {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  await db?.execute(
      `INSERT INTO logins (user_id, email, action, timestamp, success)
     VALUES (?, ?, ?, ?, ?)`,
      [userId, activationData.value.email, 'login', now, success]
  )
}

const handleSubmit = async () => {
  error.value = ''
  isLoading.value = true

  try {
    if (activationData.value.password !== activationData.value.confirmPassword) {
      error.value = 'Wachtwoorden komen niet overeen'
      return
    }

    if (!validatePassword(activationData.value.password)) {
      error.value = 'Wachtwoord moet minimaal 12 tekens bevatten, een hoofdletter, een getal en een leesteken'
      return
    }

    const bcrypt = require('bcrypt')
    const hashedPassword = await bcrypt.hash(activationData.value.password, 12)

    await db?.execute(
        `START TRANSACTION`
    )

    await db?.execute(
        `UPDATE users
       SET password = ?,
           email_verified = true
       WHERE id = ?`,
        [hashedPassword, activationData.value.userId]
    )

    await db?.execute(
        `UPDATE user_activations
       SET used = true,
           used_at = NOW()
       WHERE token = ?`,
        [activationData.value.token]
    )

    await db?.execute(
        `COMMIT`
    )

    await logLoginAttempt(activationData.value.userId, true)

    sessionStorage.setItem('user_id', String(activationData.value.userId))
    sessionStorage.setItem('user_email', activationData.value.email)
    sessionStorage.setItem('user_role', 'customer')

    router.push('/klant/dashboard')
  } catch (err) {
    await db?.execute(`ROLLBACK`)
    console.error('Activation error:', err)
    error.value = 'Er is een fout opgetreden bij het activeren van je account'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  isLoading.value = true
  tokenValid.value = await validateToken()
  isLoading.value = false
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="relative bg-gradient-to-r from-[#F15A24] to-[#d94e1f] h-48">
      <div class="absolute bottom-0 w-full">
        <svg class="w-full h-16" viewBox="0 0 1440 54" preserveAspectRatio="none">
          <path
              fill="rgb(249 250 251)"
              fill-opacity="1"
              d="M0,0L40,4.5C80,9,160,18,240,23.6C320,29,400,31,480,29.8C560,29,640,24,720,20.2C800,16,880,13,960,18C1040,22,1120,35,1200,38.3C1280,42,1360,36,1400,32.7L1440,29L1440,54L1400,54C1360,54,1280,54,1200,54C1120,54,1040,54,960,54C880,54,800,54,720,54C640,54,560,54,480,54C400,54,320,54,240,54C160,54,80,54,40,54L0,54Z"
          ></path>
        </svg>
      </div>
      <div class="container mx-auto px-4 pt-8">
        <img
            alt="Windkracht-12 Logo"
            class="h-12 mx-auto mb-4"
        >
        <h1 class="text-3xl font-bold text-center text-white">
          Account Activeren
        </h1>
      </div>
    </div>

    <div class="container mx-auto px-4 -mt-6">
      <Card class="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Account Activeren</CardTitle>
          <CardDescription>
            Kies een wachtwoord om je account te activeren
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div v-if="isLoading" class="text-center py-8">
            <svg class="animate-spin h-8 w-8 mx-auto text-[#F15A24]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>

          <form v-else-if="tokenValid" @submit.prevent="handleSubmit" class="space-y-6">
            <div class="space-y-2">
              <Label for="email">E-mailadres</Label>
              <Input
                  id="email"
                  v-model="activationData.email"
                  type="email"
                  disabled
                  class="bg-gray-100"
              />
            </div>

            <div class="space-y-2">
              <Label for="password">Wachtwoord</Label>
              <Input
                  id="password"
                  v-model="activationData.password"
                  type="password"
                  required
                  :disabled="isLoading"
                  placeholder="••••••••••••"
                  class="bg-[#FFFBE6]"
              />
            </div>

            <div class="space-y-2">
              <Label for="confirmPassword">Bevestig wachtwoord</Label>
              <Input
                  id="confirmPassword"
                  v-model="activationData.confirmPassword"
                  type="password"
                  required
                  :disabled="isLoading"
                  placeholder="••••••••••••"
                  class="bg-[#FFFBE6]"
              />
            </div>

            <div class="text-sm text-gray-600">
              Het wachtwoord moet minimaal bevatten:
              <ul class="list-disc list-inside mt-2">
                <li>12 tekens</li>
                <li>1 hoofdletter</li>
                <li>1 getal</li>
                <li>1 leesteken (@#$%^&*(),.?":{}|&lt;&gt;)</li>
              </ul>
            </div>

            <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                {{ error }}
              </div>
            </div>

            <Button
                type="submit"
                :disabled="isLoading"
                class="w-full bg-[#F15A24] hover:bg-[#d94e1f]"
            >
              {{ isLoading ? 'Account wordt geactiveerd...' : 'Account Activeren' }}
            </Button>
          </form>

          <div v-else-if="error" class="text-center py-8">
            <div class="text-red-600 mb-4">{{ error }}</div>
            <router-link
                to="/registreren"
                class="text-[#F15A24] hover:text-[#d94e1f] transition-colors"
            >
              Registreer opnieuw
            </router-link>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
input:focus {
  outline: none;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #F15A24;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #d94e1f;
}
</style>