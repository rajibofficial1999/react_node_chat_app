import { getLoggedInUser, changeAuthUserAvatar } from "@/actions/users";
import { updateOnboardingStatus, updateUserInfo } from "@/actions/auth";
import LoaderButton from "@/components/LoaderButton";
import PageLoader from "@/components/PageLoader";
import { cn, parseError } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoveRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { toast } from "sonner";
import AddEmailForm from "./Partials/AddEmailForm";
import FinalStep from "./Partials/FinalStep";
import OTPForm from "./Partials/OTPForm";
import UploadProfilePic from "./Partials/UploadProfilePic";

interface FormPendingState {
  [key: number]: boolean;
}

const OnBoarding = () => {
  const [step, setStep] = useState(1);
  const [formPendingState, setFormPendingState] = useState<FormPendingState>(
    {}
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [terms, setTerms] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const {
    data: me,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: getLoggedInUser,
    retry: false,
  });

  const { mutate: updateUserEmail, isPending: isEmailPending } = useMutation({
    mutationFn: updateUserInfo,
    onSuccess: () => {
      toast("Add email address successfully");
      setStep(2);
      queryClient.invalidateQueries(["me"] as any);
    },
    onError: (error) => {
      let parsedError = parseError(error);

      setError(parsedError);
    },
  });

  const { mutate: uploadAvatar, isPending: isAvatarPending } = useMutation({
    mutationFn: changeAuthUserAvatar,
    onSuccess: () => {
      toast("Profile picture updated successfully");
      setStep(4);
      queryClient.invalidateQueries(["me"] as any);
    },
    onError: (error) => {
      let parsedError = parseError(error);

      setError(parsedError);
    },
  });

  const { mutate: finishedOnboarding, isPending: isPendingOnboarding } =
    useMutation({
      mutationFn: updateOnboardingStatus,
      onSuccess: () => {
        navigate("/chat");
      },
      onError: (error) => {
        let parsedError = parseError(error);

        setError(parsedError);
      },
    });

  const handleContinue = () => {
    if (step === 1) {
      updateUserEmail({
        name,
        email,
      });
    }

    if (step === 3) {
      uploadAvatar(avatar as File);
    }

    if (step === 4) {
      finishedOnboarding();
    }
  };

  useEffect(() => {
    if (me) {
      setName(me.name);

      if (me.email && !me.isEmailVerified) {
        setStep(2);
      } else if (me.isEmailVerified && !me.avatar) {
        setStep(3);
      } else if (me.isEmailVerified && me.avatar) {
        setStep(4);
      }
    }
  }, [me]);

  useEffect(() => {
    const validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const ready =
      (step === 1 && name && validEmail.test(email) && terms) ||
      step === 2 ||
      (step === 3 && !!avatar) ||
      step === 4;

    setFormPendingState((prev) => ({
      ...prev,
      [step]: ready,
    }));
  }, [name, email, terms, avatar, step]);

  if (isLoading) return <PageLoader />;

  if (!me || isError) return <Navigate to="/signin" replace />;

  if (!me.onBoarding) return <Navigate to="/chat" replace />;

  return (
    <div className="min-h-screen flex fle-col items-center justify-center overflow-x-hidden py-6 px-4">
      <div className="grid md:grid-cols-2 items-center gap-6 w-full">
        <div className="border border-slate-300 rounded-lg p-6 lg:max-w-2xl shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] w-full">
          <div className="flex w-full flex-wrap text-slate-800">
            <div className="flex w-full flex-col">
              <div className="my-auto mx-auto flex flex-col justify-center pt-8 md:justify-start w-full">
                <div className="flex w-full flex-col rounded-2xl bg-white px-2 sm:px-8 md:px-2 lg:px-8">
                  <div className="mx-auto w-full pb-10">
                    <div className="relative">
                      <div
                        className="absolute left-0 top-2 h-0.5 w-full bg-primary/30"
                        aria-hidden="true"
                      >
                        <div className="absolute h-full w-1/3 bg-primary"></div>

                        <div className="left absolute left-1/3 h-full w-1/3 bg-gradient-to-r from-primary"></div>
                      </div>
                      <ul className="relative flex w-full justify-between">
                        {Array.from({ length: 4 }).map((_, i) => {
                          const isActive = i + 1 === step;
                          let opacity = 100;
                          const perDecreseOpactity = 15;
                          opacity = opacity - perDecreseOpactity * i;

                          const bgClass =
                            opacity === 100 || i + 1 < step
                              ? "bg-primary"
                              : `bg-primary/${String(opacity)}`;

                          return (
                            <li className="text-left" key={i}>
                              <button
                                className={cn(
                                  `flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold text-white ${bgClass}`,
                                  {
                                    "ring ring-primary ring-offset-2 !bg-primary":
                                      isActive,
                                  }
                                )}
                              >
                                {i + 1}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                  {step === 1 && (
                    <AddEmailForm
                      name={name}
                      setName={setName}
                      email={email}
                      setEmail={setEmail}
                      setTerms={setTerms}
                      error={error}
                      setError={setError}
                    />
                  )}
                  {step === 2 && (
                    <OTPForm
                      setStep={setStep}
                      me={me}
                      error={error}
                      setError={setError}
                    />
                  )}
                  {step === 3 && (
                    <UploadProfilePic setAvatar={setAvatar} me={me} />
                  )}
                  {step === 4 && <FinalStep />}

                  <div className="flex justify-end mt-5 pb-5">
                    {step !== 2 && (
                      <LoaderButton
                        className="py-5 mt-4"
                        isLoading={
                          isEmailPending ||
                          isAvatarPending ||
                          isPendingOnboarding
                        }
                        onClick={handleContinue}
                        disabled={
                          !formPendingState[step] ||
                          isEmailPending ||
                          isAvatarPending ||
                          isPendingOnboarding
                        }
                      >
                        {step === 4 ? (
                          "Get started"
                        ) : (
                          <>
                            Next
                            <MoveRight className="size-4 ml-2" />
                          </>
                        )}
                      </LoaderButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-md:mt-8 hidden md:block">
          <img
            src="/assets/onboarding.png"
            className="w-full mx-auto block object-cover"
            alt="onboarding"
          />
        </div>
      </div>
    </div>
  );
};

export default OnBoarding;
