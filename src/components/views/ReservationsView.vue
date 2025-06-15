<script setup lang="ts">
import { ref, onMounted } from "vue";
import ReservationController from "@/components/controllers/ReservationController";
import type { ReservationModel } from "@/components/models/ReservationModel";
import { useRouter } from "vue-router";

const reservations = ref<ReservationModel[]>([]);
const isLoading = ref(true);
const cancelError = ref<string | null>(null);
const cancelSuccess = ref<string | null>(null);
const cancelReason = ref<string>("");
const showCancelModal = ref(false);
const reservationToCancel = ref<ReservationModel | null>(null);

const router = useRouter();

onMounted(async () => {
  await loadReservations();
});

async function loadReservations() {
  isLoading.value = true;
  reservations.value = await ReservationController.getMine();
  isLoading.value = false;
}

function startCancelReservation(reservation: ReservationModel) {
  reservationToCancel.value = reservation;
  cancelReason.value = "";
  cancelError.value = null;
  showCancelModal.value = true;
}

async function confirmCancelReservation() {
  if (!cancelReason.value.trim()) {
    cancelError.value = "Geef een reden op voor annulering.";
    return;
  }
  try {
    await ReservationController.cancel(reservationToCancel.value!.id, cancelReason.value);
    cancelSuccess.value = "Reservering succesvol geannuleerd.";
    showCancelModal.value = false;
    await loadReservations();
  } catch (e: any) {
    cancelError.value = e.message || "Annuleren mislukt.";
  }
}

function goToBook() {
  router.push("/reserveer");
}
</script>

<template>
  <section class="container py-8">
    <div class="mb-8 flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-bold mb-1">Mijn reserveringen</h1>
        <p class="text-muted-foreground">Hier vind je al jouw geplande lessen en pakketten.</p>
      </div>
      <button class="btn btn-primary" @click="goToBook">Nieuwe reservering</button>
    </div>

    <div v-if="isLoading" class="text-center py-16 text-2xl font-bold">
      Reserveringen laden...
    </div>

    <div v-else>
      <div v-if="reservations.length > 0" class="overflow-x-auto">
        <table class="table-auto w-full border shadow mb-6">
          <thead>
          <tr>
            <th>Pakket</th>
            <th>Locatie</th>
            <th>Datum</th>
            <th>Status</th>
            <th>Betaald</th>
            <th>Acties</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="r in reservations" :key="r.id">
            <td>{{ r.package?.name || "-" }}</td>
            <td>{{ r.location || "-" }}</td>
            <td>{{ r.date || "-" }}</td>
            <td>
                <span
                    :class="{
                    'text-yellow-600': r.status === 'pending',
                    'text-red-600': r.status === 'cancelled',
                    'text-green-600': r.status === 'confirmed' || r.status === 'definitive'
                  }"
                >
                  {{ r.status }}
                </span>
            </td>
            <td>
              <span v-if="r.paid" class="text-green-600 font-bold">Ja</span>
              <span v-else class="text-red-600">Nee</span>
            </td>
            <td>
              <button
                  v-if="r.status !== 'cancelled'"
                  class="btn btn-xs btn-danger"
                  @click="startCancelReservation(r)"
              >
                Annuleer
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center text-muted-foreground py-16">
        Je hebt nog geen reserveringen.<br>
        <button class="btn btn-primary mt-3" @click="goToBook">Maak een nieuwe reservering</button>
      </div>
    </div>

    <!-- Annuleren Modal -->
    <div v-if="showCancelModal" class="modal-backdrop">
      <div class="modal">
        <h2 class="text-xl font-bold mb-2">Reservering annuleren</h2>
        <p>Geef een reden voor annulering:</p>
        <textarea
            class="border w-full rounded p-2 my-2"
            v-model="cancelReason"
            rows="3"
            placeholder="Reden voor annulering..."
        />
        <div v-if="cancelError" class="text-red-600 text-sm mb-2">{{ cancelError }}</div>
        <div class="flex justify-end gap-2">
          <button class="btn btn-secondary" @click="showCancelModal = false">Annuleren</button>
          <button class="btn btn-danger" @click="confirmCancelReservation">Bevestig annulering</button>
        </div>
      </div>
    </div>

    <div v-if="cancelSuccess" class="alert alert-success mt-4">
      {{ cancelSuccess }}
    </div>
  </section>
</template>

<style scoped>
.btn {
  @apply px-4 py-2 rounded font-bold transition-all text-sm;
}
.btn-primary {
  @apply bg-primary text-white hover:bg-primary/90;
}
.btn-secondary {
  @apply bg-muted text-primary border border-primary hover:bg-primary hover:text-white;
}
.btn-danger {
  @apply bg-red-600 text-white hover:bg-red-700;
}
.btn-xs {
  @apply px-2 py-0.5 text-xs;
}
.table-auto th, .table-auto td {
  @apply px-3 py-2 border;
}
.modal-backdrop {
  @apply fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50;
}
.modal {
  @apply bg-white dark:bg-card rounded-lg p-6 shadow-lg w-[95vw] max-w-md;
}
.alert-success {
  @apply bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative;
}
</style>