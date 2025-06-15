<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import emailjs from '@emailjs/browser'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

const EMAIL_CONFIG = {
  SERVICE_ID: "service_mbizhwb",
  TEMPLATE_ID: "template_al0dwjs",
  PUBLIC_KEY: "3WoQIMHu8VuF1DEoG" //API KEY! (nu in forgot password class file!)
}

const email = ref('')
const error = ref('')
const success = ref('')
const isLoading = ref(false)
const router = useRouter()

const generateActivationToken = () => {
  return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
}

const logActivity = (action: string, userEmail: string) => {
  const timestamp = new Date().toISOString()
  console.log(`${timestamp} - ${action} - ${userEmail}`)
}

const handleSubmit = async () => {
  error.value = ''
  success.value = ''

  if (!email.value) {
    error.value = 'Vul je e-mailadres in.'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    error.value = 'Vul een geldig e-mailadres in.'
    return
  }

  isLoading.value = true

  try {
    const activationToken = generateActivationToken()
    const activationLink = `${window.location.origin}/activate/${activationToken}`

    const emailParams = {
      to_email: email.value,
      activation_link: activationLink
    }

    logActivity('password_reset_requested', email.value)

    await emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATE_ID,
        emailParams,
        EMAIL_CONFIG.PUBLIC_KEY
    )

    success.value = 'Als dit e-mailadres bij ons bekend is, ontvang je binnen enkele minuten een e-mail met instructies om je wachtwoord te herstellen.'
    await new Promise(resolve => setTimeout(resolve, 1200))

  } catch (error) {
    error.value = 'Er is een fout opgetreden. Probeer het later opnieuw.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <Card class="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Wachtwoord vergeten?</CardTitle>
        <CardDescription>
          Vul hieronder je e-mailadres in. Je ontvangt een link om je wachtwoord te herstellen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <label for="email" class="block font-medium">E-mailadres</label>
            <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="naam@voorbeeld.nl"
                required
                :disabled="isLoading"
            />
          </div>
          <Button
              type="submit"
              class="w-full"
              :disabled="isLoading"
          >
            {{ isLoading ? 'Bezig...' : 'Verzend instructies' }}
          </Button>
        </form>
        <Alert
            v-if="success"
            variant="default"
            class="mt-4"
        >
          <AlertTitle>Verzonden</AlertTitle>
          <AlertDescription>{{ success }}</AlertDescription>
        </Alert>
        <Alert
            v-if="error"
            variant="destructive"
            class="mt-4"
        >
          <AlertTitle>Fout</AlertTitle>
          <AlertDescription>{{ error }}</AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter class="flex flex-col items-start space-y-2">
        <router-link
            to="/login"
            class="text-sm text-muted-foreground hover:text-primary"
        >
          Terug naar inloggen
        </router-link>
      </CardFooter>
    </Card>
  </div>
</template>

<style scoped>
.container {
  min-height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>