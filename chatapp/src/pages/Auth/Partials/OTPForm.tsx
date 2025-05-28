import { resendCode, verifyCode } from "@/actions/auth";
import OTPInput from "@/components/OTPInput";
import { Button } from "@/components/ui/button";
import { parseError } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { toast } from "sonner";
import VerificationTimer from "./VerificationTimer";

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  me: User;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

const OTPForm: React.FC<Props> = ({ setStep, me, error, setError }) => {
  const otpRef = useRef<{ clear: () => void }>(null);

  const queryClient = useQueryClient();

  const { mutate: verifyOTPCode, isPending: isVerifyPending } = useMutation({
    mutationFn: verifyCode,
    onSuccess: () => {
      toast("The email address has been verified successfully");
      setStep(3);
      queryClient.invalidateQueries(["me"] as any);
    },
    onError: (error) => {
      otpRef.current?.clear();
      let parsedError = parseError(error);

      setError(parsedError);
    },
  });

  const { mutate: resendOTPCode, isPending: isResendPending } = useMutation({
    mutationFn: resendCode,
    onSuccess: () => {
      toast("A new verification code has been sent");

      queryClient.invalidateQueries(["me"] as any);
    },
    onError: (error) => {
      let parsedError = parseError(error);

      setError(parsedError);
    },
  });

  const handleChangeOTP = (otp: string) => {
    if (otp.length === 6) {
      verifyOTPCode(otp);
    }
  };

  return (
    <div>
      <div>
        <div className="mb-5 space-y-2">
          <h1 className="font-semibold text-xl">Verify your email address</h1>
          <p className="text-slate-500">
            We have sent a 6-digit verification code to the email address
            associated with your account, <strong>{me.email}</strong>. To
            complete the confirmation of your email address, please enter the
            provided code in the field below.
          </p>
        </div>
        <div className="mb-5">
          <OTPInput
            ref={otpRef}
            onValueChange={(otp) => handleChangeOTP(otp)}
            isDisabled={isVerifyPending}
          />
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>
      </div>
      <div>
        <p className="text-slate-500">Haven't you received anything yet?</p>
        <VerificationTimer expiry={me.verfiedTokenExpires || ""}>
          <Button
            disabled={isResendPending}
            variant="link"
            className="cursor-pointer !px-0 flex items-center"
            onClick={() => resendOTPCode()}
          >
            Resend verification code
          </Button>
        </VerificationTimer>
      </div>
    </div>
  );
};

export default OTPForm;
