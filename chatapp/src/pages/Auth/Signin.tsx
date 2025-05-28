import { signIn } from "@/actions/auth";
import IconInput from "@/components/IconInput";
import InputWrapper from "@/components/InputWrapper";
import LoaderButton from "@/components/LoaderButton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import useStore from "@/lib/store";
import { parseError } from "@/lib/utils";
import { signinSchema, type SigninData } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

const Signin = () => {
  const [passwordType, setPasswordType] = useState<"password" | "text">(
    "password"
  );
  const {
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = useForm<SigninData>({
    resolver: zodResolver(signinSchema),
  });

  const navigate = useNavigate();
  const { setUser } = useStore((state) => state);

  const { mutate, isPending } = useMutation({
    mutationFn: signIn,
    onSuccess: (data) => {
      setUser(data.user);

      toast("Signed in successfully");
      navigate("/chat");
    },
    onError: (error) => {
      let parsedError = parseError(error);

      setError("username", { type: "manual", message: parsedError });
    },
  });

  const onSubmit = (data: SigninData) => {
    mutate(data);
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
                    Sign in
                  </h3>
                  <p className="text-slate-500 text-sm mt-6 leading-relaxed">
                    Sign in to your account and explore a world of
                    possibilities. Your journey begins here.
                  </p>
                </div>

                <div>
                  <Label className="mb-2">Username or email</Label>
                  <InputWrapper name="username" errors={errors}>
                    <IconInput
                      icon={UserRound}
                      placeholder="Username or email address"
                      {...register("username")}
                    />
                  </InputWrapper>
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

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember-me" />
                    <Label htmlFor="remember-me" className="text-sm">
                      Remember me
                    </Label>
                  </div>

                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="text-primary hover:underline font-medium"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <div className="!mt-12">
                  <LoaderButton isLoading={isPending} className="w-full py-5">
                    Sign in
                  </LoaderButton>
                  <p className="text-sm !mt-6 text-center text-slate-500">
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className="text-primary font-medium hover:underline ml-1 whitespace-nowrap"
                    >
                      Sign up here
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            <div className="max-md:mt-8 hidden md:block">
              <img
                src="/assets/signin.png"
                className="w-full mx-auto block object-cover"
                alt="login img"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
