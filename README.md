# Unistock

**Unistock** is a web application for managing collections and inventories.
Allows users to create their own inventories, add items with custom fields, manage access, likes and comments.

## Tech stack

### Backend
- .NET 7
- Entity Framework Core
- JWT Authentication
- Docker
- SignalR

### Frontend
- React 18
- React-Bootstrap
- i18next
- Axios

## Main features

- **Registration and authentication**
- Authorization via JWT
- Roles (admin / user)
- User profile with the ability to edit name and email

- **Inventories**
- Create, edit, delete
- Write access for other users
- Public / Private settings

- **Custom fields**
- Text (single-line and multi-line)
- Numeric
- Boolean (Yes / No)
- Links
- Max **3 fields of each type** for one inventory

- **Items**
- Add / edit / delete
- Support custom fields
- Item management in a table
- Bulk delete

- **Likes and comments**
- Likes directly on the inventory card
- Comment system

- **Autosave**
- Inventory changes are saved automatically every 7-10 seconds
- Optimistic locking support via `RowVersion`
