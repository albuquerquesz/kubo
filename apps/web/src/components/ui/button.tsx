import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Tailwind medium radius (0.375rem). Fixed value so buttons stay soft when page --radius is 0. */
const BUTTON_RADIUS = "rounded-[0.375rem]";

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 border border-transparent bg-clip-padding text-xs font-medium focus-visible:ring-1 aria-invalid:ring-1 [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none",
  {
    variants: {
      variant: {
        default: `${BUTTON_RADIUS} bg-primary text-primary-foreground [a]:hover:bg-primary/80`,
        /**
         * Marketing conversion pill — matches the home hero install/CTA motion.
         * Do not use in the site header (header freezes its own chrome styles).
         */
        cta: [
          "rounded-full border-0 bg-primary font-medium text-primary-foreground",
          "transition-all duration-300",
          "hover:scale-105 hover:bg-primary/90 hover:ring-4 hover:ring-primary/20",
          "active:scale-95",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-0",
        ].join(" "),
        outline: `${BUTTON_RADIUS} border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground`,
        secondary: `${BUTTON_RADIUS} bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground`,
        ghost: `${BUTTON_RADIUS} hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground`,
        destructive: `${BUTTON_RADIUS} bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30`,
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        /** Compact chrome controls */
        xs: "h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        /** Secondary / dense UI */
        sm: "h-7 gap-1 px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        /** Default app controls */
        default:
          "h-8 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        /** Emphasized actions */
        lg: "h-10 gap-2 px-4 text-sm has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        /** Marketing / conversion CTAs (hero pill geometry) */
        xl: "h-14 max-w-full gap-3 overflow-hidden px-8 text-base sm:px-12 has-data-[icon=inline-end]:pr-8 has-data-[icon=inline-start]:pl-8 sm:has-data-[icon=inline-end]:pr-12 sm:has-data-[icon=inline-start]:pl-12",
        icon: "size-8",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
