<script setup lang="ts">
import { ref, inject } from 'vue'
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
import type { Database } from '@/components/types/database'

interface User {
  id: number
  email: string
  role: 'customer' | 'instructor' | 'owner'
  first_name: string
  last_name: string
  is_active: boolean
  email_verified: boolean
  blocked: boolean
}

const db = inject<Database>('database')
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const validatePassword = (password: string): boolean => {
  const minLength = password.length >= 12
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[@#$%^&*(),.?":{}|<>]/.test(password)
  return minLength && hasUpperCase && hasNumber && hasSpecialChar
}

const logLoginAttempt = async (userId: number, success: boolean) => {
  try {
    const now = new Date()
    await db?.execute(
        `INSERT INTO logins (user_id, action, timestamp)
       VALUES (?, ?, ?)`,
        [userId, 'login', now]
    )
  } catch (err) {
    console.error('Failed to log login attempt:', err)
  }
}

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true

  try {
    if (!validatePassword(password.value)) {
      error.value = 'Wachtwoord moet minimaal 12 tekens bevatten, een hoofdletter, een getal en een leesteken'
      return
    }

    const [rows] = await db?.execute(
        `SELECT id, email, role, first_name, last_name,
              is_active, email_verified, blocked, password
       FROM users
       WHERE email = ?
       LIMIT 1`,
        [email.value]
    )

    const user = rows[0] as User | undefined

    if (!user) {
      error.value = 'Ongeldige inloggegevens'
      return
    }

    if (!user.is_active) {
      error.value = 'Dit account is niet actief. Controleer uw e-mail voor de activatielink.'
      return
    }

    if (user.blocked) {
      error.value = 'Dit account is geblokkeerd. Neem contact op met de beheerder.'
      return
    }

    if (!user.email_verified) {
      error.value = 'E-mailadres is nog niet geverifieerd. Controleer uw e-mail voor de verificatielink.'
      return
    }

    const bcrypt = require('bcrypt')
    const passwordMatch = await bcrypt.compare(password.value, user.password)

    if (!passwordMatch) {
      error.value = 'Ongeldige inloggegevens'
      await logLoginAttempt(user.id, false)
      return
    }

    await logLoginAttempt(user.id, true)

    sessionStorage.setItem('user_id', String(user.id))
    sessionStorage.setItem('user_email', user.email)
    sessionStorage.setItem('user_role', user.role)
    sessionStorage.setItem('user_name', `${user.first_name} ${user.last_name}`)

    const redirect = route.query.redirect as string
    if (redirect) {
      router.push(redirect)
    } else {
      switch(user.role) {
        case 'owner':
          router.push('/eigenaar/dashboard')
          break
        case 'instructor':
          router.push('/instructeur/dashboard')
          break
        case 'customer':
          router.push('/klant/dashboard')
          break
      }
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = 'Er is een fout opgetreden bij het inloggen'
  } finally {
    isLoading.value = false
  }
}
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
          Inloggen bij Windkracht-12
        </h1>
      </div>
    </div>

    <div class="container mx-auto px-4 -mt-6">
      <Card class="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Log in om je kitesurflessen te beheren
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form @submit.prevent="handleLogin" class="space-y-6">
            <div class="space-y-2">
              <Label for="email">E-mailadres</Label>
              <Input
                  id="email"
                  v-model="email"
                  type="email"
                  required
                  :disabled="isLoading"
                  placeholder="naam@voorbeeld.nl"
                  class="bg-[#FFFBE6]"
              />
            </div>

            <div class="space-y-2">
              <Label for="password">Wachtwoord</Label>
              <Input
                  id="password"
                  v-model="password"
                  type="password"
                  required
                  :disabled="isLoading"
                  placeholder="••••••••••••"
                  class="bg-[#FFFBE6]"
              />
            </div>

            <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                {{ error }}
              </div>
            </div>

            <div class="flex justify-between text-sm">
              <router-link
                  to="/wachtwoord-vergeten"
                  class="text-[#F15A24] hover:text-[#d94e1f] transition-colors"
              >
                Wachtwoord vergeten?
              </router-link>
              <router-link
                  to="/registreren"
                  class="text-[#F15A24] hover:text-[#d94e1f] transition-colors"
              >
                Nog geen account?
              </router-link>
            </div>

            <Button
                type="submit"
                :disabled="isLoading"
                class="w-full bg-[#F15A24] hover:bg-[#d94e1f]"
            >
              <div class="flex items-center justify-center">
                <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isLoading ? 'Bezig met inloggen...' : 'Inloggen' }}
              </div>
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <p class="text-center text-sm text-gray-500 w-full">
            Door in te loggen ga je akkoord met onze
            <router-link to="/voorwaarden" class="text-[#F15A24] hover:text-[#d94e1f] transition-colors">
              voorwaarden
            </router-link>
            en
            <router-link to="/privacy" class="text-[#F15A24] hover:text-[#d94e1f] transition-colors">
              privacybeleid
            </router-link>
          </p>
        </CardFooter>
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