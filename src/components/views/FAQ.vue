<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "Kan ik mijn lesboeking wijzijgen of annuleren?",
    answer: "Ja, dat kunt u allemaal regelen in het officiele klantendashboard!",
    value: "item-1",
  },
  {
    question: "Kan ik zien welke instructeur er momenteel aanwezig is?",
    answer:
      "Zeker, dit kunt u in het offciele klantendashboard bekijken allemaal!",
    value: "item-2",
  },
  {
    question:
      "Waar kan ik de prijzen per pakket bekijken die jullie aanbieden?",
    answer:
      "Op de homepagina, en/of als u op de navigatie bar klikt genaamd Pakketten, kunt u ze allemaal bekijken.",
    value: "item-3",
  },
  {
    question: "Hoe kan ik contact opnemen met jullie?",
    answer: "We hebben een simpel contacteer pagina, vul je gegevens en en verwacht antwoord binnen 1-2 werkdagen.",
    value: "item-4",
  },
];
</script>

<template>
  <section
    id="faq"
    class="container md:w-[700px] py-24 sm:py-32"
  >
    <div class="text-center mb-8">
      <h2 class="text-lg text-primary text-center mb-2 tracking-wider">FAQS</h2>

      <h2 class="text-3xl md:text-4xl text-center font-bold">
        Veelgestelde Vragen
      </h2>
    </div>

    <Accordion
      type="single"
      collapsible
      class="AccordionRoot"
    >
      <AccordionItem
        v-for="{ question, answer, value } in FAQList"
        :key="value"
        :value="value"
      >
        <AccordionTrigger class="text-left"> {{ question }} </AccordionTrigger>

        <AccordionContent>{{ answer }}</AccordionContent>
      </AccordionItem>
    </Accordion>
  </section>
</template>
