"""Create initial application schema.

Revision ID: 20261109_01
Revises:
Create Date: 2026-11-09
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261109_01"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("type", sa.String(length=20), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=False)
    op.create_table(
        "transactions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(length=20), nullable=False),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=False),
        sa.Column("transaction_date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_transactions_user_date",
        "transactions",
        ["user_id", "transaction_date"],
        unique=False,
    )
    op.create_index(
        "ix_transactions_user_type_category",
        "transactions",
        ["user_id", "type", "category_id"],
        unique=False,
    )
    op.create_table(
        "budgets",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("month", sa.String(length=7), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id",
            "category_id",
            "month",
            name="uq_budget_user_category_month",
        ),
    )
    op.create_index(
        "ix_budgets_user_month",
        "budgets",
        ["user_id", "month"],
        unique=False,
    )
    op.bulk_insert(
        sa.table(
            "categories",
            sa.column("id", sa.Integer()),
            sa.column("name", sa.String()),
            sa.column("type", sa.String()),
        ),
        [
            {"id": 1, "name": "Allowance", "type": "income"},
            {"id": 2, "name": "Scholarship", "type": "income"},
            {"id": 3, "name": "Part-time job", "type": "income"},
            {"id": 4, "name": "Business", "type": "income"},
            {"id": 5, "name": "Other", "type": "income"},
            {"id": 6, "name": "Food", "type": "expense"},
            {"id": 7, "name": "Transportation", "type": "expense"},
            {"id": 8, "name": "Accommodation", "type": "expense"},
            {"id": 9, "name": "Academic materials", "type": "expense"},
            {"id": 10, "name": "Data and Airtime", "type": "expense"},
            {"id": 11, "name": "Personal care", "type": "expense"},
            {"id": 12, "name": "Entertainment", "type": "expense"},
            {"id": 13, "name": "Other", "type": "expense"},
        ],
    )


def downgrade() -> None:
    op.drop_index("ix_budgets_user_month", table_name="budgets")
    op.drop_table("budgets")
    op.drop_index("ix_transactions_user_type_category", table_name="transactions")
    op.drop_index("ix_transactions_user_date", table_name="transactions")
    op.drop_table("transactions")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    op.drop_table("categories")
