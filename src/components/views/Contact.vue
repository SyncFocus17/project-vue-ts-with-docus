<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import emailjs from '@emailjs/browser';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertCircle,
  Building2,
  Phone,
  Mail,
  Clock,
  MapPin,
  Users,
  Wind
} from "lucide-vue-next"

const formatDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const EMAIL_CONFIG = {
  SERVICE_ID: "service_mbizhwb",
  TEMPLATE_ID: "template_al0dwjs",
  PUBLIC_KEY: "3WoQIMHu8VuF1DEoG" //API KEY!
}

const mockSendEmail = async (data: any) => {
  await new Promise(resolve => setTimeout(resolve, 1500))

  if (Math.random() < 0.1) {
    throw new Error("Netwerk timeout!")
  }

  console.log(`
========================================
NIEUWE CONTACT AANVRAAG KITESURFSCHOOL
========================================
Verzonden op: ${formatDateTime()}

CONTACT GEGEVENS
---------------
Naam: ${data.firstName} ${data.lastName}
Email: ${data.email}
Telefoon: ${data.phone || 'Niet opgegeven'}

AANVRAAG DETAILS
--------------
Onderwerp: ${data.subject}
Locatie: ${data.preferredLocation || 'Geen voorkeur'}
Pakket: ${data.interestedIn || 'Niet gespecificeerd'}
Instructeur: ${data.preferredInstructor || 'Geen voorkeur'}

BERICHT
-------
${data.message}

WEER CONDITIES
-------------
Windkracht: ${currentWeather.value.windSpeed} Bft
Temperatuur: ${currentWeather.value.temperature}°C
${currentWeather.value.windSpeed > 10 ? 'WAARSCHUWING: Windkracht te hoog voor lessen!' : 'Condities OK voor lessen'}

SYSTEEM INFO
-----------
Reference ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}
Timestamp: ${formatDateTime()}
========================================
  `)

  return true
}
interface Location {
  id: number
  name: string
  address: string
  coordinates: { lat: number; lng: number }
}

interface ContactFormProps {
  firstName: string
  lastName: string
  email: string
  phone: string
  subject: string
  preferredLocation: string
  interestedIn: string
  message: string
  preferredInstructor?: string
}

interface FormErrors {
  firstName: string
  lastName: string
  email: string
  phone: string
  message: string
}

const LOCATIONS: Location[] = [
  { id: 1, name: 'Zandvoort', address: 'Zandvoort Strand', coordinates: { lat: 52.3714, lng: 4.5270 } },
  { id: 2, name: 'Muiderberg', address: 'Muiderberg Strand', coordinates: { lat: 52.3297, lng: 5.0697 } },
  { id: 3, name: 'Wijk aan Zee', address: 'Wijk aan Zee Strand', coordinates: { lat: 52.4834, lng: 4.5707 } },
  { id: 4, name: 'IJmuiden', address: 'IJmuiden Strand', coordinates: { lat: 52.4580, lng: 4.5508 } },
  { id: 5, name: 'Scheveningen', address: 'Scheveningen Strand', coordinates: { lat: 52.1031, lng: 4.2734 } },
  { id: 6, name: 'Hoek van Holland', address: 'Hoek van Holland Strand', coordinates: { lat: 51.9777, lng: 4.1333 } }
]

const INSTRUCTORS = [
  'Duco Veenstra',
  'Waldemar van Dongen',
  'Ruud Terlingen',
  'Saskia Brink',
  'Bernie Vredenstein'
]

const PACKAGES = [
  { id: 'private', name: 'Privéles (2,5 uur)', price: '€175' },
  { id: 'duo', name: 'Duo Kiteles (3,5 uur)', price: '€135 p.p.' },
  { id: 'duo-3', name: 'Duo Pakket (3 lessen)', price: '€375 p.p.' },
  { id: 'duo-5', name: 'Duo Pakket (5 lessen)', price: '€675 p.p.' }
]

