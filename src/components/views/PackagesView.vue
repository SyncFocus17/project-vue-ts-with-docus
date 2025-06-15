<script setup lang="ts">
import { ref } from 'vue'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'vue-router'
import { authService } from '@/services/AuthService'

const router = useRouter()

interface Package {
  id: number
  name: string
  duration: string
  price: number
  features: string[]
  maxStudents: number
  totalHours: number
  lessons: number
  highlight?: boolean
}

const packages = ref<Package[]>([
  {
    id: 1,
    name: 'Privéles',
    duration: '2,5 uur',
    price: 175,
    features: [
      'Één persoon per les',
      '1 dagdeel',
      'Inclusief alle materialen (kite, board, wetsuit)',
      'Persoonlijke instructeur',
      'Flexibele planning',
      'Locatie naar keuze'
    ],
    maxStudents: 1,
    totalHours: 2.5,
    lessons: 1
  },
  {
    id: 2,
    name: 'Losse Duo Kiteles',
    duration: '3,5 uur',
    price: 135,
    features: [
      'Maximaal 2 personen per les',
      '1 dagdeel',
      'Inclusief alle materialen (kite, board, wetsuit)',
      'Gedeelde instructeur',
      'Sociale ervaring',
      'Voordelig tarief'
    ],
    maxStudents: 2,
    totalHours: 3.5,
    lessons: 1,
    highlight: true
  },
  {
    id: 3,
    name: 'Kitesurf Duo Pakket (3 lessen)',
    duration: '10,5 uur',
    price: 375,
    features: [
      'Maximaal 2 personen per les',
      '3 dagdelen',
      'Inclusief alle materialen (kite, board, wetsuit)',
      'Consistente voortgang',
      'Dezelfde instructeur',
      'Voordeliger dan losse lessen'
    ],
    maxStudents: 2,
    totalHours: 10.5,
    lessons: 3
  },
  {
    id: 4,
    name: 'Kitesurf Duo Pakket (5 lessen)',
    duration: '17,5 uur',
    price: 675,
    features: [
      'Maximaal 2 personen per les',
      '5 dagdelen',
      'Inclusief alle materialen (kite, board, wetsuit)',
      'Complete opleiding',
      'Dezelfde instructeur',
      'Meest voordelige pakket'
    ],
    maxStudents: 2,
    totalHours: 17.5,
    lessons: 5,
    highlight: true
  }
])

const locations = [
  'Zandvoort',
  'Muiderberg',
  'Wijk aan Zee',
  'IJmuiden',
  'Scheveningen',
  'Hoek van Holland'
]

const handleReservation = async (packageId: number) => {
  if (!authService.isAuthenticated()) {
    router.push({
      path: '/login',
      query: { redirect: '/dashboard' }
    })
    return
  }
  router.push('/dashboard')
}
</script>

<template>
  <div class="bg-background py-16">
    <div class="container mx-auto px-4">
      <!-- Header Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">Kitesurfles Pakketten</h1>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
          Ontdek het kitesurfen met onze ervaren instructeurs. Alle pakketten zijn inclusief materialen
          en kunnen gevolgd worden op verschillende locaties in Nederland.
        </p>
      </div>

      <!-- Locations Section -->
      <div class="mb-12">
        <h2 class="text-2xl font-semibold text-center mb-4">Onze Locaties</h2>
        <div class="flex flex-wrap justify-center gap-2">
          <Badge
              v-for="location in locations"
              :key="location"
              variant="secondary"
              class="text-base py-2 px-4"
          >
            {{ location }}
          </Badge>
        </div>
      </div>

      <!-- Packages Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
            v-for="pkg in packages"
            :key="pkg.id"
            :class="[
            'flex flex-col',
            pkg.highlight ? 'border-primary shadow-lg' : ''
          ]"
        >
          <CardHeader>
            <CardTitle>{{ pkg.name }}</CardTitle>
            <CardDescription>
              {{ pkg.duration }} | {{ pkg.maxStudents === 1 ? 'Privé' : 'Max. 2 personen' }}
            </CardDescription>
          </CardHeader>
          <CardContent class="flex-grow">
            <div class="text-3xl font-bold mb-4">
              € {{ pkg.price }}
              <span class="text-base font-normal text-muted-foreground">per persoon</span>
            </div>
            <ul class="space-y-2">
              <li
                  v-for="(feature, index) in pkg.features"
                  :key="index"
                  class="flex items-start"
              >
                <svg
                    class="h-5 w-5 text-primary shrink-0 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                  <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                  />
                </svg>
                {{ feature }}
              </li>
            </ul>
          </CardContent>
          <CardFooter class="flex flex-col gap-4">
            <div class="text-sm text-muted-foreground">
              <div>Totaal {{ pkg.totalHours }} uur</div>
              <div>{{ pkg.lessons }} {{ pkg.lessons === 1 ? 'les' : 'lessen' }}</div>
            </div>
            <Button
                class="w-full"
                :variant="pkg.highlight ? 'default' : 'outline'"
                @click="handleReservation(pkg.id)"
            >
              Reserveer Nu
            </Button>
          </CardFooter>
        </Card>
      </div>

      <!-- Additional Info -->
      <div class="mt-12 text-center">
        <h2 class="text-2xl font-semibold mb-4">Ervaren Instructeurs</h2>
        <p class="text-muted-foreground max-w-2xl mx-auto mb-6">
          Onze gekwalificeerde instructeurs staan voor je klaar:
          Duco Veenstra, Waldemar van Dongen, Ruud Terlingen,
          Saskia Brink en Bernie Vredenstein.
        </p>
        <div class="flex flex-wrap justify-center gap-4 items-center">
          <Badge variant="outline" class="text-base py-2 px-4">
            Inclusief materiaal
          </Badge>
          <Badge variant="outline" class="text-base py-2 px-4">
            Flexibele planning
          </Badge>
          <Badge variant="outline" class="text-base py-2 px-4">
            Ervaren instructeurs
          </Badge>
          <Badge variant="outline" class="text-base py-2 px-4">
            Verschillende locaties
          </Badge>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1400px;
}

@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>