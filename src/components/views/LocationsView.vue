<template>
  <section class="section locations-section">
    <h2 class="text-4xl font-bold tracking-tighter text-center mb-16">
      Onze Locaties
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
          v-for="location in locations"
          :key="location.id"
          class="location-card group"
      >
        <div class="relative aspect-[16/9] overflow-hidden">
          <img
              :src="location.image"
              :alt="location.name"
              class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div class="p-6">
          <h3 class="text-2xl font-semibold mb-2">{{ location.name }}</h3>
          <p class="text-muted-foreground">{{ location.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Import images
import zandvoortImg from '@/assets/images/locations/zandvoort.jpg'
import muiderbergImg from '@/assets/images/locations/muiderberg.jpg'
import wijkaanzeeImg from '@/assets/images/locations/wijk-aan-zee.jpg'
import ijmuidenImg from '@/assets/images/locations/ijmuiden.jpg'
import scheveningenImg from '@/assets/images/locations/scheveningen.jpg'
import hoekvanhollandImg from '@/assets/images/locations/hoek-van-holland.jpg'

interface Location {
  id: number
  name: string
  image: string
  description: string
}

const locations: Location[] = [
  {
    id: 1,
    name: 'Zandvoort',
    image: zandvoortImg,
    description: 'Perfect voor beginners met brede stranden en consistente wind.'
  },
  {
    id: 2,
    name: 'Muiderberg',
    image: muiderbergImg,
    description: 'Ideaal voor lessen bij noordelijke wind.'
  },
  {
    id: 3,
    name: 'Wijk aan Zee',
    image: wijkaanzeeImg,
    description: 'Uitstekende condities voor gevorderden.'
  },
  {
    id: 4,
    name: 'IJmuiden',
    image: ijmuidenImg,
    description: 'Populaire spot met betrouwbare windcondities.'
  },
  {
    id: 5,
    name: 'Scheveningen',
    image: scheveningenImg,
    description: 'Centrale locatie met uitstekende faciliteiten.'
  },
  {
    id: 6,
    name: 'Hoek van Holland',
    image: hoekvanhollandImg,
    description: 'Geschikt voor alle niveaus met diverse windrichtingen.'
  }
]
</script>

<style scoped>
.section {
  @apply py-16 px-4;
}

.location-card {
  @apply bg-card rounded-lg overflow-hidden;
  @apply border border-border;
  @apply transition-all duration-300 ease-in-out;
}

.location-card:hover {
  @apply shadow-lg;
}

/* Dark mode specific styles */
:root[class~="dark"] .location-card {
  @apply bg-card border-border;
}

:root[class~="dark"] .location-card h3 {
  @apply text-foreground;
}

:root[class~="dark"] .location-card p {
  @apply text-muted-foreground;
}

/* Responsive adjustments */
@screen sm {
  .section {
    @apply px-6;
  }
}

@screen lg {
  .section {
    @apply px-8;
  }
}
</style>