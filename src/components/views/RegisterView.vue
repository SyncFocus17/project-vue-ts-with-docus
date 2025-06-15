<script setup lang="ts">
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
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

interface RegistrationData {
  email: string
  first_name: string
  last_name: string
  address: string
  city: string
  birthdate: string
  phone: string
}

const db = inject<Database>('database')
const router = useRouter()

const registrationData = ref<RegistrationData>({
  email: '',
  first_name: '',
  last_name: '',
  address: '',
  city: '',
  birthdate: '',
  phone: ''
})

const error = ref('')
const isLoading = ref(false)
const emailSent = ref(false)

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const generateActivationToken = (): string => {
  return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
}

const createActivationRecord = async (userId: number, token: string) => {
  const expiryDate = new Date()
  expiryDate.setHours(expiryDate.getHours() + 24)

  await db?.execute(
      `INSERT INTO user_activations (
      user_id,
      token,
      token_type,
      expires_at
    ) VALUES (?, ?, ?, ?)`,
      [userId, token, 'activation', expiryDate]
  )
}

const logEmailSent = async (userId: number, email: string, token: string) => {
  const activationLink = `https://kitesurfschool-windkracht12.nl/activate/${token}`
  const emailBody = `
    Welkom bij Windkracht-12!

    Klik op onderstaande link om je account te activeren:
    ${activationLink}

    Deze link is 24 uur geldig.

    Met vriendelijke groet,
    Team Windkracht-12
  `

  await db?.execute(
      `INSERT INTO email_log (
      user_id,
      email_to,
      email_from,
      subject,
      body,
      template_name,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        email,
        'noreply@windkracht12.nl',
        'Activeer je Windkracht-12 account',
        emailBody,
        'account_activation',
        'sent'
      ]
  )
}

const handleSubmit = async () => {
  error.value = ''
  isLoading.value = true

  try {
    if (!validateEmail(registrationData.value.email)) {
      error.value = 'Voer een geldig e-mailadres in'
      return
    }

    const [existingUsers] = await db?.execute(
        'SELECT id FROM users WHERE email = ?',
        [registrationData.value.email]
    )

    if (existingUsers?.length > 0) {
      error.value = 'Dit e-mailadres is al geregistreerd'
      return
    }

    const [result] = await db?.execute(
        `INSERT INTO users (
        email,
        role,
        first_name,
        last_name,
        address,
        city,
        birthdate,
        phone,
        is_active,
        email_verified,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          registrationData.value.email,
          'customer',
          registrationData.value.first_name,
          registrationData.value.last_name,
          registrationData.value.address,
          registrationData.value.city,
          registrationData.value.birthdate,
          registrationData.value.phone,
          true,
          false,
          new Date()
        ]
    )

    const userId = result.insertId
    const activationToken = generateActivationToken()

    await createActivationRecord(userId, activationToken)
    await logEmailSent(userId, registrationData.value.email, activationToken)

    emailSent.value = true
  } catch (err) {
    console.error('Registration error:', err)
    error.value = 'Er is een fout opgetreden bij de registratie'
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
          Registreren bij Windkracht-12
        </h1>
      </div>
    </div>

    <div class="container mx-auto px-4 -mt-6">
      <Card class="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Registreren</CardTitle>
          <CardDescription>
            {{ emailSent ? 'Controleer je e-mail voor de activatielink' : 'Maak een account aan om kitesurflessen te boeken' }}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form v-if="!emailSent" @submit.prevent="handleSubmit" class="space-y-6">
            <div class="space-y-2">
              <Label for="email">E-mailadres</Label>
              <Input
                  id="email"
                  v-model="registrationData.email"
                  type="email"
                  required
                  :disabled="isLoading"
                  placeholder="naam@voorbeeld.nl"
                  class="bg-[#FFFBE6]"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="first_name">Voornaam</Label>
                <Input
                    id="first_name"
                    v-model="registrationData.first_name"
                    required
                    :disabled="isLoading"
                    class="bg-[#FFFBE6]"
                />
              </div>

              <div class="space-y-2">
                <Label for="last_name">Achternaam</Label>
                <Input
                    id="last_name"
                    v-model="registrationData.last_name"
                    required
                    :disabled="isLoading"
                    class="bg-[#FFFBE6]"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="address">Adres</Label>
              <Input
                  id="address"
                  v-model="registrationData.address"
                  required
                  :disabled="isLoading"
                  class="bg-[#FFFBE6]"
              />
            </div>

            <div class="space-y-2">
              <Label for="city">Woonplaats</Label>
              <Input
                  id="city"
                  v-model="registrationData.city"
                  required
                  :disabled="isLoading"
                  class="bg-[#FFFBE6]"
              />
            </div>

            <div class="space-y-2">
              <Label for="birthdate">Geboortedatum</Label>
              <Input
                  id="birthdate"
                  v-model="registrationData.birthdate"
                  type="date"
                  required
                  :disabled="isLoading"
                  class="bg-[#FFFBE6]"
              />
            </div>

            <div class="space-y-2">
              <Label for="phone">Telefoonnummer</Label>
              <Input
                  id="phone"
                  v-model="registrationData.phone"
                  type="tel"
                  required
                  :disabled="isLoading"
                  placeholder="06-12345678"
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
                {{ isLoading ? 'Bezig met registreren...' : 'Registreren' }}
              </div>
            </Button>
          </form>

          <div v-else class="text-center space-y-4">
            <p class="text-green-600">
              Er is een activatielink verstuurd naar {{ registrationData.email }}
            </p>
            <p class="text-sm text-gray-600">
              Controleer ook je spam folder als je de e-mail niet kunt vinden.
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <p class="text-center text-sm text-gray-500 w-full">
            Heb je al een account?
            <router-link to="/login" class="text-[#F15A24] hover:text-[#d94e1f] transition-colors">
              Login hier
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