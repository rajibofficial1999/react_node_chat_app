import { cn } from "@/lib/utils";
import type { FieldErrors } from "react-hook-form";
import type { ReactNode } from "react";

interface Props {
  className?: string;
  children: ReactNode;
  name: string;
  errors: FieldErrors<any>;
}

const InputWrapper = ({ children, className, name, errors }: Props) => {
  return (
    <div className={cn("flex flex-col w-full space-y-1", className)}>
      {children}
      {errors[name] && (
        <div className="text-destructive text-sm">
          {errors[name]?.message as string}
        </div>
      )}
    </div>
  );
};

export default InputWrapper;
