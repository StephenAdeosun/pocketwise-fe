from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.category import Category

DEFAULT_CATEGORIES = (
    (1, "Allowance", "income"),
    (2, "Scholarship", "income"),
    (3, "Part-time job", "income"),
    (4, "Business", "income"),
    (5, "Other", "income"),
    (6, "Food", "expense"),
    (7, "Transportation", "expense"),
    (8, "Accommodation", "expense"),
    (9, "Academic materials", "expense"),
    (10, "Data and Airtime", "expense"),
    (11, "Personal care", "expense"),
    (12, "Entertainment", "expense"),
    (13, "Other", "expense"),
)


def seed_categories(db: Session) -> None:
    existing_ids = set(db.scalars(select(Category.id)).all())
    for category_id, name, category_type in DEFAULT_CATEGORIES:
        if category_id not in existing_ids:
            db.add(Category(id=category_id, name=name, type=category_type))
    db.commit()
