<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'

interface InstructorInfo {
  firstName: string
  lastName: string
  address: string
  city: string
  dateOfBirth: string
  phone: string
  email: string
  bsn: string
}

interface Student {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  dateOfBirth: string
  packages: Array<{
    id: number
    name: string
    lessons: number
    location: string
    isDuo: boolean
    duoPartner?: {
      firstName: string
      lastName: string
      email: string
    }
    dates: Array<{
      date: string
      time: string
      status: 'scheduled' | 'completed' | 'cancelled'
    }>
  }>
}

const instructorInfo = ref<InstructorInfo>({
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  dateOfBirth: '',
  phone: '',
  email: '',
  bsn: ''
})

const students = ref<Student[]>([])
const selectedStudent = ref<Student | null>(null)
const selectedDate = ref<Date>(new Date())
const error = ref('')
const success = ref('')
const isLoading = ref(false)
const viewMode = ref<'day' | 'week' | 'month'>('day')

const validateInstructorInfo = (): string[] => {
  const errors: string[] = []
  if (!instructorInfo.value.firstName) errors.push('Voornaam is verplicht')
  if (!instructorInfo.value.lastName) errors.push('Achternaam is verplicht')
  if (!instructorInfo.value.address) errors.push('Adres is verplicht')
  if (!instructorInfo.value.city) errors.push('Woonplaats is verplicht')
  if (!instructorInfo.value.dateOfBirth) errors.push('Geboortedatum is verplicht')
  if (!instructorInfo.value.phone) errors.push('Telefoonnummer is verplicht')
  if (!instructorInfo.value.bsn) errors.push('BSN is verplicht')
  return errors
}

