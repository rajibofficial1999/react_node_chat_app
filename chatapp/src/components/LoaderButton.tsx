import { Button } from "./ui/button";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "./ui/button";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props
  extends React.ComponentPropsWithoutRef<"button">,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  isLoading?: boolean;
  hideContentIfLoading?: boolean;
}

const LoaderButton: React.FC<Props> = ({
  children,
  variant,
  size,
  className,
  isLoading = false,
  hideContentIfLoading = false,
  ...props
}) => {
  const hideChildren = isLoading && hideContentIfLoading;

  return (
    <Button
      disabled={isLoading}
      className={cn("flex items-center gap-1 cursor-pointer", className)}
      variant={variant}
      size={size}
      {...props}
    >
      {isLoading && <Loader className="animate-spin" />}
      {hideChildren ? "" : children}
    </Button>
  );
};

export default LoaderButton;
