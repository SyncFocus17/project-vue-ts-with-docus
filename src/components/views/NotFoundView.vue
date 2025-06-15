<template>
  <div class="flex flex-col min-h-screen items-center justify-center bg-background text-center px-4">
    <h1 class="text-6xl font-bold text-primary mb-4">404</h1>
    <h2 class="text-2xl font-semibold mb-2">Pagina niet gevonden</h2>
    <p class="text-muted-foreground mb-8 max-w-md">
      Oeps! De pagina die je zoekt bestaat niet of is verplaatst.<br>
      Controleer het webadres of ga terug naar de startpagina.
    </p>
    <router-link
        to="/"
        class="inline-block px-6 py-2 bg-primary text-white rounded-md font-semibold hover:bg-primary/80 transition"
    >
      Terug naar Home
    </router-link>
  </div>
</template>