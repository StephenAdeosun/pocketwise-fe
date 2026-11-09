import {
  clearAccessToken,
  login,
  logout,
  register,
} from "@/services/api-client";

export function registerAccount(
  fullName: string,
  email: string,
  password: string,
  passwordConfirmation: string,
) {
  return register({
    full_name: fullName,
    email,
    password,
    password_confirmation: passwordConfirmation,
  });
}

export function loginAccount(email: string, password: string) {
  return login(email, password);
}

export function logoutAccount(): void {
  logout();
}

export { clearAccessToken };
