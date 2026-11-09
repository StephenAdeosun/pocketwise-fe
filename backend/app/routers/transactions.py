from datetime import date
from decimal import Decimal
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionInput, TransactionRead
from app.security import get_current_user

router = APIRouter(prefix="/transactions", tags=["transactions"])


def to_read(transaction: Transaction) -> TransactionRead:
    return TransactionRead(
        id=transaction.id,
        user_id=transaction.user_id,
        category_id=transaction.category_id,
        type=transaction.type, # pyright: ignore[reportArgumentType]
        amount=f"{transaction.amount:.2f}",
        description=transaction.description,
        transaction_date=transaction.transaction_date,
        created_at=transaction.created_at,
    )


def get_category_or_error(db: Session, category_id: int, transaction_type: str) -> Category:
    category = db.get(Category, category_id)
    if category is None or category.type != transaction_type:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category does not match the transaction type.")
    return category


def next_month_start(month: str) -> date:
    year, month_number = (int(value) for value in month.split("-"))
    return date(year + 1, 1, 1) if month_number == 12 else date(year, month_number + 1, 1)


@router.get("", response_model=list[TransactionRead])
def list_transactions(
    type: Literal["income", "expense"] | None = None,
    category_id: int | None = Query(default=None, gt=0),
    month: str | None = Query(default=None, pattern=r"^\d{4}-(0[1-9]|1[0-2])$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TransactionRead]:
    statement = select(Transaction).where(Transaction.user_id == current_user.id)
    if type is not None:
        statement = statement.where(Transaction.type == type)
    if category_id is not None:
        statement = statement.where(Transaction.category_id == category_id)
    if month is not None:
        statement = statement.where(Transaction.transaction_date >= date.fromisoformat(f"{month}-01"), Transaction.transaction_date < next_month_start(month))
    transactions = db.scalars(statement.order_by(Transaction.transaction_date.desc(), Transaction.id.desc())).all()
    return [to_read(transaction) for transaction in transactions]


@router.post("", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
def create_transaction(payload: TransactionInput, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> TransactionRead:
    get_category_or_error(db, payload.category_id, payload.type)
    transaction = Transaction(user_id=current_user.id, category_id=payload.category_id, type=payload.type, amount=payload.amount, description=payload.description.strip(), transaction_date=payload.transaction_date)
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return to_read(transaction)


@router.get("/{transaction_id}", response_model=TransactionRead)
def get_transaction(transaction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> TransactionRead:
    transaction = db.scalar(select(Transaction).where(Transaction.id == transaction_id, Transaction.user_id == current_user.id))
    if transaction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")
    return to_read(transaction)


@router.put("/{transaction_id}", response_model=TransactionRead)
def update_transaction(transaction_id: int, payload: TransactionInput, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> TransactionRead:
    transaction = db.scalar(select(Transaction).where(Transaction.id == transaction_id, Transaction.user_id == current_user.id))
    if transaction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")
    get_category_or_error(db, payload.category_id, payload.type)
    transaction.category_id = payload.category_id
    transaction.type = payload.type
    transaction.amount = Decimal(payload.amount)
    transaction.description = payload.description.strip()
    transaction.transaction_date = payload.transaction_date
    db.commit()
    db.refresh(transaction)
    return to_read(transaction)


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> None:
    transaction = db.scalar(select(Transaction).where(Transaction.id == transaction_id, Transaction.user_id == current_user.id))
    if transaction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")
    db.delete(transaction)
    db.commit()
