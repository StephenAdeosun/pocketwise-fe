from pydantic import BaseModel

from app.schemas.transaction import TransactionRead


class BudgetProgressRead(BaseModel):
    budget_id: int
    category_id: int
    category: str
    allocated: str
    spent: str
    remaining: str
    percentage: int
    status: str


class DashboardSummaryRead(BaseModel):
    total_balance: str
    monthly_income: str
    monthly_expenses: str
    monthly_budget: str
    recent_transactions: list[TransactionRead]
    budget_progress: list[BudgetProgressRead]
