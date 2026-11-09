from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.budget import Budget
from app.models.category import Category
from app.models.user import User
from app.schemas.budget import BudgetInput, BudgetRead
from app.security import get_current_user

router = APIRouter(prefix="/budgets", tags=["budgets"])


def to_read(budget: Budget) -> BudgetRead:
    return BudgetRead(id=budget.id, user_id=budget.user_id, category_id=budget.category_id, amount=f"{budget.amount:.2f}", month=budget.month, created_at=budget.created_at)


def validate_category(db: Session, category_id: int) -> None:
    category = db.get(Category, category_id)
    if category is None or category.type != "expense":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Budgets require an expense category.")


def get_owned_budget(db: Session, budget_id: int, user_id: int) -> Budget:
    budget = db.scalar(select(Budget).where(Budget.id == budget_id, Budget.user_id == user_id))
    if budget is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found.")
    return budget


@router.get("", response_model=list[BudgetRead])
def list_budgets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[BudgetRead]:
    budgets = db.scalars(select(Budget).where(Budget.user_id == current_user.id).order_by(Budget.month.desc(), Budget.id.desc())).all()
    return [to_read(budget) for budget in budgets]


@router.post("", response_model=BudgetRead, status_code=status.HTTP_201_CREATED)
def create_budget(payload: BudgetInput, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> BudgetRead:
    validate_category(db, payload.category_id)
    budget = Budget(user_id=current_user.id, category_id=payload.category_id, amount=payload.amount, month=payload.month)
    db.add(budget)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A budget already exists for this category and month.") from None
    db.refresh(budget)
    return to_read(budget)


@router.put("/{budget_id}", response_model=BudgetRead)
def update_budget(budget_id: int, payload: BudgetInput, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> BudgetRead:
    budget = get_owned_budget(db, budget_id, current_user.id)
    validate_category(db, payload.category_id)
    budget.category_id = payload.category_id
    budget.amount = payload.amount
    budget.month = payload.month
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A budget already exists for this category and month.") from None
    db.refresh(budget)
    return to_read(budget)


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(budget_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> None:
    budget = get_owned_budget(db, budget_id, current_user.id)
    db.delete(budget)
    db.commit()
