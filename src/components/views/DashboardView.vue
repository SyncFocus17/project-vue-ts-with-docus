<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useUserStore } from '@/stores/user'
import { useToast } from '@/components/ui/toast/use-toast'

interface UserData {
  role: 'customer' | 'instructor' | 'owner'
  name: string
  email: string
  address: string
  city: string
  birthDate: string
  phone: string
  bsnNumber?: string
  reservations?: any[]
  assignedStudents?: any[]
}

const router = useRouter()
const userStore = useUserStore()
const { toast } = useToast()

const userData = ref<UserData | null>(null)
const loading = ref(true)
const reservations = ref([])
const assignedStudents = ref([])

const fetchUserData = async () => {
  try {
    const data = await userStore.getUserData()
    userData.value = data
    if (data.role === 'customer') {
      reservations.value = await userStore.getCustomerReservations()
    } else if (data.role === 'instructor' || data.role === 'owner') {
      assignedStudents.value = await userStore.getAssignedStudents()
    }
  } catch (error) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to load user data',
    })
    router.push('/login')
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  try {
    await userStore.logout()
    router.push('/login')
  } catch (error) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to logout',
    })
  }
}

onMounted(() => {
  fetchUserData()
})

const renderCustomerDashboard = () => {
  return (
      <div class="space-y-6">
          <Card>
              <CardHeader>
                  <CardTitle>My Reservations</CardTitle>
  </CardHeader>
  <CardContent>
  <div class="space-y-4">
      {reservations.value.map((reservation) => (
            <div key={reservation.id} class="p-4 border rounded-lg">
        <p>Package: {reservation.packageType}</p>
  <p>Date: {reservation.date}</p>
  <p>Status: {reservation.status}</p>
  <p>Location: {reservation.location}</p>
  </div>
))}
  <Button @click="router.push('/book-lesson')">Book New Lesson</Button>
  </div>
  </CardContent>
  </Card>
  </div>
)
}

const renderInstructorDashboard = () => {
  return (
      <div class="space-y-6">
          <Card>
              <CardHeader>
                  <CardTitle>My Students</CardTitle>
  </CardHeader>
  <CardContent>
  <div class="space-y-4">
      {assignedStudents.value.map((student) => (
            <div key={student.id} class="p-4 border rounded-lg">
        <p>Student: {student.name}</p>
  <p>Lesson Date: {student.lessonDate}</p>
  <p>Package: {student.packageType}</p>
  <Button
  variant="outline"
@click="router.push(`/student/${student.id}`)"
      >
      Manage Student
  </Button>
  </div>
))}
  </div>
  </CardContent>
  </Card>
  </div>
)
}

const renderOwnerDashboard = () => {
  return (
      <div class="space-y-6">
          <Card>
              <CardHeader>
                  <CardTitle>School Overview</CardTitle>
  </CardHeader>
  <CardContent>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Button @click="router.push('/manage-instructors')">
      Manage Instructors
  </Button>
  <Button @click="router.push('/manage-customers')">
      Manage Customers
  </Button>
  <Button @click="router.push('/manage-reservations')">
      Manage Reservations
  </Button>
  </div>
  </CardContent>
  </Card>
  </div>
)
}
</script>

<template>
  <div class="container py-10">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">
          Welcome, {{ userData?.name || 'User' }}
        </h1>
        <p class="text-muted-foreground">
          Role: {{ userData?.role?.charAt(0).toUpperCase() + userData?.role?.slice(1) }}
        </p>
      </div>
      <Button variant="outline" @click="handleLogout">Logout</Button>
    </div>

    <div v-if="loading" class="text-center">
      <p>Loading...</p>
    </div>

    <template v-else>
      <component
          :is="
          userData?.role === 'customer'
            ? renderCustomerDashboard
            : userData?.role === 'instructor'
            ? renderInstructorDashboard
            : renderOwnerDashboard
        "
      />
    </template>
  </div>
</template>