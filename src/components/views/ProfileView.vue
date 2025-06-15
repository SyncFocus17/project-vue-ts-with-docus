<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import UserController from "@/components/controllers/UserController";
import type { UserModel } from "@/components/models/UserModel";
import Button from "@/components/ui/button/Button.vue";

interface FormData extends UserModel {
  password?: string;
  passwordConfirm?: string;
  changePassword: boolean;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  bsn_number?: string;
  phone_number?: string;
}

const form = reactive<FormData>({
  id: 0,
  first_name: "",
  last_name: "",
  email: "",
  address: "",
  city: "",
  date_of_birth: "",
  bsn_number: "",
  phone_number: "",
  role: "customer",
  password: "",
  passwordConfirm: "",
  changePassword: false,
  blocked: false
});

const isLoading = ref<boolean>(true);
const isSaving = ref<boolean>(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const currentUser = ref<string>("syncfocusdev1");
const lastUpdated = ref<string>("2025-06-08 12:25:46");

onMounted(async () => {
  try {
    const user = await UserController.getProfile();
    if (user) {
      Object.assign(form, {
        ...user,
        changePassword: false,
        password: "",
        passwordConfirm: ""
      });
    }
  } catch (e: any) {
    error.value = e.message || "Kan profiel niet laden.";
  } finally {
    isLoading.value = false;
  }
});

function validateForm(): boolean {
  if (!form.first_name?.trim() || !form.last_name?.trim() || !form.email?.trim() || !form.phone_number?.trim()) {
    error.value = "Vul alle verplichte velden in.";
    return false;
  }

  if (["instructor", "owner"].includes(form.role)) {
    if (!form.bsn_number?.trim() || !form.date_of_birth || !form.address?.trim() || !form.city?.trim()) {
      error.value = "Als instructeur/eigenaar zijn alle velden verplicht.";
      return false;
    }
  }

  if (form.changePassword && form.password) {
    if (form.password.length < 12 || !/[A-Z]/.test(form.password) ||
        !/[0-9]/.test(form.password) || !/[@#$%^&*]/.test(form.password)) {
      error.value = "Wachtwoord moet minimaal 12 tekens bevatten, 1 hoofdletter, 1 cijfer en 1 speciaal teken (@#$%^&*).";
      return false;
    }
    if (form.password !== form.passwordConfirm) {
      error.value = "Wachtwoorden komen niet overeen.";
      return false;
    }
  }

  return true;
}

async function saveProfile(e: Event) {
  e.preventDefault();
  error.value = null;
  success.value = null;

  if (!validateForm()) return;

  isSaving.value = true;
  try {
    const updateData: Partial<FormData> = {
      id: form.id,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      phone_number: form.phone_number?.trim(),
      address: form.address?.trim(),
      city: form.city?.trim(),
      date_of_birth: form.date_of_birth,
      bsn_number: form.bsn_number?.trim(),
      role: form.role
    };

    if (form.changePassword && form.password) {
      updateData.password = form.password;
    }

    await UserController.updateProfile(updateData);
    success.value = "Profiel succesvol bijgewerkt!";
    lastUpdated.value = "2025-06-08 12:25:46";
  } catch (e: any) {
    error.value = e.message || "Opslaan mislukt.";
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <section class="container py-10 max-w-2xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Mijn Profiel</h1>
      <p class="text-muted-foreground">Beheer je persoonlijke gegevens en voorkeuren</p>
      <div class="text-sm text-muted-foreground mt-2">
        Laatste update: {{ lastUpdated }} door {{ currentUser }}
      </div>
    </div>

    <form @submit.prevent="saveProfile" class="space-y-6">
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {{ error }}
      </div>
      <div v-if="success" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
        {{ success }}
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Persoonlijke gegevens</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1" for="first_name">Voornaam*</label>
            <input id="first_name" v-model.trim="form.first_name" type="text" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" for="last_name">Achternaam*</label>
            <input id="last_name" v-model.trim="form.last_name" type="text" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" for="email">E-mail*</label>
            <input id="email" v-model.trim="form.email" type="email" disabled />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" for="phone_number">Mobiel*</label>
            <input id="phone_number" v-model.trim="form.phone_number" type="tel" required />
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Adresgegevens</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1" for="address">
              Adres{{ ["instructor", "owner"].includes(form.role) ? '*' : '' }}
            </label>
            <input id="address" v-model.trim="form.address" type="text"
                   :required="['instructor', 'owner'].includes(form.role)" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" for="city">
              Woonplaats{{ ["instructor", "owner"].includes(form.role) ? '*' : '' }}
            </label>
            <input id="city" v-model.trim="form.city" type="text"
                   :required="['instructor', 'owner'].includes(form.role)" />
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Extra gegevens</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1" for="date_of_birth">
              Geboortedatum{{ ["instructor", "owner"].includes(form.role) ? '*' : '' }}
            </label>
            <input id="date_of_birth" v-model="form.date_of_birth" type="date"
                   :required="['instructor', 'owner'].includes(form.role)" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" for="bsn_number">
              BSN-nummer{{ ["instructor", "owner"].includes(form.role) ? '*' : '' }}
            </label>
            <input id="bsn_number" v-model.trim="form.bsn_number" type="text"
                   :required="['instructor', 'owner'].includes(form.role)" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" for="role">Gebruikersrol</label>
            <input id="role" v-model="form.role" type="text" disabled />
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Wachtwoord wijzigen</h2>
          <label class="flex items-center">
            <input type="checkbox" v-model="form.changePassword" class="mr-2" />
            <span class="text-sm">Wijzig wachtwoord</span>
          </label>
        </div>
        <div v-if="form.changePassword" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1" for="password">Nieuw wachtwoord*</label>
            <input id="password" v-model="form.password" type="password" :required="form.changePassword" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" for="passwordConfirm">Bevestig wachtwoord*</label>
            <input id="passwordConfirm" v-model="form.passwordConfirm" type="password" :required="form.changePassword" />
          </div>
          <div class="col-span-2 text-sm text-muted-foreground">
            Wachtwoord moet minimaal 12 tekens bevatten, 1 hoofdletter, 1 cijfer en 1 speciaal teken (@#$%^&*).
          </div>
        </div>
      </div>

      <Button type="submit" :loading="isSaving" class="w-full">
        {{ isSaving ? 'Opslaan...' : 'Wijzigingen opslaan' }}
      </Button>
    </form>

    <div class="mt-8 text-sm text-center text-muted-foreground">
      Kitesurfschool Windkracht-12 © 2025 | Profielbeheer
    </div>
  </section>
</template>

<style scoped>
input[type="text"],
input[type="email"],
input[type="tel"],
input[type="password"],
input[type="date"] {
  @apply w-full p-2 border rounded;
  @apply bg-white dark:bg-gray-700;
  @apply text-gray-900 dark:text-white;
  @apply border-gray-300 dark:border-gray-600;
  @apply focus:ring-2 focus:ring-primary focus:border-primary;
  @apply disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:cursor-not-allowed;
}

input:disabled {
  @apply text-gray-500 dark:text-gray-400;
}

label {
  @apply block text-sm font-medium mb-1;
  @apply text-gray-700 dark:text-gray-200;
}

.text-muted-foreground {
  @apply text-gray-600 dark:text-gray-400;
}
</style>