import { resetPassword } from "@/actions/auth";
import IconInput from "@/components/IconInput";
import InputWrapper from "@/components/InputWrapper";
import LoaderButton from "@/components/LoaderButton";
import { Label } from "@/components/ui/label";
import { parseError } from "@/lib/utils";
import { resetPasswordSchema, type ResetPasswordData } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

const ResetPassword = () => {
  const [passwordType, setPasswordType] = useState<"password" | "text">(
    "password"
  );
  const [confirmPasswordType, setConfirmPasswordType] = useState<
    "password" | "text"
  >("password");

  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast("Password reset successfully");
      navigate("/signin");
    },
    onError: (error) => {
      let parsedError = parseError(error);

      setError("password", { type: "manual", message: parsedError });
    },
  });

  const onSubmit = (data: ResetPasswordData) => {
    mutate({
      password: data.password,
      token,
    });
  };

  return (
    <div>
      <div className="min-h-screen flex fle-col items-center justify-center">
        <div className="py-6 px-4">
          <div className="grid md:grid-cols-2 items-center gap-6 max-w-6xl w-full">
            <div className="border border-slate-300 rounded-lg p-6 max-w-md shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] max-md:mx-auto">
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-8">
                  <h3 className="text-slate-900 text-3xl font-semibold">
                    Reset password
                  </h3>
                  <p className="text-slate-500 text-sm mt-6 leading-relaxed">
                    Set a new password for your account.
                  </p>
                </div>

                <div>
                  <Label className="mb-2">Password</Label>
                  <InputWrapper name="password" errors={errors}>
                    <IconInput
                      icon={passwordType === "password" ? Eye : EyeOff}
                      type={passwordType}
                      placeholder="Enter password"
                      iconClassName="cursor-pointer"
                      handleIconClick={() =>
                        setPasswordType((prev) =>
                          prev === "password" ? "text" : "password"
                        )
                      }
                      {...register("password")}
                    />
                  </InputWrapper>
                </div>
                <div>
                  <Label className="mb-2">Confirm password</Label>
                  <InputWrapper name="confirmPassword" errors={errors}>
                    <IconInput
                      icon={confirmPasswordType === "password" ? Eye : EyeOff}
                      type={confirmPasswordType}
                      placeholder="Enter confirm password"
                      iconClassName="cursor-pointer"
                      handleIconClick={() =>
                        setConfirmPasswordType((prev) =>
                          prev === "password" ? "text" : "password"
                        )
                      }
                      {...register("confirmPassword")}
                    />
                  </InputWrapper>
                </div>

                <div className="mt-5">
                  <LoaderButton isLoading={isPending} className="w-full py-5">
                    Reset password
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

export default ResetPassword;
