import type { Budget, Category, Transaction, User } from "@/types/finance";

export const demoUser: User = {
  id: 1,
  full_name: "Kehinde Ade",
  email: "kehinde@example.com",
};

export const categories: Category[] = [
  { id: 1, name: "Allowance", type: "income" },
  { id: 2, name: "Scholarship", type: "income" },
  { id: 3, name: "Part-time job", type: "income" },
  { id: 4, name: "Business", type: "income" },
  { id: 5, name: "Other", type: "income" },
  { id: 6, name: "Food", type: "expense" },
  { id: 7, name: "Transportation", type: "expense" },
  { id: 8, name: "Accommodation", type: "expense" },
  { id: 9, name: "Academic materials", type: "expense" },
  { id: 10, name: "Data and Airtime", type: "expense" },
  { id: 11, name: "Personal care", type: "expense" },
  { id: 12, name: "Entertainment", type: "expense" },
  { id: 13, name: "Other", type: "expense" },
];

export const demoTransactions: Transaction[] = [
  {
    id: 1,
    user_id: 1,
    category_id: 6,
    type: "expense",
    amount: "2400.00",
    description: "Campus cafeteria",
    transaction_date: "2026-11-07",
    created_at: "2026-11-07T12:45:00Z",
  },
  {
    id: 2,
    user_id: 1,
    category_id: 1,
    type: "income",
    amount: "50000.00",
    description: "Monthly allowance",
    transaction_date: "2026-11-05",
    created_at: "2026-11-05T09:00:00Z",
  },
  {
    id: 3,
    user_id: 1,
    category_id: 10,
    type: "expense",
    amount: "5000.00",
    description: "Data subscription",
    transaction_date: "2026-11-04",
    created_at: "2026-11-04T10:00:00Z",
  },
  {
    id: 4,
    user_id: 1,
    category_id: 9,
    type: "expense",
    amount: "8500.00",
    description: "Course materials",
    transaction_date: "2026-11-02",
    created_at: "2026-11-02T15:30:00Z",
  },
  {
    id: 5,
    user_id: 1,
    category_id: 7,
    type: "expense",
    amount: "9600.00",
    description: "Transport for the month",
    transaction_date: "2026-11-01",
    created_at: "2026-11-01T08:30:00Z",
  },
  {
    id: 6,
    user_id: 1,
    category_id: 6,
    type: "expense",
    amount: "15800.00",
    description: "Groceries and meals",
    transaction_date: "2026-11-01",
    created_at: "2026-11-01T08:00:00Z",
  },
];

export const demoBudgets: Budget[] = [
  {
    id: 1,
    user_id: 1,
    category_id: 6,
    amount: "25000.00",
    month: "2026-11",
    created_at: "2026-11-01T07:00:00Z",
  },
  {
    id: 2,
    user_id: 1,
    category_id: 7,
    amount: "15000.00",
    month: "2026-11",
    created_at: "2026-11-01T07:05:00Z",
  },
  {
    id: 3,
    user_id: 1,
    category_id: 9,
    amount: "10000.00",
    month: "2026-11",
    created_at: "2026-11-01T07:10:00Z",
  },
];
