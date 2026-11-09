from uuid import uuid4


def register_and_login(client, full_name: str = "Test Student") -> tuple[dict, dict]:
    email = f"{uuid4().hex}@example.com"
    registration = client.post(
        "/api/auth/register",
        json={
            "full_name": full_name,
            "email": email,
            "password": "secret123",
            "password_confirmation": "secret123",
        },
    )
    assert registration.status_code == 201
    login = client.post("/api/auth/login", json={"email": email, "password": "secret123"})
    assert login.status_code == 200
    return registration.json(), {"Authorization": f"Bearer {login.json()['access_token']}"}


def test_authentication_and_categories(client):
    user, headers = register_and_login(client)
    assert client.get("/api/auth/me", headers=headers).json()["email"] == user["email"]
    categories = client.get("/api/categories", headers=headers)
    assert categories.status_code == 200
    assert len(categories.json()) == 13


def test_finance_crud_summary_and_duplicate_budget(client):
    _, headers = register_and_login(client)
    transaction = client.post(
        "/api/transactions",
        headers=headers,
        json={
            "type": "expense",
            "category_id": 6,
            "amount": "123.45",
            "description": "Test lunch",
            "transaction_date": "2026-11-08",
        },
    )
    assert transaction.status_code == 201

    budget_payload = {"category_id": 6, "amount": "1000.00", "month": "2026-11"}
    budget = client.post("/api/budgets", headers=headers, json=budget_payload)
    assert budget.status_code == 201
    duplicate = client.post("/api/budgets", headers=headers, json=budget_payload)
    assert duplicate.status_code == 409

    summary = client.get("/api/dashboard/summary?month=2026-11", headers=headers)
    assert summary.status_code == 200
    assert summary.json()["monthly_expenses"] == "123.45"
    assert summary.json()["budget_progress"][0]["status"] == "normal"


def test_user_data_isolation(client):
    _, first_headers = register_and_login(client, "First Student")
    _, second_headers = register_and_login(client, "Second Student")
    created = client.post(
        "/api/transactions",
        headers=first_headers,
        json={
            "type": "income",
            "category_id": 1,
            "amount": "500.00",
            "description": "Private allowance",
            "transaction_date": "2026-11-08",
        },
    )
    transaction_id = created.json()["id"]
    assert client.get("/api/transactions", headers=second_headers).json() == []
    assert client.get(f"/api/transactions/{transaction_id}", headers=second_headers).status_code == 404
