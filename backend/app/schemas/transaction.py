from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


def validate_amount(value: str) -> str:
    try:
        amount = Decimal(value)
    except (InvalidOperation, ValueError):
        raise ValueError("Amount must be a valid decimal string.") from None
    if amount <= 0 or amount.as_tuple().exponent < -2:
        raise ValueError("Amount must be positive with at most two decimal places.")
    return format(amount, ".2f")


class TransactionInput(BaseModel):
    type: Literal["income", "expense"]
    category_id: int = Field(gt=0)
    amount: str
    description: str = Field(default="", max_length=255)
    transaction_date: date

    _validate_amount = field_validator("amount")(validate_amount)


class TransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    category_id: int
    type: Literal["income", "expense"]
    amount: str
    description: str
    transaction_date: date
    created_at: datetime