const contactForm = reactive<ContactFormProps>({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  subject: "Informatie over lessen",
  preferredLocation: "",
  interestedIn: "",
  message: "",
  preferredInstructor: ""
})

const formErrors = reactive<FormErrors>({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: ""
})

const invalidInputForm = ref<boolean>(false)
const isSubmitting = ref<boolean>(false)
const submitError = ref<string>("")
const showSuccessMessage = ref<boolean>(false)
const currentWeather = ref<{ windSpeed: number, temperature: number }>({
  windSpeed: 0,
  temperature: 0
})

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+31|0)[\d\s-]{9,}$/
  return phoneRegex.test(phone)
}

const validateForm = (): boolean => {
  let isValid = true

  Object.keys(formErrors).forEach(key => {
    formErrors[key as keyof FormErrors] = ""
  })

  if (!contactForm.firstName.trim()) {
    formErrors.firstName = "Voornaam is verplicht"
    isValid = false
  }

  if (!contactForm.lastName.trim()) {
    formErrors.lastName = "Achternaam is verplicht"
    isValid = false
  }

  if (!contactForm.email.trim()) {
    formErrors.email = "E-mail is verplicht"
  } else if (!validateEmail(contactForm.email)) {
    formErrors.email = "Vul een geldig e-mailadres in"
    isValid = false
  }

  if (contactForm.phone && !validatePhone(contactForm.phone)) {
    formErrors.phone = "Vul een geldig telefoonnummer in"
    isValid = false
  }

  if (!contactForm.message.trim()) {
    formErrors.message = "Bericht is verplicht"
    isValid = false
  } else if (contactForm.message.length < 10) {
    formErrors.message = "Bericht moet minimaal 10 karakters bevatten"
    isValid = false
  }

  return isValid
}

const generateReferenceId = () => {
  return `${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`.toUpperCase()
}

const getPackageDetails = (packageName: string) => {
  switch(packageName) {
    case 'Privéles (2,5 uur)':
      return {
        details: `Privéles 2,5 uur
- € 175,- inclusief alle materialen
- Één persoon per les
- 1 dagdeel`,
        amount: "175,00"
      }
    case 'Duo Kiteles (3,5 uur)':
      return {
        details: `Duo Kiteles 3,5 uur
- € 135,- per persoon inclusief alle materialen
- Maximaal 2 personen per les
- 1 dagdeel`,
        amount: "135,00"
      }
    default:
      return {
        details: "Geen pakket geselecteerd",
        amount: "0,00"
      }
  }
}

const handleSubmit = async () => {
  invalidInputForm.value = false
  submitError.value = ""
  showSuccessMessage.value = false

  if (!validateForm()) {
    invalidInputForm.value = true
    return
  }

  isSubmitting.value = true

  try {
    const referenceId = generateReferenceId()
    const packageInfo = getPackageDetails(contactForm.interestedIn)

    const emailParams = {
      system_date: formatDateTime(),
      system_time: new Date().toISOString(),
      reference_id: referenceId,

      first_name: contactForm.firstName,
      last_name: contactForm.lastName,
      email: contactForm.email,
      phone: contactForm.phone || 'Niet opgegeven',

      package_details: packageInfo.details,
      total_amount: `€ ${packageInfo.amount}`,

      location: contactForm.preferredLocation || 'Nog te bepalen',
      instructor: contactForm.preferredInstructor || 'Wordt toegewezen',
      participant_count: contactForm.interestedIn.includes('Duo') ? '2' : '1',

      wind_speed: currentWeather.value.windSpeed,
      temperature: currentWeather.value.temperature,
      weather_warning: currentWeather.value.windSpeed > 10 ?
          'WAARSCHUWING: Bij deze windkracht worden lessen automatisch geannuleerd.' :
          'Huidige condities zijn geschikt voor lessen.'
    }

    await emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATE_ID,
        emailParams,
        EMAIL_CONFIG.PUBLIC_KEY
    )

    showSuccessMessage.value = true
    console.log('✅ Reservering verzonden')

    Object.keys(contactForm).forEach(key => {
      contactForm[key as keyof ContactFormProps] = ""
    })
    contactForm.subject = "Informatie over lessen"

  } catch (error) {
    console.error('❌ Error:', error)
    submitError.value = "Er is een fout opgetreden bij het verwerken van je reservering. Probeer het later opnieuw."
    invalidInputForm.value = true
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    const response = await fetch('/api/weather')
    const data = await response.json()
    currentWeather.value = data
  } catch {
    currentWeather.value = {
      windSpeed: 4,
      temperature: 20
    }
  }
})
</script>

