"use client"

import * as React from "react"
import type {
  ControllerProps,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form"
import { useFormContext, Controller, FormProvider } from "react-hook-form"

// FormProvider wrapper to pass form context to child components
export function Form<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>({
  children,
  className,
  ...props
}: React.ComponentProps<"form"> & {
  form: UseFormReturn<TFieldValues, TContext>
}) {
  return (
    <FormProvider {...props.form}>
      <form data-slot="form" className={className} {...props}>
        {children}
      </form>
    </FormProvider>
  )
}

// FormField wraps Controller from react-hook-form
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return <Controller {...props} />
}

// Hook to access form field context - must be used inside FormField
export function useFormField() {
  const formContext = useFormContext()

  return {
    // The actual error/value will come from react-hook-form directly
    formContext,
  }
}

// Simple FormItem wrapper
export function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="form-item" className={className} {...props} />
}

// Simple FormLabel wrapper
export function FormLabel({ className, ...props }: React.ComponentPropsWithoutRef<"label">) {
  return <label data-slot="form-label" className={className} {...props} />
}

// Simple FormControl wrapper
export function FormControl({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="form-control" {...props} />
}

// Simple FormDescription wrapper
export function FormDescription({ className, ...props }: React.ComponentPropsWithoutRef<"p">) {
  return <p data-slot="form-description" className={className} {...props} />
}

// Simple FormMessage wrapper
export function FormMessage({ className, children, ...props }: React.ComponentPropsWithoutRef<"p">) {
  if (!children) return null
  return <p data-slot="form-message" className={className} {...props}>{children}</p>
}

// Submit button that uses form context
interface FormSubmitProps extends Omit<React.ComponentPropsWithoutRef<"button">, 'form'> {
  form: UseFormReturn<FieldValues>
  onSubmit: (values: FieldValues) => Promise<void>
}

export function FormSubmit({ form, onSubmit, children, disabled, className, ...props }: FormSubmitProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await form.handleSubmit(onSubmit)()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <button
      type="submit"
      onClick={handleSubmit}
      disabled={disabled || isSubmitting || !form.formState.isValid}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}
