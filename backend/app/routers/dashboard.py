from decimal import Decimal
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.budget import Budget
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.dashboard import BudgetProgressRead, DashboardSummaryRead
from app.schemas.transaction import TransactionRead
from app.security import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def amount(value: Decimal) -> str:
    return f"{value:.2f}"


def transaction_read(transaction: Transaction) -> TransactionRead:
    return TransactionRead(id=transaction.id, user_id=transaction.user_id, category_id=transaction.category_id, type=transaction.type, amount=amount(transaction.amount), description=transaction.description, transaction_date=transaction.transaction_date, created_at=transaction.created_at)


@router.get("/summary", response_model=DashboardSummaryRead)
def summary(month: str = Query(pattern=r"^\d{4}-(0[1-9]|1[0-2])$"), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> DashboardSummaryRead:
    transactions = db.scalars(select(Transaction).where(Transaction.user_id == current_user.id)).all()
    budgets = db.scalars(select(Budget).where(Budget.user_id == current_user.id, Budget.month == month)).all()
    categories = {category.id: category.name for category in db.scalars(select(Category)).all()}
    monthly_transactions = [item for item in transactions if item.transaction_date.strftime("%Y-%m") == month]
    income = sum((item.amount for item in transactions if item.type == "income"), Decimal("0"))
    monthly_income = sum((item.amount for item in monthly_transactions if item.type == "income"), Decimal("0"))
    monthly_expenses = sum((item.amount for item in monthly_transactions if item.type == "expense"), Decimal("0"))
    monthly_budget = sum((item.amount for item in budgets), Decimal("0"))
    progress = []
    for budget in budgets:
        spent = sum((item.amount for item in monthly_transactions if item.type == "expense" and item.category_id == budget.category_id), Decimal("0"))
        percentage = int((spent / budget.amount * 100).quantize(Decimal("1"))) if budget.amount else 0
        status = "exceeded" if spent > budget.amount else "approaching" if spent / budget.amount >= Decimal("0.8") else "normal"
        progress.append(BudgetProgressRead(budget_id=budget.id, category_id=budget.category_id, category=categories.get(budget.category_id, "Unknown category"), allocated=amount(budget.amount), spent=amount(spent), remaining=amount(max(budget.amount - spent, Decimal("0"))), percentage=percentage, status=status))
    recent = sorted(monthly_transactions, key=lambda item: (item.transaction_date, item.id), reverse=True)[:5]
    balance = income - sum((item.amount for item in transactions if item.type == "expense"), Decimal("0"))
    return DashboardSummaryRead(total_balance=amount(balance), monthly_income=amount(monthly_income), monthly_expenses=amount(monthly_expenses), monthly_budget=amount(monthly_budget), recent_transactions=[transaction_read(item) for item in recent], budget_progress=progress)
