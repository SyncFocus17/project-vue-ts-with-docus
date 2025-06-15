<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watchEffect } from "vue"
import { useColorMode, useScroll } from "@vueuse/core"
import { RouterLink, useRouter } from "vue-router"
import { ChevronsDown, Menu } from "lucide-vue-next"
import { authService } from "@/services/AuthService"

// Components
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import ToggleTheme from "./ToggleTheme.vue"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

// State management
const isOpen = ref(false)
const router = useRouter()
const user = computed(() => authService.currentUser.value)
const currentPath = computed(() => router.currentRoute.value.path)
const { y: scrollY } = useScroll(window)
const isScrolled = computed(() => scrollY.value > 20)

// Color mode setup
const mode = useColorMode({
  attribute: 'class',
  initialValue: 'dark',
  modes: {
    dark: 'dark',
    light: 'light'
  }
})

// Route configuration with types
interface Route {
  to: string
  label: string
  requiresAuth?: boolean
  roles?: Array<'customer' | 'instructor' | 'owner'>
  icon?: string
  children?: Route[]
}
// Route configuration
const routeList = computed<Route[]>(() => {
  const baseRoutes: Route[] = [
    { to: "/pakketten", label: "Pakketten" }, // Changed from #Pricing
    { to: "/locations", label: "Locaties" }, // Changed from #Locations
    { to: "/contact", label: "Contact" }, // Changed from #contact
    { to: "/about", label: "Over Ons" }
  ]

  if (user.value) {
    const dashboardRoute: Route = {
      to: "/dashboard",
      label: "Dashboard",
      requiresAuth: true,
      roles: ['customer', 'instructor', 'owner'],
      children: []
    }

    // Add role-specific dashboard items
    if (authService.isCustomer()) {
      dashboardRoute.children?.push(
          { to: "/dashboard/reservations", label: "Mijn Reserveringen" },
          { to: "/dashboard/profile", label: "Mijn Profiel" }
      )
    }

    if (authService.isInstructor()) {
      dashboardRoute.children?.push(
          { to: "/dashboard/lessons", label: "Mijn Lessen" },
          { to: "/dashboard/schedule", label: "Mijn Rooster" },
          { to: "/dashboard/profile", label: "Mijn Profiel" }
      )
    }

    if (authService.isOwner()) {
      dashboardRoute.children?.push(
          { to: "/dashboard/overview", label: "Overzicht" },
          { to: "/dashboard/statistics", label: "Statistieken" },
          { to: "/dashboard/profile", label: "Mijn Profiel" }
      )
    }

    baseRoutes.splice(2, 0, dashboardRoute)

    if (authService.isOwner()) {
      baseRoutes.push({
        to: "/admin/users",
        label: "Gebruikersbeheer",
        requiresAuth: true,
        roles: ['owner'],
        children: [
          { to: "/admin/users/customers", label: "Klanten" },
          { to: "/admin/users/instructors", label: "Instructeurs" }
        ]
      })
    }

    if (authService.isInstructor() || authService.isOwner()) {
      baseRoutes.push({
        to: "/lessons",
        label: "Lessen",
        requiresAuth: true,
        roles: ['instructor', 'owner'],
        children: [
          { to: "/lessons/schedule", label: "Lesrooster" },
          { to: "/lessons/students", label: "Cursisten" }
        ]
      })
    }
  } else {
    baseRoutes.push(
        { to: "/login", label: "Inloggen" },
        { to: "/register", label: "Registreren" }
    )
  }

  return baseRoutes
})

// Navigation functions
async function logout() {
  try {
    await authService.logout()
    isOpen.value = false
    await router.push({ path: "/login" })
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

function scrollToSection(event: Event, hash: string) {
  event.preventDefault()
  const element = document.querySelector(hash)
  if (element) {
    const headerOffset = 100
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })

    window.history.pushState(null, '', hash)
  }
  isOpen.value = false
}

// Active route helper
function isActiveRoute(path: string): boolean {
  if (path.startsWith('#')) {
    const currentHash = window.location.hash.replace('/#', '#')
    return currentHash === path
  }

  if (path !== '/' && currentPath.value.startsWith(path)) {
    return true
  }

  return currentPath.value === path
}

// Lifecycle hooks
onMounted(() => {
  // Handle initial hash navigation
  if (window.location.hash) {
    const element = document.querySelector(window.location.hash)
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }
})

// Watch for route changes to close mobile menu
watchEffect(() => {
  if (currentPath.value) {
    isOpen.value = false
  }
})
</script>