const handleUpdateProfile = async () => {
  error.value = ''
  const errors = validateInstructorInfo()

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

const sendCancellationEmail = async (student: Student, lesson: any, reason: 'weather' | 'illness') => {
  try {
    isLoading.value = true

    const emailTemplate = {
      to: student.email,
      subject: `Les geannuleerd - ${reason === 'weather' ? 'Weersomstandigheden' : 'Instructeur niet beschikbaar'}`,
      body: `
        Beste ${student.firstName},

        Helaas moeten we je les van ${new Date(lesson.date).toLocaleDateString()} ${lesson.time} annuleren
        vanwege ${reason === 'weather' ? 'slechte weersomstandigheden (windkracht >10)' : 'ziekte van de instructeur'}.

        We nemen binnenkort contact met je op om een nieuwe datum in te plannen.

        Met vriendelijke groet,
        Team Windkracht-12
      `
    }

    lesson.status = 'cancelled'
    success.value = 'Annuleringsmail verstuurd naar klant'
  } catch (e) {
    error.value = 'Er is een fout opgetreden bij het versturen van de annuleringsmail'
  } finally {
    isLoading.value = false
  }
}

const getLessonsForView = () => {
  const lessons: any[] = []
  students.value.forEach(student => {
    student.packages.forEach(pkg => {
      pkg.dates.forEach(lesson => {
        const lessonDate = new Date(lesson.date)
        const selectedDateValue = selectedDate.value

        if (viewMode.value === 'day') {
          if (lessonDate.toDateString() === selectedDateValue.toDateString()) {
            lessons.push({...lesson, student, package: pkg})
          }
        } else if (viewMode.value === 'week') {
          const weekStart = new Date(selectedDateValue)
          weekStart.setDate(selectedDateValue.getDate() - selectedDateValue.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)

          if (lessonDate >= weekStart && lessonDate <= weekEnd) {
            lessons.push({...lesson, student, package: pkg})
          }
        } else if (viewMode.value === 'month') {
          if (lessonDate.getMonth() === selectedDateValue.getMonth() &&
              lessonDate.getFullYear() === selectedDateValue.getFullYear()) {
            lessons.push({...lesson, student, package: pkg})
          }
        }
      })
    })
  })

  return lessons.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

onMounted(async () => {
  try {
    isLoading.value = true
    instructorInfo.value = {
      firstName: 'Duco',
      lastName: 'Veenstra',
      address: 'Instructeurstraat 1',
      city: 'Utrecht',
      dateOfBirth: '1985-01-01',
      phone: '0612345678',
      email: 'duco@windkracht-12.nl',
      bsn: '123456789'
    }

    students.value = [
      {
        id: 1,
        firstName: 'Test',
        lastName: 'Student',
        email: 'student@example.com',
        phone: '0687654321',
        address: 'Studentstraat 1',
        city: 'Amsterdam',
        dateOfBirth: '1995-01-01',
        packages: [
          {
            id: 1,
            name: 'Kitesurf Duo lespakket 5 lessen',
            lessons: 5,
            location: 'Scheveningen',
            isDuo: true,
            duoPartner: {
              firstName: 'Partner',
              lastName: 'Test',
              email: 'partner@example.com'
            },
            dates: [
              {
                date: '2025-06-15',
                time: '10:00',
                status: 'scheduled'
              },
              {
                date: '2025-06-22',
                time: '10:00',
                status: 'scheduled'
              }
            ]
          }
        ]
      }
    ]
  } catch (e) {
    error.value = 'Er is een fout opgetreden bij het laden van je gegevens'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Welkom {{ instructorInfo.firstName }}</h1>

    <Tabs defaultValue="profile" class="space-y-4">
      <TabsList>
        <TabsTrigger value="profile">Profiel</TabsTrigger>
        <TabsTrigger value="schedule">Lesrooster</TabsTrigger>
        <TabsTrigger value="students">Klanten</TabsTrigger>
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
                      v-model="instructorInfo.firstName"
                      required
                      :disabled="isLoading"
                  />
                </div>
                <div class="space-y-2">
                  <label for="lastName" class="block font-medium">Achternaam</label>
                  <Input
                      id="lastName"
                      v-model="instructorInfo.lastName"
                      required
                      :disabled="isLoading"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label for="address" class="block font-medium">Adres</label>
                <Input
                    id="address"
                    v-model="instructorInfo.address"
                    required
                    :disabled="isLoading"
                />
              </div>

              <div class="space-y-2">
                <label for="city" class="block font-medium">Woonplaats</label>
                <Input
                    id="city"
                    v-model="instructorInfo.city"
                    required
                    :disabled="isLoading"
                />
              </div>

              <div class="space-y-2">
                <label for="dateOfBirth" class="block font-medium">Geboortedatum</label>
                <Input
                    id="dateOfBirth"
                    v-model="instructorInfo.dateOfBirth"
                    type="date"
                    required
                    :disabled="isLoading"
                />
              </div>

              <div class="space-y-2">
                <label for="phone" class="block font-medium">Telefoonnummer</label>
                <Input
                    id="phone"
                    v-model="instructorInfo.phone"
                    type="tel"
                    required
                    :disabled="isLoading"
                />
              </div>

              <div class="space-y-2">
                <label for="email" class="block font-medium">E-mailadres</label>
                <Input
                    id="email"
                    v-model="instructorInfo.email"
                    type="email"
                    required
                    disabled
                />
              </div>

              <div class="space-y-2">
                <label for="bsn" class="block font-medium">BSN-nummer</label>
                <Input
                    id="bsn"
                    v-model="instructorInfo.bsn"
                    required
                    :disabled="isLoading"
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

      <TabsContent value="schedule">
        <Card>
          <CardHeader>
            <CardTitle>Lesrooster</CardTitle>
            <CardDescription>
              Bekijk en beheer je lessen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex space-x-4 mb-4">
                <Button
                    v-for="mode in ['day', 'week', 'month']"
                    :key="mode"
                    :variant="viewMode === mode ? 'default' : 'outline'"
                    @click="viewMode = mode as any"
                >
                  {{ mode === 'day' ? 'Dag' : mode === 'week' ? 'Week' : 'Maand' }}
                </Button>
              </div>

              <Calendar
                  v-model="selectedDate"
                  class="mb-4"
              />

              <div class="space-y-4">
                <div
                    v-for="lesson in getLessonsForView()"
                    :key="`${lesson.student.id}-${lesson.date}`"
                    class="border p-4 rounded"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="font-medium">
                        {{ new Date(lesson.date).toLocaleDateString() }} - {{ lesson.time }}
                      </p>
                      <p class="text-sm text-gray-600">
                        {{ lesson.student.firstName }} {{ lesson.student.lastName }}
                      </p>
                      <p class="text-sm text-gray-600">
                        {{ lesson.package.name }} - {{ lesson.package.location }}
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
                    <div v-if="lesson.status === 'scheduled'" class="space-x-2">
                      <Button
                          variant="destructive"
                          @click="sendCancellationEmail(lesson.student, lesson, 'weather')"
                          :disabled="isLoading"
                      >
                        Annuleren (weer)
                      </Button>
                      <Button
                          variant="destructive"
                          @click="sendCancellationEmail(lesson.student, lesson, 'illness')"
                          :disabled="isLoading"
                      >
                        Annuleren (ziek)
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="students">
        <Card>
          <CardHeader>
            <CardTitle>Klanten</CardTitle>
            <CardDescription>
              Beheer je klanten en hun lespakketten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div v-for="student in students" :key="student.id" class="border p-4 rounded">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-medium">{{ student.firstName }} {{ student.lastName }}</h3>
                    <p class="text-sm text-gray-600">{{ student.email }}</p>
                    <p class="text-sm text-gray-600">{{ student.phone }}</p>
                  </div>
                  <Button @click="selectedStudent = student">
                    Details
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div v-if="selectedStudent" class="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card class="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>{{ selectedStudent.firstName }} {{ selectedStudent.lastName }}</CardTitle>
              <CardDescription>
                Klantgegevens en lespakketten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-6">
                <div>
                  <h4 class="font-medium mb-2">Persoonlijke gegevens</h4>
                  <div class="grid grid-cols-2 gap-4">
                    <p><span class="font-medium">E-mail:</span> {{ selectedStudent.email }}</p>
                    <p><span class="font-medium">Telefoon:</span> {{ selectedStudent.phone }}</p>
                    <p><span class="font-medium">Adres:</span> {{ selectedStudent.address }}</p>
                    <p><span class="font-medium">Woonplaats:</span> {{ selectedStudent.city }}</p>
                    <p><span class="font-medium">Geboortedatum:</span> {{ selectedStudent.dateOfBirth }}</p>
                  </div>
                </div>

                <div>
                  <h4 class="font-medium mb-2">Lespakketten</h4>
                  <div class="space-y-4">
                    <div
                        v-for="pkg in selectedStudent.packages"
                        :key="pkg.id"
                        class="border p-4 rounded"
                    >
                      <h5 class="font-medium">{{ pkg.name }}</h5>
                      <p class="text-sm text-gray-600">{{ pkg.location }}</p>

                      <div v-if="pkg.isDuo && pkg.duoPartner" class="mt-2">
                        <p class="font-medium">Duo-partner</p>
                        <p class="text-sm">{{ pkg.duoPartner.firstName }} {{ pkg.duoPartner.lastName }}</p>
                        <p class="text-sm text-gray-600">{{ pkg.duoPartner.email }}</p>
                      </div>

                      <div class="mt-4">
                        <p class="font-medium mb-2">Lessen</p>
                        <div class="space-y-2">
                          <div
                              v-for="lesson in pkg.dates"
                              :key="lesson.date"
                              class="flex justify-between items-center"
                          >
                            <div>
                              <p>{{ new Date(lesson.date).toLocaleDateString() }} - {{ lesson.time }}</p>
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
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-6 flex justify-end">
                <Button @click="selectedStudent = null">
                  Sluiten
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>

    <Alert v-if="error" variant="destructive" class="mt-4">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <Alert v-if="success" variant="default" class="mt-4">
      <AlertDescription>{{ success }}</AlertDescription>
    </Alert>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
</style>