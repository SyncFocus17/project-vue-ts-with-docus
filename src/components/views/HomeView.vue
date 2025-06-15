<template>
  <main class="min-h-screen">
    <Hero />
    <LocationsPreview />
    <FAQ />
  </main>
</template>

<script setup lang="ts">
import Hero from "@/components/views/Hero.vue"
import LocationsPreview from "@/components/views/WeatherView.vue"
import FAQ from "@/components/views/FAQ.vue"
</script>