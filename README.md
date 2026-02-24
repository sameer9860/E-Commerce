# 🛒 E-Commerce (Django + DRF + React)

A simple e-commerce platform built with **Django**, **Django REST Framework (DRF)**, and **React**.  
This project is inspired by marketplaces like Daraz, with support for **vendors** (who upload/manage products) and **customers** (who browse and purchase).

---

## 🚀 Features
- User accounts with roles (Vendor / Customer)
- Product management (CRUD APIs)
- RESTful API using Django REST Framework
- Ready to connect with React frontend
- Secure authentication (JWT planned)

---

## 📂 Project Structure
ecommerce/
│
├── ecommerce/        # Project settings
├── products/         # Product catalog (models, views, serializers, urls)
├── users/            # Custom user model with roles
├── orders/           # (Upcoming) Cart, checkout, payments
└── manage.py



---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/sameer9860/E-Commerce.git
cd E-Commerce

```
### Create Virtual Environment
python -m venv venv
source venv/bin/activate   # On Linux/Mac
venv\Scripts\activate      # On Windows

pip install -r requirements.txt

