import { useCountdown } from "@/hooks/countdown";
import { cn } from "@/lib/utils";

interface Props {
  expiry: string;
  children: React.ReactNode;
  className?: string;
}

const VerificationTimer = ({ expiry, children, className }: Props) => {
  const { formatted, isExpired } = useCountdown(expiry);

  return (
    <>
      {isExpired ? (
        <>{children}</>
      ) : (
        <p className={cn("mt-2 text-gray-500 text-sm", className)}>
          Resend in: {formatted}
        </p>
      )}
    </>
  );
};

export default VerificationTimer;
