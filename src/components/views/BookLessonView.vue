<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import LessonPackageController from "@/components/controllers/PackageController";
import ReservationController from "@/components/controllers/ReservationController";
import type { PackageModel } from "@/components/models/PackageModel";
import type { ReservationModel } from "@/components/models/ReservationModel";
import Button from "@/components/ui/button/Button.vue";

interface DuoPartner {
  first_name: string;
  last_name: string;
  email: string;
}

const locations = [
  "Zandvoort",
  "Muiderberg",
  "Wijk aan Zee",
  "IJmuiden",
  "Scheveningen",
  "Hoek van Holland"
];

const defaultPackages = [
  {
    id: 1,
    name: "Privéles",
    description: "Privéles 2,5 uur – één persoon per les",
    price: 175,
    duration: 2.5,
    lessonCount: 1,
    maxPersons: 1
  },
  {
    id: 2,
    name: "Losse Duo Kiteles",
    description: "Losse Duo Kiteles 3,5 uur – maximaal 2 personen per les",
    price: 135,
    duration: 3.5,
    lessonCount: 1,
    maxPersons: 2
  },
  {
    id: 3,
    name: "Kitesurf Duo lespakket 3 lessen",
    description: "Kitesurf Duo lespakket 3 lessen 10,5 uur – maximaal 2 personen per les, 3 dagdelen",
    price: 375,
    duration: 3.5,
    lessonCount: 3,
    maxPersons: 2
  },
  {
    id: 4,
    name: "Kitesurf Duo lespakket 5 lessen",
    description: "Kitesurf Duo lespakket 5 lessen 17,5 uur – maximaal 2 personen per les, 5 dagdelen",
    price: 675,
    duration: 3.5,
    lessonCount: 5,
    maxPersons: 2
  }
];

const allPackages = ref<PackageModel[]>(defaultPackages);
const selectedPackage = ref<PackageModel | null>(null);
const selectedLocation = ref<string>("");
const selectedDates = ref<string[]>([]);
const availableDates = ref<string[]>([]);
const duoPartner = ref<DuoPartner>({
  first_name: "",
  last_name: "",
  email: ""
});

const isDuo = computed(() =>
    selectedPackage.value?.maxPersons && selectedPackage.value.maxPersons > 1
);

const lessonCount = computed(() =>
    selectedPackage.value?.lessonCount || 1
);

const error = ref<string | null>(null);
const success = ref<string | null>(null);
const isSubmitting = ref(false);

const router = useRouter();

const currentUser = ref<string>("syncfocusdev1");
const lastUpdated = ref<string>("2025-06-08 12:32:29");

onMounted(async () => {
  try {
    const packages = await LessonPackageController.getAll();
    if (packages && packages.length > 0) {
      allPackages.value = packages;
    }
    availableDates.value = generateAvailableDates(45);
  } catch (e: any) {
    error.value = "Kon lespakketten niet laden.";
  }
});

watch(selectedPackage, () => {
  availableDates.value = generateAvailableDates(45);
  selectedDates.value = [];
});

function generateAvailableDates(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 1; i <= days; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    if (date.getDay() !== 0) { // Skip Sundays
      dates.push(date.toISOString().split("T")[0]);
    }
  }

  return dates;
}

function toggleDate(date: string): void {
  if (selectedDates.value.includes(date)) {
    selectedDates.value = selectedDates.value.filter(d => d !== date);
  } else if (selectedDates.value.length < lessonCount.value) {
    selectedDates.value = [...selectedDates.value, date].sort();
  }
}

