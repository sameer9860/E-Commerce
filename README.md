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

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/sameer9860/E-Commerce.git
cd E-Commerce

```
### 2. Create Virtual Environment and activate
```bash
python -m venv venv
source venv/bin/activate   # On Linux/Mac
venv\Scripts\activate      # On Windows

```

### 3.  Install Dependencies
```bash
pip install -r requirements.txt

```
### 4. Apply Migrations

```bash

python manage.py makemigrations
python manage.py migrate

```

### 5.Create Superuser(Admin)
```bash
python manage.py createsuperuser

```
### 6.Run Development Server
```bash
python manage.py runserver

