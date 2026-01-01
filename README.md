# Commercial Website Project

A full-stack e-commerce application with Django Backend and React Frontend.

## Features
- **User Authentication**: Register, Login (Token-based).
- **Product Management**: Admin Dashboard (Django Admin) to add/manage Categories and Products.
- **Shopping**: Browse products, filter by category, add to cart.
- **Checkout**: Guest or User checkout with address saving.
- **Orders**: Order tracking (simulated).

## Prerequisites
- Python 3.10+
- Node.js 16+

## Environment Variables

### Backend
Create a `.env` file in the `backend/` directory and copy the contents from `.env.example`.
```bash
cp backend/.env.example backend/.env
```
Update the variables as needed.

## Setup & Run

### Backend
1. Navigate to `backend/`
2. Create/Activate virtual env: `python3 -m venv venv && source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt` (or manually as done)
4. Migrate: `python3 manage.py migrate`
5. Create Superuser: `echo "from apps.accounts.models import User; User.objects.create_superuser('admin@example.com', 'admin')" | python3 manage.py shell`
6. Run Server: `python3 manage.py runserver`

Access Admin at: `http://localhost:8000/admin/` (Login: admin@example.com / admin)
Access API at: `http://localhost:8000/api/`

### Frontend
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Run Server: `npm run dev`

Access App at: `http://localhost:5173/`
