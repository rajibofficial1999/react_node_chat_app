import { signup } from "@/actions/auth";
import IconInput from "@/components/IconInput";
import InputWrapper from "@/components/InputWrapper";
import LoaderButton from "@/components/LoaderButton";
import useStore from "@/lib/store";
import { parseError } from "@/lib/utils";
import { signupSchema, type SignupData } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, User, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

const Signup = () => {
  const [passwordType, setPasswordType] = useState<"password" | "text">(
    "password"
  );
  const {
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
  });

  const navigate = useNavigate();
  const { setUser } = useStore((state) => state);

  const { mutate, isPending } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      setUser(data.user);
      toast("Signed up successfully");
      navigate("/chat");
    },
    onError: (error) => {
      let parsedError = parseError(error);

      setError("name", { type: "manual", message: parsedError });
    },
  });

  const onSubmit = (data: SignupData) => {
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
                    Sign up
                  </h3>
                  <p className="text-slate-500 text-sm mt-6 leading-relaxed">
                    Our registration process is designed to be straightforward
                    and secure. We prioritize your privacy and data security.
                  </p>
                </div>

                <div>
                  <label className="text-slate-800 text-sm font-medium mb-2 block">
                    Full name
                  </label>
                  <InputWrapper name="name" errors={errors}>
                    <IconInput
                      icon={User}
                      placeholder="Enter full name"
                      {...register("name")}
                    />
                  </InputWrapper>
                </div>

                <div>
                  <label className="text-slate-800 text-sm font-medium mb-2 block">
                    Username
                  </label>
                  <InputWrapper name="username" errors={errors}>
                    <IconInput
                      icon={UserRound}
                      placeholder="Enter username"
                      {...register("username")}
                    />
                  </InputWrapper>
                </div>
                <div>
                  <label className="text-slate-800 text-sm font-medium mb-2 block">
                    Password
                  </label>
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

                <div className="!mt-6">
                  <LoaderButton isLoading={isPending} className="w-full py-5">
                    Sign up
                  </LoaderButton>
                  <p className="text-sm !mt-4 text-center text-slate-500">
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
                src="/assets/signup.png"
                className="w-full mx-auto block object-cover"
                alt="signup img"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
