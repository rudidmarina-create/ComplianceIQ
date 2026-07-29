import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, padding = "md", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-surface-200 bg-white shadow-card dark:border-surface-800 dark:bg-surface-900",
          paddingMap[padding],
          hover &&
            "transition-shadow hover:shadow-card-hover",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader: React.FC<CardHeaderProps> = ({ className, ...props }) => (
  <div className={cn("mb-4 flex flex-col gap-1", className)} {...props} />
);

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle: React.FC<CardTitleProps> = ({ className, ...props }) => (
  <h3
    className={cn(
      "text-lg font-semibold text-surface-900 dark:text-surface-100",
      className,
    )}
    {...props}
  />
);

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription: React.FC<CardDescriptionProps> = ({ className, ...props }) => (
  <p
    className={cn("text-sm text-surface-500 dark:text-surface-400", className)}
    {...props}
  />
);

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent: React.FC<CardContentProps> = ({ className, ...props }) => (
  <div className={cn("", className)} {...props} />
);

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter: React.FC<CardFooterProps> = ({ className, ...props }) => (
  <div
    className={cn(
      "mt-4 flex items-center gap-2 border-t border-surface-200 pt-4 dark:border-surface-800",
      className,
    )}
    {...props}
  />
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
