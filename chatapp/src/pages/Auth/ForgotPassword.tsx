import { forgotPassword } from "@/actions/auth";
import IconInput from "@/components/IconInput";
import InputWrapper from "@/components/InputWrapper";
import LoaderButton from "@/components/LoaderButton";
import { Label } from "@/components/ui/label";
import { parseError } from "@/lib/utils";
import {
  forgotPasswordSchema,
  type ForgotPasswordData,
} from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import VerificationTimer from "./Partials/VerificationTimer";
import { useCountdown } from "@/hooks/countdown";

const ForgotPassword = () => {
  const [message, setMessage] = useState("");
  const [passwordResetLinkExpiry, setPasswordResetLinkExpiry] = useState("");

  const { isExpired } = useCountdown(passwordResetLinkExpiry);

  const {
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (_data, { email }) => {
      const passwordResetLinkExpiry = new Date();
      passwordResetLinkExpiry.setMinutes(
        passwordResetLinkExpiry.getMinutes() + 1
      );

      setPasswordResetLinkExpiry(passwordResetLinkExpiry.toISOString());

      localStorage.setItem("resend_prl", passwordResetLinkExpiry.toISOString());

      setMessage(`We have sent a link to ${email} to reset your password`);
    },
    onError: (error) => {
      let parsedError = parseError(error);

      setError("email", { type: "manual", message: parsedError });
    },
  });

  const onSubmit = (data: ForgotPasswordData) => {
    mutate(data);
  };

  useEffect(() => {
    const resendPasswordResetLinkExpiry = localStorage.getItem("resend_prl");
    if (resendPasswordResetLinkExpiry) {
      setPasswordResetLinkExpiry(resendPasswordResetLinkExpiry);
    }
  }, []);

  return (
    <div>
      <div className="min-h-screen flex fle-col items-center justify-center">
        <div className="py-6 px-4">
          <div className="grid md:grid-cols-2 items-center gap-6 max-w-6xl w-full">
            <div className="border border-slate-300 rounded-lg p-6 max-w-md shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] max-md:mx-auto">
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-8">
                  <h3 className="text-slate-900 text-3xl font-semibold">
                    Forgot password
                  </h3>
                  <p className="text-slate-500 text-sm mt-6 leading-relaxed">
                    Enter your email address and we will send you a link to
                    reset your password.
                  </p>
                </div>
                {message && (
                  <div className="mb-4">
                    <p className="text-green-500 text-sm leading-relaxed">
                      {message}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="mb-2">Email address</Label>
                  <InputWrapper name="email" errors={errors}>
                    <IconInput
                      type="email"
                      icon={Mail}
                      placeholder="Enter email address"
                      {...register("email")}
                    />
                  </InputWrapper>
                </div>

                <div className="mt-5">
                  <LoaderButton
                    isLoading={isPending}
                    className="w-full py-5"
                    disabled={!isExpired}
                  >
                    <VerificationTimer
                      expiry={passwordResetLinkExpiry}
                      className="mt-0 text-white"
                    >
                      Send reset link
                    </VerificationTimer>
                  </LoaderButton>
                  <p className="text-sm !mt-6 text-center text-slate-500">
                    Already have an account?{" "}
                    <Link
                      to="/signin"
                      className="text-primary font-medium hover:underline ml-1 whitespace-nowrap"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            <div className="max-md:mt-8 hidden md:block">
              <img
                src="/assets/forgot-password.png"
                className="w-full mx-auto block object-cover"
                alt="forgot-password"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
