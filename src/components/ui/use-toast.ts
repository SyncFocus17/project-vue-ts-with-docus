import { ref, computed } from 'vue'
import type { Component } from 'vue'
import type { ToastProps } from './toast'

interface Toast extends ToastProps {
    id: string
    title?: string
    description?: string
    action?: Component
}

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

const actionTypes = {
    ADD_TOAST: 'ADD_TOAST',
    UPDATE_TOAST: 'UPDATE_TOAST',
    DISMISS_TOAST: 'DISMISS_TOAST',
    REMOVE_TOAST: 'REMOVE_TOAST',
} as const

let count = 0

function genId() {
    count = (count + 1) % Number.MAX_VALUE
    return count.toString()
}

const toasts = ref<Toast[]>([])

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

function addToast(toast: ToastProps) {
    const id = genId()

    const newToast = {
        ...toast,
        id,
        open: true,
        onOpenChange: (open: boolean) => {
            if (!open) dismiss(id)
        },
    }

    toasts.value = [newToast, ...toasts.value].slice(0, TOAST_LIMIT)

    return id
}

function updateToast(id: string, toast: ToastProps) {
    toasts.value = toasts.value.map((t) => (t.id === id ? { ...t, ...toast } : t))
}

function dismissToast(id: string) {
    toasts.value = toasts.value.map((t) =>
        t.id === id ? { ...t, open: false } : t
    )
}

function removeToast(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
}

export function toast(props: ToastProps) {
    const id = addToast(props)

    return {
        id,
        dismiss: () => dismiss(id),
        update: (props: ToastProps) => update(id, props),
    }
}

function dismiss(id: string) {
    dismissToast(id)

    const timeout = setTimeout(() => {
        removeToast(id)
    }, TOAST_REMOVE_DELAY)

    toastTimeouts.set(id, timeout)
}

function update(id: string, props: ToastProps) {
    updateToast(id, props)
}

export function useToast() {
    return {
        toasts: computed(() => toasts.value),
        toast,
        dismiss,
    }
}