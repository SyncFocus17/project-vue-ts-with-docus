<template>
  <section class="bg-muted/50 py-16">
    <div class="container">
      <!-- Title Section -->
      <div class="text-center space-y-4 mb-12">
        <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Actuele Surfcondities
        </h2>
        <p class="text-muted-foreground text-lg max-w-3xl mx-auto">
          Check de actuele windcondities op onze surflocaties.
          Lessen gaan door bij windkracht 3-10 Bft.
        </p>
      </div>

      <!-- Weather Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
            v-for="location in locations"
            :key="location.id"
            class="bg-card rounded-lg overflow-hidden border border-border transition-all hover:shadow-lg"
        >
          <!-- Location Header with Image -->
          <div class="relative h-40">
            <img
                :src="location.image"
                :alt="location.name"
                class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
              <div class="absolute bottom-4 left-4 text-white">
                <h3 class="text-xl font-bold">{{ location.name }}</h3>
                <p class="text-sm opacity-90">{{ formatTime(location.weather.timestamp) }}</p>
              </div>
            </div>
          </div>

          <!-- Weather Information -->
          <div class="p-6 space-y-6">
            <!-- Main Weather Stats -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <component
                    :is="getWeatherIcon(location.weather.condition)"
                    class="h-8 w-8 text-primary"
                />
                <div>
                  <p class="text-2xl font-bold">{{ location.weather.temperature }}°C</p>
                  <p class="text-sm text-muted-foreground">
                    Voelt als {{ location.weather.feelsLike }}°C
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold">{{ location.weather.windSpeed }} Bft</p>
                <p class="text-sm text-muted-foreground">{{ location.weather.windDirection }}</p>
              </div>
            </div>

            <!-- Detailed Weather Info -->
            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p class="text-sm text-muted-foreground">Golfhoogte</p>
                <p class="text-lg font-semibold">{{ location.weather.waveHeight }}m</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Windvlagen</p>
                <p class="text-lg font-semibold">{{ location.weather.windGusts }} Bft</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Luchtvochtigheid</p>
                <p class="text-lg font-semibold">{{ location.weather.humidity }}%</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Zicht</p>
                <p class="text-lg font-semibold">{{ location.weather.visibility }}km</p>
              </div>
            </div>

            <!-- Surfing Conditions Indicator -->
            <div class="pt-4 border-t border-border">
              <div class="flex items-center gap-2">
                <div
                    class="w-3 h-3 rounded-full"
                    :class="getConditionColor(location.weather.windSpeed)"
                ></div>
                <p class="text-sm">
                  {{ getConditionMessage(location.weather.windSpeed) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Update Section -->
      <div class="text-center mt-8 text-sm text-muted-foreground">
        <span>Laatste update: {{ formatTime(lastUpdate) }}</span>
        <Button
            variant="ghost"
            size="sm"
            class="ml-2"
            @click="refreshWeather"
            :disabled="isLoading"
        >
          <RefreshCcw
              class="h-4 w-4 mr-1"
              :class="{ 'animate-spin': isLoading }"
          />
          {{ isLoading ? 'Verversen...' : 'Verversen' }}
        </Button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Button } from "@/components/ui/button"
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  RefreshCcw
} from "lucide-vue-next"
import weatherService, { type Location } from '@/services/weatherService'

// State
const locations = ref<Location[]>([])
const lastUpdate = ref('')
const isLoading = ref(false)
let updateInterval: NodeJS.Timer

// Methods
const getWeatherIcon = (condition: string) => {
  switch (condition) {
    case 'sunny': return Sun
    case 'cloudy': return Cloud
    case 'rainy': return CloudRain
    case 'stormy': return CloudLightning
    default: return Sun
  }
}

const getConditionColor = (windSpeed: number) => {
  if (windSpeed < 3) return 'bg-red-500'
  if (windSpeed >= 3 && windSpeed <= 10) return 'bg-green-500'
  return 'bg-yellow-500'
}

const getConditionMessage = (windSpeed: number) => {
  if (windSpeed < 3) return 'Te weinig wind voor kitesurfen'
  if (windSpeed >= 3 && windSpeed <= 10) return 'Perfecte condities voor kitesurfen'
  return 'Let op: Harde wind, alleen voor ervaren kiters'
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchWeatherData = async () => {
  try {
    isLoading.value = true
    locations.value = await weatherService.getLocationsWeather()
    lastUpdate.value = new Date().toISOString()
  } catch (error) {
    console.error('Error fetching weather data:', error)
  } finally {
    isLoading.value = false
  }
}

const refreshWeather = async () => {
  try {
    isLoading.value = true
    locations.value = await weatherService.refreshWeather()
    lastUpdate.value = new Date().toISOString()
  } catch (error) {
    console.error('Error refreshing weather data:', error)
  } finally {
    isLoading.value = false
  }
}

// Lifecycle hooks
onMounted(async () => {
  await fetchWeatherData()
  updateInterval = setInterval(fetchWeatherData, 300000) // Update every 5 minutes
})

onUnmounted(() => {
  if (updateInterval) clearInterval(updateInterval)
})
</script>