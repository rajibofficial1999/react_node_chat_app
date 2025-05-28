import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import type { LucideIcon } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  parentClassName?: string;
  iconClassName?: string;
  icon: LucideIcon;
  handleIconClick?: () => void;
}

const IconInput: React.FC<Props> = ({
  icon,
  className,
  parentClassName,
  iconClassName,
  handleIconClick,
  ...props
}) => {
  const Icon = icon;
  return (
    <div className={cn("relative flex items-center", parentClassName)}>
      <Input className={cn("w-full !py-5", className)} {...props} />
      <Icon
        className={cn("size-4 absolute right-4 text-gray-400", iconClassName)}
        onClick={handleIconClick}
      />
    </div>
  );
};

export default IconInput;
