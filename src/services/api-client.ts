import type {
  Budget,
  BudgetInput,
  Category,
  DashboardSummary,
  Transaction,
  TransactionInput,
  User,
} from "@/types/finance";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";
const tokenKey = "pocketwise-access-token";

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterInput {
  full_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(tokenKey);
}

export function hasAccessToken(): boolean {
  return getToken() !== null;
}

export function clearAccessToken(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(tokenKey);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) message = body.detail;
    } catch {
      // Keep the generic message when the API does not return JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function register(input: RegisterInput): Promise<User> {
  return request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  window.localStorage.setItem(tokenKey, response.access_token);
  return response;
}

export function logout(): void {
  clearAccessToken();
}

export function getCurrentUser(): Promise<User> {
  return request<User>("/auth/me");
}

export function getCategories(): Promise<Category[]> {
  return request<Category[]>("/categories");
}

export function getTransactions(month?: string): Promise<Transaction[]> {
  const query = month ? `?month=${encodeURIComponent(month)}` : "";
  return request<Transaction[]>(`/transactions${query}`);
}

export function createTransaction(input: TransactionInput): Promise<Transaction> {
  return request<Transaction>("/transactions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTransaction(
  id: number,
  input: TransactionInput,
): Promise<Transaction> {
  return request<Transaction>(`/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteTransaction(id: number): Promise<void> {
  return request<void>(`/transactions/${id}`, { method: "DELETE" });
}

export function getBudgets(): Promise<Budget[]> {
  return request<Budget[]>("/budgets");
}

export function createBudget(input: BudgetInput): Promise<Budget> {
  return request<Budget>("/budgets", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateBudget(id: number, input: BudgetInput): Promise<Budget> {
  return request<Budget>(`/budgets/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteBudget(id: number): Promise<void> {
  return request<void>(`/budgets/${id}`, { method: "DELETE" });
}

export function getDashboardSummary(month: string): Promise<DashboardSummary> {
  return request<DashboardSummary>(
    `/dashboard/summary?month=${encodeURIComponent(month)}`,
  );
}
