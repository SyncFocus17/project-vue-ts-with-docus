<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface PersonalInfo {
  firstName: string
  lastName: string
  address: string
  city: string
  dateOfBirth: string
  phone: string
  email: string
}

interface LessonPackage {
  id: number
  name: string
  price: number
  lessons: number
  location: string
  isDuo: boolean
  status: 'pending' | 'paid' | 'cancelled'
  dates: Array<{
    date: string
    time: string
    location: string
    instructor: string
    status: 'scheduled' | 'completed' | 'cancelled'
  }>
  duoPartner?: {
    firstName: string
    lastName: string
    email: string
  }
}

const router = useRouter()
const personalInfo = ref<PersonalInfo>({
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  dateOfBirth: '',
  phone: '',
  email: ''
})

const activePackages = ref<LessonPackage[]>([
  {
    id: 1,
    name: 'Kitesurf Duo lespakket 5 lessen',
    price: 675,
    lessons: 5,
    location: 'Scheveningen',
    isDuo: true,
    status: 'pending',
    dates: [
      {
        date: '2025-06-15',
        time: '10:00',
        location: 'Scheveningen',
        instructor: 'Duco Veenstra',
        status: 'scheduled'
      },
      {
        date: '2025-06-22',
        time: '10:00',
        location: 'Scheveningen',
        instructor: 'Duco Veenstra',
        status: 'scheduled'
      }
    ],
    duoPartner: {
      firstName: 'Jan',
      lastName: 'Janssen',
      email: 'jan@example.com'
    }
  }
])

const completedPackages = ref<LessonPackage[]>([])
const error = ref('')
const success = ref('')
const isLoading = ref(false)
const showCancelDialog = ref(false)
const cancelReason = ref('')
const selectedLesson = ref<{date: string, packageId: number} | null>(null)

const validatePersonalInfo = (): string[] => {
  const errors: string[] = []
  if (!personalInfo.value.firstName) errors.push('Voornaam is verplicht')
  if (!personalInfo.value.lastName) errors.push('Achternaam is verplicht')
  if (!personalInfo.value.address) errors.push('Adres is verplicht')
  if (!personalInfo.value.city) errors.push('Woonplaats is verplicht')
  if (!personalInfo.value.dateOfBirth) errors.push('Geboortedatum is verplicht')
  if (!personalInfo.value.phone) errors.push('Telefoonnummer is verplicht')
  return errors
}

const handleUpdateProfile = async () => {
  error.value = ''
  const errors = validatePersonalInfo()

  if (errors.length > 0) {
    error.value = errors.join(', ')
    return
  }

  try {
    isLoading.value = true
    success.value = 'Profiel bijgewerkt'
  } catch (e) {
    error.value = 'Er is een fout opgetreden bij het bijwerken van je profiel'
  } finally {
    isLoading.value = false
  }
}

const handleCancelLesson = async () => {
  if (!selectedLesson.value || !cancelReason.value) {
    error.value = 'Geef een reden op voor annulering'
    return
  }

  try {
    isLoading.value = true
    const packageIndex = activePackages.value.findIndex(p => p.id === selectedLesson.value?.packageId)
    if (packageIndex >= 0) {
      const lessonIndex = activePackages.value[packageIndex].dates.findIndex(
          d => d.date === selectedLesson.value?.date
      )
      if (lessonIndex >= 0) {
        activePackages.value[packageIndex].dates[lessonIndex].status = 'cancelled'
      }
    }
    success.value = 'Les geannuleerd. Na goedkeuring kun je een nieuwe datum kiezen.'
    showCancelDialog.value = false
    cancelReason.value = ''
    selectedLesson.value = null
  } catch (e) {
    error.value = 'Er is een fout opgetreden bij het annuleren van de les'
  } finally {
    isLoading.value = false
  }
}