function isDateSelected(date: string): boolean {
  return selectedDates.value.includes(date);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('nl-NL', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

async function handleSubmit(e: Event): Promise<void> {
  e.preventDefault();
  error.value = null;
  success.value = null;

  if (!selectedPackage.value) {
    error.value = "Selecteer een lespakket.";
    return;
  }

  if (!selectedLocation.value) {
    error.value = "Selecteer een locatie.";
    return;
  }

  if (selectedDates.value.length !== lessonCount.value) {
    error.value = `Selecteer ${lessonCount.value} lesdatum${lessonCount.value > 1 ? 's' : ''}.`;
    return;
  }

  if (isDuo.value) {
    if (!duoPartner.value.first_name.trim() ||
        !duoPartner.value.last_name.trim() ||
        !duoPartner.value.email.trim()) {
      error.value = "Vul alle gegevens van je duo-partner in.";
      return;
    }
  }

  isSubmitting.value = true;

  try {
    const reservation: Partial<ReservationModel> = {
      package_id: selectedPackage.value.id,
      location: selectedLocation.value,
      dates: selectedDates.value,
      duo_partner: isDuo.value ? {
        first_name: duoPartner.value.first_name.trim(),
        last_name: duoPartner.value.last_name.trim(),
        email: duoPartner.value.email.trim()
      } : undefined
    };

    await ReservationController.create(reservation);
    success.value = "Reservering succesvol aangemaakt! Je ontvangt een bevestiging per e-mail.";

    setTimeout(() => {
      router.push("/reserveringen");
    }, 2000);
  } catch (e: any) {
    error.value = e.message || "Er is een fout opgetreden bij het maken van je reservering.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <section class="container py-8 max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-2">Les reserveren</h1>
    <p class="mb-6 text-muted-foreground">
      Reserveer eenvoudig jouw lespakket.<br>
      Selecteer een pakket, locatie en gewenste lesdata. Bij duo-pakketten vul je ook je mede-cursist in.
      Alle prijzen zijn inclusief materialen.
    </p>

    <form @submit.prevent="handleSubmit" class="space-y-8">
      <!-- Pakketkeuze -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">1. Kies je lespakket</h2>
        <select
            v-model="selectedPackage"
            class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            required
        >
          <option :value="null">Selecteer een pakket</option>
          <option v-for="pkg in allPackages" :key="pkg.id" :value="pkg">
            {{ pkg.name }} ({{ pkg.lessonCount }}x {{ pkg.duration }}u) - €{{ pkg.price }}
          </option>
        </select>
        <div v-if="selectedPackage" class="mt-2 text-sm text-muted-foreground">
          {{ selectedPackage.description }}
        </div>
      </div>

      <!-- Locatie -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">2. Kies je locatie</h2>
        <select
            v-model="selectedLocation"
            class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            required
        >
          <option value="">Selecteer een locatie</option>
          <option v-for="loc in locations" :key="loc" :value="loc">
            {{ loc }}
          </option>
        </select>
      </div>

      <!-- Kalender -->
      <div v-if="selectedPackage" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">
          3. Kies {{ lessonCount }} lesdatum{{ lessonCount > 1 ? 's' : '' }}
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
          <button
              v-for="date in availableDates"
              :key="date"
              type="button"
              class="p-2 text-sm border rounded transition-colors"
              :class="{
              'bg-primary text-white': isDateSelected(date),
              'opacity-50 cursor-not-allowed': selectedDates.length >= lessonCount && !isDateSelected(date),
              'hover:bg-gray-100 dark:hover:bg-gray-700': !isDateSelected(date) && selectedDates.length < lessonCount
            }"
              @click="toggleDate(date)"
              :disabled="selectedDates.length >= lessonCount && !isDateSelected(date)"
          >
            {{ formatDate(date) }}
          </button>
        </div>
        <div class="mt-2 text-sm text-muted-foreground">
          Geselecteerd: {{ selectedDates.length > 0 ? selectedDates.map(d => formatDate(d)).join(', ') : 'Geen data geselecteerd' }}
        </div>
      </div>

      <!-- Duo partner -->
      <div v-if="isDuo" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">4. Gegevens duo-partner</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Voornaam*</label>
            <input
                v-model.trim="duoPartner.first_name"
                type="text"
                class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                required
                placeholder="Voornaam partner"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Achternaam*</label>
            <input
                v-model.trim="duoPartner.last_name"
                type="text"
                class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                required
                placeholder="Achternaam partner"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">E-mail*</label>
            <input
                v-model.trim="duoPartner.email"
                type="email"
                class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                required
                placeholder="E-mail partner"
            >
          </div>
        </div>
      </div>

      <!-- Error/Success messages -->
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {{ error }}
      </div>
      <div v-if="success" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
        {{ success }}
      </div>

      <!-- Submit button -->
      <Button
          type="submit"
          class="w-full"
          :disabled="isSubmitting"
          :loading="isSubmitting"
      >
        {{ isSubmitting ? 'Bezig met reserveren...' : 'Reservering plaatsen' }}
      </Button>
    </form>

    <!-- Package info -->
    <div class="mt-10 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">Pakketinformatie</h2>
      <ul class="space-y-2 list-disc ml-6">
        <li>Privéles 2,5 uur – €175,- incl. materiaal (1 persoon)</li>
        <li>Losse Duo Kiteles 3,5 uur – €135,- p.p. incl. materiaal (max 2 personen)</li>
        <li>Kitesurf Duo lespakket 3 lessen 10,5 uur – €375,- p.p. (max 2 personen, 3 dagdelen)</li>
        <li>Kitesurf Duo lespakket 5 lessen 17,5 uur – €675,- p.p. (max 2 personen, 5 dagdelen)</li>
      </ul>
      <div class="mt-4 text-sm text-muted-foreground">
        Alle reserveringen zijn pas definitief na betaling.<br>
        Je ontvangt een bevestiging met betaalgegevens per e-mail.
      </div>
    </div>
  </section>
</template>

<style scoped>
.text-muted-foreground {
  @apply text-gray-600 dark:text-gray-400;
}

input,
select {
  @apply w-full p-2 border rounded;
  @apply bg-white dark:bg-gray-700;
  @apply text-gray-900 dark:text-white;
  @apply border-gray-300 dark:border-gray-600;
  @apply focus:ring-2 focus:ring-primary focus:border-primary;
  @apply disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:cursor-not-allowed;
}

label {
  @apply block text-sm font-medium mb-1;
  @apply text-gray-700 dark:text-gray-200;
}

button:disabled {
  @apply cursor-not-allowed opacity-50;
}
</style>