<template>
  <section id="contact" class="container py-24 sm:py-32">
    <Alert v-if="showSuccessMessage" class="mb-8">
      <CheckCircle class="h-4 w-4" />
      <AlertTitle>Bericht verzonden!</AlertTitle>
      <AlertDescription>
        Bedankt voor je bericht. We nemen zo snel mogelijk contact met je op.
      </AlertDescription>
    </Alert>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <div class="mb-4">
          <h2 class="text-lg text-primary mb-2 tracking-wider">Contact</h2>
          <h2 class="text-3xl md:text-4xl font-bold">Neem contact op!</h2>
        </div>

        <p class="mb-8 text-muted-foreground lg:w-5/6">
          Heb je vragen over onze kitesurflessen of wil je meer informatie?
          Neem contact op met een van onze ervaren instructeurs. We helpen je graag verder!
        </p>

        <div class="flex flex-col gap-6">
          <div class="flex gap-4">
            <Building2 class="h-6 w-6 text-primary" />
            <div>
              <div class="font-bold mb-1">Hoofdlocatie</div>
              <div class="text-muted-foreground">
                Zandvoort, Noord-Holland
                <br />Nederland
              </div>
            </div>
          </div>

          <div class="flex gap-4">
            <Phone class="h-6 w-6 text-primary" />
            <div>
              <div class="font-bold mb-1">Telefonisch Contact</div>
              <a
                  href="tel:+31614141414"
                  class="text-muted-foreground hover:text-primary transition-colors"
              >
                +31 6 14141414
              </a>
            </div>
          </div>

          <div class="flex gap-4">
            <Mail class="h-6 w-6 text-primary" />
            <div>
              <div class="font-bold mb-1">E-mail</div>
              <a
                  href="mailto:support@kitesurfschool-windkracht12.nl"
                  class="text-muted-foreground hover:text-primary transition-colors"
              >
                support@kitesurfschool-windkracht12.nl
              </a>
            </div>
          </div>

          <div class="flex gap-4">
            <Clock class="h-6 w-6 text-primary" />
            <div>
              <div class="font-bold mb-1">Openingstijden</div>
              <div class="text-muted-foreground">
                <div>Maandag t/m Vrijdag: 08:00 - 17:30</div>
                <div>Weekend: Op afspraak</div>
              </div>
            </div>
          </div>

          <div class="flex gap-4">
            <Wind class="h-6 w-6 text-primary" />
            <div>
              <div class="font-bold mb-1">Huidige Condities</div>
              <div class="text-muted-foreground">
                <div>Windkracht: {{ currentWeather.windSpeed }} Bft</div>
                <div>Temperatuur: {{ currentWeather.temperature }}°C</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card class="bg-muted/60 dark:bg-card">
        <CardContent class="pt-6">
          <form @submit.prevent="handleSubmit" class="grid gap-4">
            <div class="grid md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <Label for="first-name">Voornaam</Label>
                <Input
                    id="first-name"
                    v-model="contactForm.firstName"
                    :class="{ 'border-destructive': formErrors.firstName }"
                    placeholder="Kevin"
                />
                <span v-if="formErrors.firstName" class="text-sm text-destructive">
                  {{ formErrors.firstName }}
                </span>
              </div>

              <div class="flex flex-col gap-1.5">
                <Label for="last-name">Achternaam</Label>
                <Input
                    id="last-name"
                    v-model="contactForm.lastName"
                    :class="{ 'border-destructive': formErrors.lastName }"
                    placeholder="van Beek"
                />
                <span v-if="formErrors.lastName" class="text-sm text-destructive">
                  {{ formErrors.lastName }}
                </span>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <Label for="email">E-mailadres</Label>
                <Input
                    id="email"
                    type="email"
                    v-model="contactForm.email"
                    :class="{ 'border-destructive': formErrors.email }"
                    placeholder="kevinvanbeek@gmail.com"
                />
                <span v-if="formErrors.email" class="text-sm text-destructive">
                  {{ formErrors.email }}
                </span>
              </div>

              <div class="flex flex-col gap-1.5">
                <Label for="phone">Telefoonnummer (optioneel)</Label>
                <Input
                    id="phone"
                    type="tel"
                    v-model="contactForm.phone"
                    :class="{ 'border-destructive': formErrors.phone }"
                    placeholder="+31 6 12345678"
                />
                <span v-if="formErrors.phone" class="text-sm text-destructive">
                  {{ formErrors.phone }}
                </span>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <Label for="subject">Onderwerp</Label>
                <Select v-model="contactForm.subject">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer onderwerp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Informatie over lessen">
                        Informatie over lessen
                      </SelectItem>
                      <SelectItem value="Reservering maken">
                        Reservering maken
                      </SelectItem>
                      <SelectItem value="Wijzigen reservering">
                        Wijzigen reservering
                      </SelectItem>
                      <SelectItem value="Annulering">
                        Annulering
                      </SelectItem>
                      <SelectItem value="Anders">
                        Anders
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>              </div>

              <div class="flex flex-col gap-1.5">
                <Label for="location">Voorkeur Locatie</Label>
                <Select v-model="contactForm.preferredLocation">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer locatie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem v-for="location in LOCATIONS"
                                  :key="location.id"
                                  :value="location.name"
                      >
                        {{ location.name }}
                      </SelectItem>
                      <SelectItem value="geen-voorkeur">
                        Geen voorkeur
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <Label for="package">Interesse In</Label>
                <Select v-model="contactForm.interestedIn">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer lespakket" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem v-for="pkg in PACKAGES"
                                  :key="pkg.id"
                                  :value="pkg.name"
                      >
                        {{ pkg.name }} - {{ pkg.price }}
                      </SelectItem>
                      <SelectItem value="informatie">
                        Alleen informatie
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div class="flex flex-col gap-1.5">
                <Label for="instructor">Voorkeur Instructeur</Label>
                <Select v-model="contactForm.preferredInstructor">
                  <SelectTrigger>
                    <SelectValue placeholder="Optioneel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem v-for="instructor in INSTRUCTORS"
                                  :key="instructor"
                                  :value="instructor"
                      >
                        {{ instructor }}
                      </SelectItem>
                      <SelectItem value="geen-voorkeur">
                        Geen voorkeur
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <Label for="message">Bericht</Label>
              <Textarea
                  id="message"
                  v-model="contactForm.message"
                  :class="{ 'border-destructive': formErrors.message }"
                  placeholder="Schrijf hier je bericht..."
                  rows="5"
              />
              <span v-if="formErrors.message" class="text-sm text-destructive">
                {{ formErrors.message }}
              </span>
            </div>

            <Alert v-if="invalidInputForm" variant="destructive">
              <AlertCircle class="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {{ submitError || "Controleer de gemarkeerde velden en probeer het opnieuw." }}
              </AlertDescription>
            </Alert>

            <Alert
                v-if="currentWeather.windSpeed > 10"
                variant="warning"
                class="bg-yellow-500/15"
            >
              <AlertCircle class="h-4 w-4" />
              <AlertTitle>Let op!</AlertTitle>
              <AlertDescription>
                De huidige windkracht ({{ currentWeather.windSpeed }} Bft) is te hoog voor lessen.
                Bij windkracht boven 10 Bft worden lessen geannuleerd.
              </AlertDescription>
            </Alert>
            <Button
                type="submit"
                class="w-full"
                :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Bericht verzenden...' : 'Verstuur Bericht' }}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </section>
</template>