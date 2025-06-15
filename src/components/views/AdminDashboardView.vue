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

interface AdminInfo {
  firstName: string
  lastName: string
  address: string
  city: string
  dateOfBirth: string
  phone: string
  email: string
  bsn: string
}

interface Instructor {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  dateOfBirth: string
  bsn: string
  isActive: boolean
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
  isActive: boolean
  packages: Array<{
    id: number
    name: string
    price: number
    lessons: number
    location: string
    isDuo: boolean
    status: 'pending' | 'paid' | 'cancelled'
    duoPartner?: {
      firstName: string
      lastName: string
      email: string
    }
    dates: Array<{
      date: string
      time: string
      instructor: string
      status: 'scheduled' | 'completed' | 'cancelled'
    }>
  }>
}

const adminInfo = ref<AdminInfo>({
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  dateOfBirth: '',
  phone: '',
  email: '',
  bsn: ''
})

const instructors = ref<Instructor[]>([])
const students = ref<Student[]>([])
const selectedInstructor = ref<Instructor | null>(null)
const selectedStudent = ref<Student | null>(null)
const selectedDate = ref<Date>(new Date())
const error = ref('')
const success = ref('')
const isLoading = ref(false)
const viewMode = ref<'day' | 'week' | 'month'>('day')
const showUserModal = ref(false)
const showConfirmModal = ref(false)
const modalAction = ref<'delete' | 'role' | 'payment' | null>(null)
const selectedUserId = ref<number | null>(null)

const validateAdminInfo = (): string[] => {
  const errors: string[] = []
  if (!adminInfo.value.firstName) errors.push('Voornaam is verplicht')
  if (!adminInfo.value.lastName) errors.push('Achternaam is verplicht')
  if (!adminInfo.value.address) errors.push('Adres is verplicht')
  if (!adminInfo.value.city) errors.push('Woonplaats is verplicht')
  if (!adminInfo.value.dateOfBirth) errors.push('Geboortedatum is verplicht')
  if (!adminInfo.value.phone) errors.push('Telefoonnummer is verplicht')
  if (!adminInfo.value.bsn) errors.push('BSN is verplicht')
  return errors
}

