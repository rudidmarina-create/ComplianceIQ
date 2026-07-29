import * as React from "react";
import { cn } from "@/lib/utils";

type HeadingLevel = "h1" | "h2" | "h3" | "h4";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

const sizeMap: Record<string, { tag: HeadingLevel; classes: string }> = {
  "3xl": {
    tag: "h1",
    classes: "text-4xl font-bold tracking-tight text-surface-900 dark:text-surface-100 sm:text-5xl",
  },
  "2xl": {
    tag: "h1",
    classes: "text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-100 sm:text-4xl",
  },
  xl: {
    tag: "h2",
    classes: "text-2xl font-semibold tracking-tight text-surface-900 dark:text-surface-100 sm:text-3xl",
  },
  lg: {
    tag: "h2",
    classes: "text-xl font-semibold text-surface-900 dark:text-surface-100",
  },
  md: {
    tag: "h3",
    classes: "text-lg font-semibold text-surface-900 dark:text-surface-100",
  },
  sm: {
    tag: "h4",
    classes: "text-base font-semibold text-surface-900 dark:text-surface-100",
  },
  xs: {
    tag: "h4",
    classes: "text-sm font-semibold text-surface-900 dark:text-surface-100",
  },
};

const Heading: React.FC<HeadingProps> = ({
  as,
  size = "md",
  className,
  children,
  ...props
}) => {
  const { tag, classes } = sizeMap[size];
  const Tag = as || tag;
  return (
    <Tag className={cn(classes, className)} {...props}>
      {children}
    </Tag>
  );
};

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "default" | "muted";
}

const Text: React.FC<TextProps> = ({
  size = "md",
  variant = "default",
  className,
  children,
  ...props
}) => {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const variantClasses = {
    default: "text-surface-700 dark:text-surface-300",
    muted: "text-surface-500 dark:text-surface-400",
  };

  return (
    <p
      className={cn(sizeClasses[size], variantClasses[variant], className)}
      {...props}
    >
      {children}
    </p>
  );
};

export { Heading, Text };
