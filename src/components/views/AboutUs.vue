<template>
  <div class="about-container">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Over Kitesurfschool Windkracht-12</h1>
        <p class="subtitle">Al 8 jaar dé kitesurfschool van Nederland</p>
      </div>
    </section>

    <!-- Main Content -->
    <div class="content-wrapper">
      <!-- History Section -->
      <section class="section">
        <h2>Onze Geschiedenis</h2>
        <p>
          Al 8 jaar lang zijn wij dé kitesurfschool van Nederland. Opgericht door Terence Olieslager
          met een duidelijke visie: het aanbieden van hoogwaardige kitesurflessen op de mooiste
          locaties van Nederland. Vanuit onze thuisbasis in Utrecht rijden onze ervaren instructeurs
          naar diverse locaties langs de Nederlandse kust om kitesurflessen te verzorgen.
        </p>
      </section>

      <!-- Team Section -->
      <section class="section team-section">
        <h2>Ons Team</h2>
        <div class="team-grid">
          <!-- Eigenaar -->
          <div class="team-member owner">
            <img
                src="@/assets/images/team/terence.jpg"
                alt="Terence Olieslager"
                class="member-image"
            />
            <div class="member-info">
              <h3>Terence Olieslager</h3>
              <p class="role">Oprichter & Eigenaar</p>
              <p class="description">
                Als oprichter en eigenaar van Windkracht-12 heeft Terence de school opgezet
                met een passie voor kitesurfen en een focus op kwaliteit en veiligheid.
                Met meer dan 8 jaar ervaring leidt hij het team van gepassioneerde instructeurs.
              </p>
            </div>
          </div>

          <!-- Instructeurs -->
          <div class="team-member">
            <img
                src="@/assets/images/team/duco.jpg"
                alt="Duco Veenstra"
                class="member-image"
            />
            <div class="member-info">
              <h3>Duco Veenstra</h3>
              <p class="role">Instructeur</p>
              <p class="description">
                Gespecialiseerd in beginnerslessen en veiligheidstraining.
              </p>
            </div>
          </div>

          <div class="team-member">
            <img
                src="@/assets/images/team/waldemar.jpg"
                alt="Waldemar van Dongen"
                class="member-image"
            />
            <div class="member-info">
              <h3>Waldemar van Dongen</h3>
              <p class="role">Instructeur</p>
              <p class="description">
                Expert in gevorderde technieken en groepslessen.
              </p>
            </div>
          </div>

          <div class="team-member">
            <img
                src="@/assets/images/team/ruud.jpg"
                alt="Ruud Terlingen"
                class="member-image"
            />
            <div class="member-info">
              <h3>Ruud Terlingen</h3>
              <p class="role">Instructeur</p>
              <p class="description">
                Specialist in materiaalkennis en techniektraining.
              </p>
            </div>
          </div>

          <div class="team-member">
            <img
                src="@/assets/images/team/saskia.jpg"
                alt="Saskia Brink"
                class="member-image"
            />
            <div class="member-info">
              <h3>Saskia Brink</h3>
              <p class="role">Instructeur</p>
              <p class="description">
                Gespecialiseerd in privélessen en beginnerstechnieken.
              </p>
            </div>
          </div>

          <div class="team-member">
            <img
                src="@/assets/images/team/bernie.jpg"
                alt="Bernie Vredenstein"
                class="member-image"
            />
            <div class="member-info">
              <h3>Bernie Vredenstein</h3>
              <p class="role">Instructeur</p>
              <p class="description">
                Expert in duo-lessen en gevorderde kitesurftechnieken.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="section cta-section">
        <div class="cta-content">
          <h2>Klaar om te beginnen?</h2>
          <p>
            Ontdek de vrijheid van kitesurfen met onze ervaren instructeurs
          </p>
          <RouterLink to="/book-lesson" class="cta-button">
            Les Boeken
          </RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about-container {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.hero {
  height: 60vh;
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
  url('@/assets/images/hero-about.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.hero-content h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.subtitle {
  font-size: 1.5rem;
  font-weight: 300;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.section {
  margin: 4rem 0;
}

.section h2 {
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 2rem;
  text-align: center;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.team-member {
  background: var(--card);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.team-member:hover {
  transform: translateY(-4px);
}

.member-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.member-info {
  padding: 1.5rem;
}

.member-info h3 {
  margin: 0;
  color: var(--foreground);
  font-size: 1.5rem;
}

.role {
  color: var(--muted-foreground);
  font-size: 1.1rem;
  margin: 0.5rem 0;
}

.locations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.location-card {
  background: var(--card);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.location-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.experience-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  text-align: center;
}

.experience-item {
  padding: 2rem;
  background: var(--card);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.experience-item i {
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 1rem;
}

.cta-section {
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
  url('@/assets/images/cta-background.jpg');
  background-size: cover;
  background-position: center;
  color: white;
  text-align: center;
  padding: 4rem 2rem;
  border-radius: 8px;
}

.cta-button {
  display: inline-block;
  background: var(--primary);
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  margin-top: 2rem;
  transition: transform 0.2s;
}

.cta-button:hover {
  transform: translateY(-2px);
  background: var(--primary-hover);
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1.2rem;
  }

  .section {
    margin: 2rem 0;
  }

  .content-wrapper {
    padding: 1rem;
  }

  .team-grid,
  .locations-grid,
  .experience-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>