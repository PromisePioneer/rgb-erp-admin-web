"use client"

import * as React from "react"
import type {
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form"
import { useFormContext, Controller } from "react-hook-form"

// Simple Form wrapper component
export function Form({ children, ...props }: React.ComponentProps<"form">) {
  return <form data-slot="form" {...props}>{children}</form>
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
