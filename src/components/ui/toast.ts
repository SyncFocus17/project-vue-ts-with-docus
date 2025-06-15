import * as Vue from 'vue'
import * as ToastPrimitive from '@radix-vue/vue-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const ToastProvider = ToastPrimitive.ToastProvider
const ToastViewport = ToastPrimitive.ToastViewport

const ToastClose = Vue.defineComponent({
    inheritAttrs: false,
    setup(_, { attrs }) {
        return () => (
            <ToastPrimitive.Close
                class={cn(
                'absolute right-2 top-2 rounded-md p-1',
                'text-foreground/50 opacity-0 transition-opacity',
                'group-hover:opacity-100 hover:text-foreground',
                attrs.class as string
        )}
        toast-close=""
        >
        <X class="h-4 w-4" />
            </ToastPrimitive.Close>
    )
    },
})

const toastVariants = cva(
    'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
    {
        variants: {
            variant: {
                default: 'border bg-background',
                destructive:
                    'destructive group border-destructive bg-destructive text-destructive-foreground',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
)

export interface ToastProps extends VariantProps<typeof toastVariants> {
    class?: string
    title?: string
    description?: string
    action?: Vue.Component
}

const Toast = Vue.defineComponent<ToastProps>({
    props: {
        class: String,
        variant: {
            type: String,
            default: 'default',
        },
        title: String,
        description: String,
    },
    setup(props, { slots }) {
        return () => (
            <ToastPrimitive.Root
                class={cn(toastVariants({ variant: props.variant }), props.class)}
        {...props}
    >
        <div class="grid gap-1">
            {props.title && <ToastPrimitive.Title class="text-sm font-semibold">{props.title}</ToastPrimitive.Title>}
        {props.description && <ToastPrimitive.Description class="text-sm opacity-90">{props.description}</ToastPrimitive.Description>}
            </div>
            {slots.default?.()}
            <ToastClose />
            </ToastPrimitive.Root>
        )
        },
    })

        export { ToastProvider, ToastViewport, Toast }