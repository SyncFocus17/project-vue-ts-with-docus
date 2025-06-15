<script setup lang="ts">
import { useRoute } from "vue-router";
import Navbar from "./components/views/Navbar.vue";
import Footer from "./components/views/Footer.vue";
const route = useRoute();
</script>

<template>
  <Navbar />
  <router-view />
  <Footer />
</template>