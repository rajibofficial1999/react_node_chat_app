import { getLoggedInUser } from "@/actions/users";
import { resendCode, verifyCode } from "@/actions/auth";
import OTPInput from "@/components/OTPInput";
import PageLoader from "@/components/PageLoader";
import { Button } from "@/components/ui/button";
import { parseError } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { toast } from "sonner";
import VerificationTimer from "./Partials/VerificationTimer";

const VerifyEmail = () => {
  const [error, setError] = useState("");

  const otpRef = useRef<{ clear: () => void }>(null);

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutate: verifyOTPCode, isPending: isVerifyPending } = useMutation({
    mutationFn: verifyCode,
    onSuccess: () => {
      toast("The email address has been verified successfully");

      navigate("/chat");
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

  const {
    data: me,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: getLoggedInUser,
    retry: false,
  });

  if (isLoading) return <PageLoader />;

  if (!me || isError) return <Navigate to="/signin" replace />;

  if (me.isEmailVerified) return <Navigate to="/chat" replace />;

  return (
    <div className="min-h-screen flex fle-col items-center justify-center overflow-x-hidden py-6 px-4">
      <div className="grid md:grid-cols-2 items-center gap-6 w-full">
        <div className="border border-slate-300 rounded-lg p-6 lg:max-w-2xl shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] w-full">
          <div className="flex w-full flex-wrap text-slate-800">
            <div className="flex w-full flex-col">
              <div className="my-auto mx-auto flex flex-col justify-center pt-8 md:justify-start w-full">
                <div className="flex w-full flex-col rounded-2xl bg-white px-2 sm:px-8 md:px-2 lg:px-8">
                  <div>
                    <div>
                      <div className="mb-5 space-y-2">
                        <h1 className="font-semibold text-xl">
                          Verify your email address
                        </h1>
                        <p className="text-slate-500">
                          We have sent a 6-digit verification code to the email
                          address associated with your account,{" "}
                          <strong>{me.email}</strong>. To complete the
                          confirmation of your email address, please enter the
                          provided code in the field below.
                        </p>
                      </div>
                      <div className="mb-5">
                        <OTPInput
                          ref={otpRef}
                          onValueChange={(otp) => handleChangeOTP(otp)}
                          isDisabled={isVerifyPending}
                        />
                        {error && (
                          <p className="text-sm text-destructive mt-2">
                            {error}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-500">
                        Haven't you received anything yet?
                      </p>
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
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-md:mt-8 hidden md:block">
          <img
            src="/assets/verify-email.png"
            className="w-full mx-auto block object-cover"
            alt="verify-email"
          />
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
