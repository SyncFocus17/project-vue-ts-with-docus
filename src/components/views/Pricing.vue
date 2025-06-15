<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-vue-next";

enum PopularPlan {
  NO = 0,
  YES = 1,
}

interface PlanProps {
  title: string;
  popular: PopularPlan;
  price: number;
  description: string;
  buttonText: string;
  benefitList: string[];
  duration: string;
}

const plans = [
  {
    title: "Privéles 2.5 uur",
    popular: PopularPlan.NO,
    price: 175,
    description: "Een privéles voor de beste persoonlijke begeleiding",
    buttonText: "Nu Reserveren",
    duration: "2.5 uur",
    benefitList: [
      "€175,- inclusief alle materialen",
      "Eén persoon per les",
      "1 dagdeel",
    ],
  },
  {
    title: "Losse Duo Kiteles",
    popular: PopularPlan.YES,
    price: 135,
    description: "Perfect voor duo's die samen willen leren kitesurfen",
    buttonText: "Direct Boeken",
    duration: "3.5 uur",
    benefitList: [
      "€135,- per persoon inclusief alle materialen",
      "Maximaal 2 personen per les",
      "1 dagdeel",
    ],
  },
  {
    title: "Kitesurf Duo lespakket 3 lessen",
    popular: PopularPlan.NO,
    price: 375,
    description: "Kennismakingspakket verdeeld over meerdere lessen",
    buttonText: "Pakket Boeken",
    duration: "10.5 uur",
    benefitList: [
      "€375,- per persoon inclusief materialen",
      "Maximaal 2 personen per les",
      "3 dagdelen",
    ],
  },
  {
    title: "Kitesurf Duo lespakket 5 lessen",
    popular: PopularPlan.NO,
    price: 675,
    description: "Complete cursus voor de volledige kitesurfervaring",
    buttonText: "Pakket Boeken",
    duration: "17.5 uur",
    benefitList: [
      "€675,- per persoon inclusief materialen",
      "Maximaal 2 personen per les",
      "5 dagdelen",
    ],
  },
]
</script>

<template>
  <section id="Pakketten" class="container py-24 sm:py-32">
    <h2 class="text-lg text-primary text-center mb-2 tracking-wider">
      Lespakketten
    </h2>

    <h2 class="text-3xl md:text-4xl text-center font-bold mb-4">
      Kitesurflessen op maat
    </h2>

    <h3 class="md:w-1/2 mx-auto text-xl text-center text-muted-foreground pb-14">
      Leer kitesurfen met onze ervaren instructeurs bij Kitesurfschool Windkracht-12
    </h3>

    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
      <Card
          v-for="plan in plans"
          :class="{
          'drop-shadow-xl shadow-black/10 dark:shadow-white/10 border-[1.5px] border-primary lg:scale-[1.1]':
            plan.popular === PopularPlan.YES,
        }"
      >
        <CardHeader>
          <CardTitle class="pb-2">
            {{ plan.title }}
          </CardTitle>

          <CardDescription class="pb-4">{{ plan.description }}</CardDescription>

          <div class="flex flex-col">
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-bold">€{{ plan.price }},-</span>
            </div>
            <span class="text-muted-foreground text-sm">per persoon inclusief materialen</span>
            <span class="text-primary font-semibold mt-1">Lesduur: {{ plan.duration }}</span>
          </div>
        </CardHeader>

        <CardContent class="flex">
          <div class="space-y-4">
            <span
                v-for="benefit in plan.benefitList"
                class="flex"
            >
              <Check class="text-primary mr-2" />
              <h3>{{ benefit }}</h3>
            </span>
          </div>
        </CardContent>

        <CardFooter>
          <Button
              :variant="plan.popular === PopularPlan.NO ? 'secondary' : 'default'"
              class="w-full"
          >
            {{ plan.buttonText }}
          </Button>
        </CardFooter>
      </Card>
    </div>
  </section>
</template>