<script setup lang="ts">
import { ChevronsDown } from "lucide-vue-next";
import Separator from "../ui/separator/Separator.vue";
</script>

<template>
  <footer
      id="footer"
      class="container py-24 pb-16 sm:py-32 sm:pb-24"
  >
    <div class="p-10 bg-muted/50 dark:bg-card border rounded-2xl">
      <div
          class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8"
      >
        <div class="col-span-full xl:col-span-2">
          <a
              href="#"
              class="flex font-bold items-center"
          >
            <ChevronsDown
                class="bg-gradient-to-tr from-primary via-primary/70 to-primary rounded-lg w-9 h-9 mr-2 border text-white"
            />

            <h3 class="text-2xl">Kitesurfschool Windkracht-12</h3>
          </a>
        </div>

        <div class="flex flex-col gap-2">
          <h3 class="font-bold text-lg">Account</h3>
          <div>
            <a
                href="#"
                class="opacity-60 hover:opacity-100"
            >
              Inloggen
            </a>
          </div>

          <div>
            <a
                href="#"
                class="opacity-60 hover:opacity-100"
            >
              Registreren
            </a>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <h3 class="font-bold text-lg">Hulp</h3>
          <div>
            <a
                href="#"
                class="opacity-60 hover:opacity-100"
            >
              Contact
            </a>
          </div>

          <div>
            <a
                href="#"
                class="opacity-60 hover:opacity-100"
            >
              E-Mail Ons
            </a>
          </div>

          <div>
            <a
                href="#"
                class="opacity-60 hover:opacity-100"
            >
              Bel Ons (+31 6 14141414)
            </a>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <h3 class="font-bold text-lg">Navigatie</h3>
          <div>
            <a
                href="#"
                class="opacity-60 hover:opacity-100"
            >
              Boeken
            </a>
          </div>

          <div>
            <a
                href="#"
                class="opacity-60 hover:opacity-100"
            >
              Planning
            </a>
          </div>

          <div>
            <a
                href="#"
                class="opacity-60 hover:opacity-100"
            >
              Locaties
            </a>
          </div>
        </div>
      </div>

      <Separator class="my-6" />
      <section>
        <h3>
          &copy; 2025 gemaakt door Kevin van Beek
          <a
              target="_blank"
              href="https://github.com/SyncFocus17"
              class="text-primary transition-all border-primary hover:border-b-2"
          >
            - Student MBO Utrecht.
          </a>
        </h3>
      </section>
    </div>
  </footer>
</template>