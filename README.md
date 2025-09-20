# Authentic Sweets - Backend

This is the **backend service** for the Authentic Sweets application.  
It is built with **Node.js, Express, and MongoDB** to provide APIs for authentication, sweets management, and user operations.  
The backend also integrates with **Cloudinary** for image uploads and includes middleware for authentication and authorization.

---

## Features
- User authentication (register, login, JWT-based auth)
- Role-based authorization (admin middleware)
- Sweet management (CRUD operations)
- Image upload support with Cloudinary
- MongoDB with Mongoose models
- RESTful API design
- Test suite for authentication and sweets routes

---
### Admin Role Login credentials use this :
## email : saif@example.com
## password  Password123

## API Endpoints

### Authentication (from `authRoutes.js`)
- `POST /api/auth/register` → Register a new user  
- `POST /api/auth/login` → Login user and receive JWT  

---

### Sweets (from `sweetsRoutes.js`)

#### Public Routes
- `GET /api/sweets/home` → Get sweets for the home page (no auth required)  
- `GET /api/sweets` → Get all sweets (no auth required)  

#### Authenticated Routes
- `GET /api/sweets/search` → Search sweets (requires authentication)  
- `POST /api/sweets/:id/purchase` → Purchase a sweet (requires authentication)  

#### Authenticated + Image Upload
- `POST /api/sweets` → Add a new sweet (requires authentication, supports up to 10 images)  
- `PUT /api/sweets/:id` → Update an existing sweet (requires authentication, supports up to 10 images)  

#### Admin-Only Routes
- `DELETE /api/sweets/:id` → Delete a sweet (admin only)  
- `POST /api/sweets/:id/restock` → Restock a sweet (admin only)  

## My AI Usage

Tool used: ChatGPT

How I used it: I used ChatGPT to help with the overall code structure (project layout and best practices) and to guide me in writing this README documentation.

Logic development: All application logic, controllers, models, and middleware were developed manually by me.

Reflection: ChatGPT was useful for organizing and documenting, but the implementation of routes, database models, and authentication logic was fully handwritten.

## Test Report

All tests were executed with Jest on 2025-09-20.
Test files included:

auth.test.js

sweets.test.js

Result: ✅ All tests passed successfully.

PASS  src/tests/auth.test.js
PASS  src/tests/sweets.test.js

Test Suites: 2 passed, 2 total  
Tests:       All passed  
Snapshots:   0 total  
Time:        1.9 s