<template>
  <header
      :class="[
      'w-[90%] md:w-[70%] lg:w-[75%] lg:max-w-screen-xl',
      'top-5 mx-auto sticky border z-40 rounded-2xl',
      'flex justify-between items-center p-2 bg-card',
      isScrolled ? 'shadow-lg' : 'shadow-md',
      mode === 'light' ? 'shadow-light' : 'shadow-dark',
      'transition-all duration-300'
    ]"
  >
    <!-- Logo -->
    <RouterLink
        to="/"
        class="font-bold text-lg flex items-center transition-colors hover:text-primary"
    >
      <ChevronsDown
          class="bg-gradient-to-tr from-primary via-primary/70 to-primary
               rounded-lg w-9 h-9 mr-2 border text-white transition-transform
               hover:scale-105"
      />
      <span class="hidden sm:inline">Kitesurfschool Windkracht-12</span>
      <span class="sm:hidden">Windkracht-12</span>
    </RouterLink>

    <!-- Mobile Menu -->
    <div class="flex items-center lg:hidden">
      <Sheet v-model:open="isOpen">
        <SheetTrigger as-child>
          <Button
              variant="ghost"
              size="icon"
              class="lg:hidden"
          >
            <Menu class="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent
            side="left"
            class="flex flex-col justify-between rounded-tr-2xl rounded-br-2xl bg-card"
        >
          <div>
            <SheetHeader class="mb-4 ml-4">
              <SheetTitle class="flex items-center">
                <RouterLink
                    to="/"
                    class="flex items-center"
                    @click="isOpen = false"
                >
                  <ChevronsDown
                      class="bg-gradient-to-tr from-primary/70 via-primary to-primary/70
                           rounded-lg size-9 mr-2 border text-white"
                  />
                  Windkracht-12
                </RouterLink>
              </SheetTitle>
            </SheetHeader>
            <div class="flex flex-col gap-2">
              <template v-for="route in routeList" :key="route.to">
                <Button
                    as-child
                    :variant="isActiveRoute(route.to) ? 'default' : 'ghost'"
                    class="justify-start text-base"
                >
                  <RouterLink
                      v-if="route.to.startsWith('#')"
                      :to="route.to"
                      @click="(e) => scrollToSection(e, route.to)"
                  >
                    {{ route.label }}
                  </RouterLink>
                  <RouterLink
                      v-else
                      :to="route.to"
                      @click="isOpen = false"
                  >
                    {{ route.label }}
                  </RouterLink>
                </Button>
                <template v-if="route.children?.length">
                  <Button
                      v-for="child in route.children"
                      :key="child.to"
                      as-child
                      variant="ghost"
                      class="justify-start text-base pl-6"
                  >
                    <RouterLink
                        :to="child.to"
                        @click="isOpen = false"
                    >
                      {{ child.label }}
                    </RouterLink>
                  </Button>
                </template>
              </template>
              <Button
                  v-if="user"
                  @click="logout"
                  variant="outline"
                  class="justify-start text-base text-destructive"
              >
                Uitloggen
              </Button>
            </div>
          </div>
          <SheetFooter class="flex-col sm:flex-col justify-start items-start">
            <Separator class="mb-2" />
            <ToggleTheme />
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>

    <!-- Desktop Menu -->
    <NavigationMenu class="hidden lg:flex items-center">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <div class="flex items-center gap-2">
              <template v-for="route in routeList" :key="route.to">
                <div class="relative group">
                  <Button
                      as-child
                      :variant="isActiveRoute(route.to) ? 'default' : 'ghost'"
                      class="justify-start text-base"
                  >
                    <RouterLink
                        v-if="route.to.startsWith('#')"
                        :to="route.to"
                        @click="(e) => scrollToSection(e, route.to)"
                    >
                      {{ route.label }}
                    </RouterLink>
                    <RouterLink
                        v-else
                        :to="route.to"
                    >
                      {{ route.label }}
                    </RouterLink>
                  </Button>
                  <div
                      v-if="route.children?.length"
                      class="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-card invisible
                           group-hover:visible transition-all duration-200 opacity-0
                           group-hover:opacity-100 z-50"
                  >
                    <div class="rounded-md ring-1 ring-black ring-opacity-5 py-1">
                      <RouterLink
                          v-for="child in route.children"
                          :key="child.to"
                          :to="child.to"
                          class="block px-4 py-2 text-sm hover:bg-accent"
                      >
                        {{ child.label }}
                      </RouterLink>
                    </div>
                  </div>
                </div>
              </template>
              <Button
                  v-if="user"
                  @click="logout"
                  variant="outline"
                  class="text-base ml-2 text-destructive"
              >
                Uitloggen
              </Button>
              <ToggleTheme class="ml-2" />
            </div>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  </header>
</template>

<style scoped>
.shadow-light {
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.085);
}

.shadow-dark {
  box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.141);
}

.router-link-active {
  @apply text-primary font-medium;
}

.router-link-active:hover {
  @apply text-primary/90;
}

@media (max-width: 640px) {
  .header {
    @apply w-[95%];
  }
}

.group:hover .absolute {
  transform: translateY(0);
  pointer-events: auto;
}

.absolute {
  transform: translateY(-10px);
  pointer-events: none;
  transition: all 0.2s ease-in-out;
}

:deep(section[id]) {
  scroll-margin-top: 100px;
}
</style>