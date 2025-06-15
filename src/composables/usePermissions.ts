import { ref, computed } from 'vue'

interface User {
    id: number
    email: string
    user_type: 'klant' | 'instructeur' | 'eigenaar'
    is_active: boolean
}

export const usePermissions = () => {
    const currentUser = ref<User | null>(null)

    const isInstructor = computed(() => currentUser.value?.user_type === 'instructeur')
    const isOwner = computed(() => currentUser.value?.user_type === 'eigenaar')
    const isCustomer = computed(() => currentUser.value?.user_type === 'klant')
    const isActive = computed(() => currentUser.value?.is_active ?? false)

    const permissions = {
        'klant': [
            'view.own.profile',
            'edit.own.profile',
            'book.lessons',
            'view.own.lessons',
            'cancel.own.lessons',
            'view.lesson.schedule',
            'mark.payment.made'
        ],
        'instructeur': [
            'view.own.profile',
            'edit.own.profile',
            'view.assigned.customers',
            'manage.customer.lessons',
            'view.lesson.schedule',
            'cancel.lessons',
            'send.cancellation.emails'
        ],
        'eigenaar': [
            'view.all.profiles',
            'edit.all.profiles',
            'manage.all.lessons',
            'manage.instructors',
            'change.user.roles',
            'view.payment.status',
            'confirm.payments',
            'view.system.logs',
            'manage.lesson.packages'
        ]
    }

    const can = (action: string): boolean => {
        if (!currentUser.value || !isActive.value) return false
        const userPermissions = permissions[currentUser.value.user_type]
        return userPermissions?.includes(action) ?? false
    }

    const logPermissionCheck = (action: string, granted: boolean) => {
        console.log(`Permission Check - Action: ${action} - Granted: ${granted}`)
    }

    const hasRole = (role: 'klant' | 'instructeur' | 'eigenaar'): boolean => {
        return currentUser.value?.user_type === role
    }

    const requirePermission = (action: string) => {
        const granted = can(action)
        logPermissionCheck(action, granted)
        if (!granted) {
            throw new Error(`Insufficient permissions for action: ${action}`)
        }
    }

    const setCurrentUser = (user: User) => {
        currentUser.value = user
        console.log(`User Context Changed`)
    }

    return {
        currentUser,
        isInstructor,
        isOwner,
        isCustomer,
        isActive,
        can,
        hasRole,
        requirePermission,
        setCurrentUser
    }
}