const handleUpdateProfile = async () => {
  error.value = ''
  const errors = validateAdminInfo()

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

const sendConfirmationEmail = async (student: Student, pkg: any) => {
  try {
    isLoading.value = true

    const emailTemplate = {
      to: [student.email, pkg.dates[0].instructor],
      subject: 'Lespakket bevestigd',
      body: `
        Beste ${student.firstName},

        Je reservering voor het ${pkg.name} is bevestigd.
        De eerste les staat gepland op ${new Date(pkg.dates[0].date).toLocaleDateString()} om ${pkg.dates[0].time}.

        Met vriendelijke groet,
        Team Windkracht-12
      `
    }

    pkg.status = 'paid'
    success.value = 'Bevestigingsmail verstuurd naar klant en instructeur'
  } catch (e) {
    error.value = 'Er is een fout opgetreden bij het versturen van de bevestigingsmail'
  } finally {
    isLoading.value = false
  }
}

const changeUserRole = async (userId: number, newRole: 'klant' | 'instructeur') => {
  try {
    isLoading.value = true
    const student = students.value.find(s => s.id === userId)
    if (student && newRole === 'instructeur') {
      const newInstructor: Instructor = {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        address: student.address,
        city: student.city,
        dateOfBirth: student.dateOfBirth,
        bsn: '',
        isActive: true
      }
      instructors.value.push(newInstructor)
      students.value = students.value.filter(s => s.id !== userId)
    }
    success.value = `Gebruiker gewijzigd naar ${newRole}`
    showConfirmModal.value = false
  } catch (e) {
    error.value = 'Er is een fout opgetreden bij het wijzigen van de gebruikersrol'
  } finally {
    isLoading.value = false
  }
}

const getLessonsForInstructor = (instructorId: number) => {
  const lessons: any[] = []
  students.value.forEach(student => {
    student.packages.forEach(pkg => {
      pkg.dates.forEach(lesson => {
        if (lesson.instructor === instructors.value.find(i => i.id === instructorId)?.email) {
          const lessonDate = new Date(lesson.date)
          const selectedDateValue = selectedDate.value

          if (viewMode.value === 'day' &&
              lessonDate.toDateString() === selectedDateValue.toDateString()) {
            lessons.push({...lesson, student, package: pkg})
          } else if (viewMode.value === 'week') {
            const weekStart = new Date(selectedDateValue)
            weekStart.setDate(selectedDateValue.getDate() - selectedDateValue.getDay())
            const weekEnd = new Date(weekStart)
            weekEnd.setDate(weekStart.getDate() + 6)

            if (lessonDate >= weekStart && lessonDate <= weekEnd) {
              lessons.push({...lesson, student, package: pkg})
            }
          } else if (viewMode.value === 'month' &&
              lessonDate.getMonth() === selectedDateValue.getMonth() &&
              lessonDate.getFullYear() === selectedDateValue.getFullYear()) {
            lessons.push({...lesson, student, package: pkg})
          }
        }
      })
    })
  })

  return lessons.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

const getUnpaidPackages = () => {
  const unpaid: any[] = []
  students.value.forEach(student => {
    student.packages.forEach(pkg => {
      if (pkg.status === 'pending') {
        unpaid.push({...pkg, student})
      }
    })
  })
  return unpaid
}

onMounted(async () => {
  try {
    isLoading.value = true
    adminInfo.value = {
      firstName: 'Terence',
      lastName: 'Olieslager',
      address: 'Eigenaarstraat 1',
      city: 'Utrecht',
      dateOfBirth: '1980-01-01',
      phone: '0612345678',
      email: 'terence@windkracht-12.nl',
      bsn: '123456789'
    }

    instructors.value = [
      {
        id: 1,
        firstName: 'Duco',
        lastName: 'Veenstra',
        email: 'duco@windkracht-12.nl',
        phone: '0612345678',
        address: 'Instructeurstraat 1',
        city: 'Utrecht',
        dateOfBirth: '1985-01-01',
        bsn: '123456789',
        isActive: true
      }
    ]

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
        isActive: true,
        packages: [
          {
            id: 1,
            name: 'Kitesurf Duo lespakket 5 lessen',
            price: 675,
            lessons: 5,
            location: 'Scheveningen',
            isDuo: true,
            status: 'pending',
            duoPartner: {
              firstName: 'Partner',
              lastName: 'Test',
              email: 'partner@example.com'
            },
            dates: [
              {
                date: '2025-06-15',
                time: '10:00',
                instructor: 'duco@windkracht-12.nl',
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
    <h1 class="text-2xl font-bold mb-6">Welkom {{ adminInfo.firstName }}</h1>

    <Tabs defaultValue="profile" class="space-y-4">
      <TabsList>
        <TabsTrigger value="profile">Profiel</TabsTrigger>
        <TabsTrigger value="instructors">Instructeurs</TabsTrigger>
        <TabsTrigger value="students">Klanten</TabsTrigger>
        <TabsTrigger value="payments">Betalingen</TabsTrigger>
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
                      v-model="adminInfo.firstName"
                      required
                      :disabled="isLoading"
                  />
                </div>
                <div class="space-y-2">
                  <label for="lastName" class="block font-medium">Achternaam</label>
                  <Input
                      id="lastName"
                      v-model="adminInfo.lastName"
                      required
                      :disabled="isLoading"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label for="address" class="block font-medium">Adres</label>
                <Input
                    id="address"
                    v-model="adminInfo.address"
                    required
                    :disabled="isLoading"
                />
              </div>

              <div class="space-y-2">
                <label for="city" class="block font-medium">Woonplaats</label>
                <Input
                    id="city"
                    v-model="adminInfo.city"
                    required
                    :disabled="isLoading"
                />
              </div>

              <div class="space-y-2">
                <label for="dateOfBirth" class="block font-medium">Geboortedatum</label>
                <Input
                    id="dateOfBirth"
                    v-model="adminInfo.dateOfBirth"
                    type="date"
                    required
                    :disabled="isLoading"
                />
              </div>

              <div class="space-y-2">
                <label for="phone" class="block font-medium">Telefoonnummer</label>
                <Input
                    id="phone"
                    v-model="adminInfo.phone"
                    type="tel"
                    required
                    :disabled="isLoading"
                />
              </div>

              <div class="space-y-2">
                <label for="email" class="block font-medium">E-mailadres</label>
                <Input
                    id="email"
                    v-model="adminInfo.email"
                    type="email"
                    required
                    disabled
                />
              </div>

              <div class="space-y-2">
                <label for="bsn" class="block font-medium">BSN-nummer</label>
                <Input
                    id="bsn"
                    v-model="adminInfo.bsn"
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

      <TabsContent value="instructors">
        <Card>
          <CardHeader>
            <CardTitle>Instructeurs</CardTitle>
            <CardDescription>
              Beheer alle instructeurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <div class="space-x-4">
                  <Button @click="viewMode = 'day'" :variant="viewMode === 'day' ? 'default' : 'outline'">
                    Dag
                  </Button>
                  <Button @click="viewMode = 'week'" :variant="viewMode === 'week' ? 'default' : 'outline'">
                    Week
                  </Button>
                  <Button @click="viewMode = 'month'" :variant="viewMode === 'month' ? 'default' : 'outline'">
                    Maand
                  </Button>
                </div>
                <Calendar v-model="selectedDate" class="max-w-xs" />
              </div>

              <div class="space-y-6">
                <div v-for="instructor in instructors" :key="instructor.id" class="border p-4 rounded">
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <h3 class="font-medium">{{ instructor.firstName }} {{ instructor.lastName }}</h3>
                      <p class="text-sm text-gray-600">{{ instructor.email }}</p>
                    </div>
                    <Button @click="selectedInstructor = instructor">
                      Details
                    </Button>
                  </div>

                  <div class="space-y-4">
                    <div
                        v-for="lesson in getLessonsForInstructor(instructor.id)"
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
              Beheer alle klanten
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
                  <div class="space-x-2">
                    <Button @click="selectedStudent = student">
                      Details
                    </Button>
                    <Button
                        variant="outline"
                        @click="() => {
                        selectedUserId = student.id
                        modalAction = 'role'
                        showConfirmModal = true
                      }"
                    >
                      Rol wijzigen
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="payments">
        <Card>
          <CardHeader>
            <CardTitle>Openstaande betalingen</CardTitle>
            <CardDescription>
              Beheer alle betalingen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div v-for="pkg in getUnpaidPackages()" :key="`${pkg.student.id}-${pkg.id}`" class="border p-4 rounded">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-medium">{{ pkg.student.firstName }} {{ pkg.student.lastName }}</h3>
                    <p class="text-sm text-gray-600">{{ pkg.name }}</p>
                    <p class="text-sm font-medium">€{{ pkg.price }}</p>
                  </div>
                  <Button
                      @click="() => {
                      sendConfirmationEmail(pkg.student, pkg)
                    }"
                      :disabled="isLoading"
                  >
                    Bevestig betaling
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <div v-if="selectedInstructor" class="fixed inset-0 bg-black/50 flex items-center justify-center">
      <Card class="w-full max-w-2xl mx-4">
        <CardHeader>
          <CardTitle>{{ selectedInstructor.firstName }} {{ selectedInstructor.lastName }}</CardTitle>
          <CardDescription>
            Instructeurgegevens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-6">
            <div>
              <h4 class="font-medium mb-2">Persoonlijke gegevens</h4>
              <div class="grid grid-cols-2 gap-4">
                <p><span class="font-medium">E-mail:</span> {{ selectedInstructor.email }}</p>
                <p><span class="font-medium">Telefoon:</span> {{ selectedInstructor.phone }}</p>
                <p><span class="font-medium">Adres:</span> {{ selectedInstructor.address }}</p>
                <p><span class="font-medium">Woonplaats:</span> {{ selectedInstructor.city }}</p>
                <p><span class="font-medium">Geboortedatum:</span> {{ selectedInstructor.dateOfBirth }}</p>
                <p><span class="font-medium">BSN:</span> {{ selectedInstructor.bsn }}</p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <Button @click="selectedInstructor = null">
              Sluiten
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

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
                  <div class="flex justify-between items-start">
                    <div>
                      <h5 class="font-medium">{{ pkg.name }}</h5>
                      <p class="text-sm text-gray-600">{{ pkg.location }}</p>
                      <p class="text-sm font-medium">€{{ pkg.price }}</p>
                      <p class="text-sm" :class="{
                        'text-yellow-600': pkg.status === 'pending',
                        'text-green-600': pkg.status === 'paid',
                        'text-red-600': pkg.status === 'cancelled'
                      }">
                        {{
                          pkg.status === 'pending' ? 'Niet betaald' :
                              pkg.status === 'paid' ? 'Betaald' :
                                  'Geannuleerd'
                        }}
                      </p>
                    </div>
                    <Button
                        v-if="pkg.status === 'pending'"
                        @click="sendConfirmationEmail(selectedStudent, pkg)"
                        :disabled="isLoading"
                    >
                      Bevestig betaling
                    </Button>
                  </div>

                  <div v-if="pkg.isDuo && pkg.duoPartner" class="mt-4">
                    <h6 class="font-medium">Duo-partner</h6>
                    <p>{{ pkg.duoPartner.firstName }} {{ pkg.duoPartner.lastName }}</p>
                    <p class="text-sm text-gray-600">{{ pkg.duoPartner.email }}</p>
                  </div>

                  <div class="mt-4">
                    <h6 class="font-medium mb-2">Lessen</h6>
                    <div class="space-y-2">
                      <div
                          v-for="lesson in pkg.dates"
                          :key="lesson.date"
                          class="flex justify-between items-center"
                      >
                        <div>
                          <p>{{ new Date(lesson.date).toLocaleDateString() }} - {{ lesson.time }}</p>
                          <p class="text-sm text-gray-600">{{ lesson.instructor }}</p>
                        </div>
                        <div v-if="lesson.status === 'scheduled'" class="space-x-2">
                          <Button
                              variant="destructive"
                              @click="sendCancellationEmail(selectedStudent, lesson, 'weather')"
                              :disabled="isLoading"
                          >
                            Annuleren (weer)
                          </Button>
                          <Button
                              variant="destructive"
                              @click="sendCancellationEmail(selectedStudent, lesson, 'illness')"
                              :disabled="isLoading"
                          >
                            Annuleren (ziek)
                          </Button>
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

    <div v-if="showConfirmModal" class="fixed inset-0 bg-black/50 flex items-center justify-center">
      <Card class="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>
            {{
              modalAction === 'role' ? 'Gebruikersrol wijzigen' :
                  modalAction === 'delete' ? 'Gebruiker verwijderen' :
                      'Bevestig betaling'
            }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <p>Weet je zeker dat je deze actie wilt uitvoeren?</p>

            <div class="flex justify-end space-x-2">
              <Button
                  variant="outline"
                  @click="showConfirmModal = false"
                  :disabled="isLoading"
              >
                Annuleren
              </Button>
              <Button
                  :variant="modalAction === 'delete' ? 'destructive' : 'default'"
                  @click="() => {
                  if (modalAction === 'role' && selectedUserId) {
                    changeUserRole(selectedUserId, 'instructeur')
                  }
                }"
                  :disabled="isLoading"
              >
                Bevestigen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

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