const confirmPayment = async (packageId: number) => {
  try {
    isLoading.value = true
    const packageIndex = activePackages.value.findIndex(p => p.id === packageId)
    if (packageIndex >= 0) {
      activePackages.value[packageIndex].status = 'paid'
      success.value = 'Betaling geregistreerd. Je ontvangt een bevestiging per e-mail.'
    }
  } catch (e) {
    error.value = 'Er is een fout opgetreden bij het registreren van de betaling'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  try {
    isLoading.value = true
    personalInfo.value = {
      firstName: 'Test',
      lastName: 'Gebruiker',
      address: 'Teststraat 1',
      city: 'Amsterdam',
      dateOfBirth: '1990-01-01',
      phone: '0612345678',
      email: 'test@example.com'
    }
  } catch (e) {
    error.value = 'Er is een fout opgetreden bij het laden van je gegevens'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Welkom {{ personalInfo.firstName }}</h1>

    <Tabs defaultValue="profile" class="space-y-4">
      <TabsList>
        <TabsTrigger value="profile">Profiel</TabsTrigger>
        <TabsTrigger value="packages">Lespakketten</TabsTrigger>
        <TabsTrigger value="schedule">Lesrooster</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Persoonlijke gegevens</CardTitle>
            <CardDescription>
              Beheer hier je persoonlijke gegevens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="handleUpdateProfile" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label for="firstName" class="block font-medium">Voornaam</label>
                  <Input
                      id="firstName"
                      v-model="personalInfo.firstName"
                      required
                      :disabled="isLoading"
                  />
                </div>
                <div class="space-y-2">
                  <label for="lastName" class="block font-medium">Achternaam</label>
                  <Input
                      id="lastName"
                      v-model="personalInfo.lastName"
                      required
                      :disabled="isLoading"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label for="address" class="block font-medium">Adres</label>
                <Input
                    id="address"
                    v-model="personalInfo.address"
                    required
                    :disabled="isLoading"
                />
              </div>

              <div class="space-y-2">
                <label for="city" class="block font-medium">Woonplaats</label>
                <Input
                    id="city"
                    v-model="personalInfo.city"
                    required
                    :disabled="isLoading"
                />
              </div>

              <div class="space-y-2">
                <label for="dateOfBirth" class="block font-medium">Geboortedatum</label>
                <Input
                    id="dateOfBirth"
                    v-model="personalInfo.dateOfBirth"
                    type="date"
                    required
                    :disabled="isLoading"
                />
              </div>

              <div class="space-y-2">
                <label for="phone" class="block font-medium">Telefoonnummer</label>
                <Input
                    id="phone"
                    v-model="personalInfo.phone"
                    type="tel"
                    required
                    :disabled="isLoading"
                />
              </div>

              <div class="space-y-2">
                <label for="email" class="block font-medium">E-mailadres</label>
                <Input
                    id="email"
                    v-model="personalInfo.email"
                    type="email"
                    required
                    disabled
                />
              </div>

              <Alert v-if="error" variant="destructive">
                <AlertDescription>{{ error }}</AlertDescription>
              </Alert>

              <Alert v-if="success" variant="default">
                <AlertDescription>{{ success }}</AlertDescription>
              </Alert>

              <Button type="submit" :disabled="isLoading">
                {{ isLoading ? 'Bezig...' : 'Opslaan' }}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="packages">
        <div class="space-y-4">
          <Card v-for="pkg in activePackages" :key="pkg.id">
            <CardHeader>
              <CardTitle>{{ pkg.name }}</CardTitle>
              <CardDescription>
                {{ pkg.lessons }} lessen - {{ pkg.location }}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="font-medium">Prijs: €{{ pkg.price }}</p>
                    <p class="text-sm text-gray-600">
                      Status: {{ pkg.status === 'paid' ? 'Betaald' : 'Niet betaald' }}
                    </p>
                  </div>
                  <Button
                      v-if="pkg.status === 'pending'"
                      @click="confirmPayment(pkg.id)"
                      :disabled="isLoading"
                  >
                    Bevestig betaling
                  </Button>
                </div>

                <div v-if="pkg.isDuo && pkg.duoPartner" class="border-t pt-4">
                  <h4 class="font-medium mb-2">Duo-partner</h4>
                  <p>{{ pkg.duoPartner.firstName }} {{ pkg.duoPartner.lastName }}</p>
                  <p class="text-sm text-gray-600">{{ pkg.duoPartner.email }}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button @click="router.push('/packages')" class="w-full">
            Nieuw lespakket reserveren
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="schedule">
        <Card>
          <CardHeader>
            <CardTitle>Lesrooster</CardTitle>
            <CardDescription>
              Overzicht van je geplande lessen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div v-for="pkg in activePackages" :key="pkg.id">
                <h3 class="font-medium mb-2">{{ pkg.name }}</h3>
                <div class="space-y-2">
                  <div
                      v-for="lesson in pkg.dates"
                      :key="lesson.date"
                      class="border p-4 rounded"
                  >
                    <div class="flex justify-between items-center">
                      <div>
                        <p class="font-medium">
                          {{ new Date(lesson.date).toLocaleDateString() }} - {{ lesson.time }}
                        </p>
                        <p class="text-sm text-gray-600">
                          {{ lesson.location }} - {{ lesson.instructor }}
                        </p>
                        <p class="text-sm" :class="{
                          'text-green-600': lesson.status === 'scheduled',
                          'text-red-600': lesson.status === 'cancelled'
                        }">
                          {{
                            lesson.status === 'scheduled' ? 'Gepland' :
                                lesson.status === 'completed' ? 'Afgerond' :
                                    'Geannuleerd'
                          }}
                        </p>
                      </div>
                      <Button
                          v-if="lesson.status === 'scheduled'"
                          variant="destructive"
                          @click="() => {
                          selectedLesson = { date: lesson.date, packageId: pkg.id }
                          showCancelDialog = true
                        }"
                      >
                        Annuleren
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div v-if="showCancelDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card class="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Les annuleren</CardTitle>
              <CardDescription>
                Geef een reden op voor het annuleren van de les
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form @submit.prevent="handleCancelLesson" class="space-y-4">
                <div class="space-y-2">
                  <label for="cancelReason" class="block font-medium">Reden</label>
                  <Input
                      id="cancelReason"
                      v-model="cancelReason"
                      required
                      :disabled="isLoading"
                  />
                </div>

                <Alert v-if="error" variant="destructive">
                  <AlertDescription>{{ error }}</AlertDescription>
                </Alert>

                <div class="flex justify-end space-x-2">
                  <Button
                      type="button"
                      variant="outline"
                      @click="showCancelDialog = false"
                      :disabled="isLoading"
                  >
                    Annuleren
                  </Button>
                  <Button
                      type="submit"
                      variant="destructive"
                      :disabled="isLoading"
                  >
                    Bevestigen
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
</style>