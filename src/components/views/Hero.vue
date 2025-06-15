<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-vue-next"
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="container">
    <div class="grid place-items-center lg:max-w-screen-xl gap-8 mx-auto py-20 md:py-32">
      <div class="text-center space-y-8">
        <Badge variant="outline" class="text-sm py-2">
          <span class="mr-2">
            <Badge variant="default" class="text-background">Boek</Badge>
          </span>
          <span>jouw lessen nu!</span>
        </Badge>

        <div class="max-w-screen-md mx-auto text-center">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Welkom bij
            <span class="text-transparent bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text">
              Kitesurfschool Windkracht-12
            </span>
          </h1>
        </div>

        <p class="max-w-screen-sm mx-auto text-xl text-muted-foreground">
          Wij bieden de beste kitesurflessen in Nederland aan op verschillende locaties langs de kust.
          Boek nu jouw les en begin je kitesurfavontuur.
        </p>

        <div class="flex flex-col md:flex-row justify-center gap-4 md:gap-6">
          <RouterLink to="/pakketten" class="w-full md:w-auto">
            <Button class="w-full md:w-auto min-w-[200px] font-bold group">
              Boek Lessen
              <ArrowRight
                  class="size-5 ml-2 group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
              />
            </Button>
          </RouterLink>

          <RouterLink to="/contact" class="w-full md:w-auto">
            <Button
                variant="secondary"
                class="w-full md:w-auto min-w-[200px] font-bold"
            >
              Contact Opnemen
            </Button>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.container {
  @apply relative mx-auto px-4 md:px-6;
}

section::before {
  content: '';
  @apply absolute inset-0 bg-gradient-to-b from-background to-background/50 -z-10;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.text-center > * {
  animation: fadeInUp 0.5s ease-out forwards;
  opacity: 0;
}

.text-center > *:nth-child(1) { animation-delay: 0.1s; }
.text-center > *:nth-child(2) { animation-delay: 0.2s; }
.text-center > *:nth-child(3) { animation-delay: 0.3s; }
.text-center > *:nth-child(4) { animation-delay: 0.4s; }
</style>