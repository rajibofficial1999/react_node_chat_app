import { cn } from "@/lib/utils";

const InfoItem = ({
  label,
  value,
  paraClassName,
  className,
}: {
  label: string;
  value: string;
  paraClassName?: string;
  className?: string;
}) => (
  <div className={cn("grid grid-cols-2 gap-2 pb-4", className)}>
    <h1 className="font-semibold">{label}</h1>
    <p className={cn("text-gray-500 text-sm", paraClassName)}>{value}</p>
  </div>
);

export default InfoItem;
