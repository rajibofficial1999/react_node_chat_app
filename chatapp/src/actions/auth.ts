import axiosInstance from "@/lib/axios";
import type {
  ForgotPasswordData,
  SigninData,
  SignupData,
} from "@/lib/validation";

export const signIn = async (data: SigninData): Promise<AuthResponse> => {
  const response = await axiosInstance.post("/auth/signin", data);

  return response.data;
};

export const signup = async (data: SignupData): Promise<AuthResponse> => {
  const response = await axiosInstance.post("/auth/signup", {
    name: data.name,
    username: data.username,
    password: data.password,
  });

  return response.data;
};

export const SignOut = async (): Promise<void> => {
  await axiosInstance.post("/auth/signout");
};

export const updateUserInfo = async ({
  name,
  email,
}: {
  name: string;
  email: string;
}): Promise<void> => {
  const response = await axiosInstance.patch(`/auth/update-info`, {
    name,
    email,
  });
  return response.data;
};

export const verifyCode = async (code: string): Promise<void> => {
  const response = await axiosInstance.post(`/auth/verify-code`, {
    code,
  });
  return response.data;
};

export const resendCode = async (): Promise<void> => {
  const response = await axiosInstance.post(`/auth/resend-code`);
  return response.data;
};

export const updateOnboardingStatus = async (): Promise<void> => {
  const response = await axiosInstance.patch(`/auth/finish-onboarding`);
  return response.data;
};

export const forgotPassword = async (
  data: ForgotPasswordData
): Promise<void> => {
  const response = await axiosInstance.post(`/auth/forgot-password`, data);
  return response.data;
};

export const resetPassword = async ({
  password,
  token,
}: {
  password: string;
  token: string | null;
}): Promise<void> => {
  const response = await axiosInstance.post(
    `/auth/reset-password`,
    {
      password,
    },
    {
      headers: {
        Authorization: token,
      },
    }
  );
  return response.data;
};
