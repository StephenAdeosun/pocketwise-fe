from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, field_validator


class BudgetInput(BaseModel):
    category_id: int = Field(gt=0)
    amount: str
    month: Annotated[str, Field(pattern=r"^\d{4}-(0[1-9]|1[0-2])$")]

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, value: str) -> str:
        try:
            amount = Decimal(value)
        except (InvalidOperation, ValueError):
            raise ValueError("Amount must be a valid decimal string.") from None
        if amount <= 0 or amount.as_tuple().exponent < -2:
            raise ValueError("Amount must be positive with at most two decimal places.")
        return format(amount, ".2f")


class BudgetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    category_id: int
    amount: str
    month: str
    created_at: datetime
