# MarSUKAT - Marinduque State University Production Monitoring and Inventory Management System

MarSUKAT is a comprehensive system for Marinduque State University featuring production monitoring, inventory management, and reporting tools. The system enables students to place orders and schedule measurements, while also providing tools for tracking rentals and managing commercial jobs.

## Features

- **Production Monitoring**
  - School Uniform Production
  - Academic Gown Production
  - Raw Materials Usage Tracking
  - Production Analytics

- **Inventory Management**
  - Raw Materials Inventory
  - School Uniform Inventory
  - Academic Gown Inventory
  - Low Stock Alerts

- **Student Services**
  - Online Ordering System
  - Measurement Scheduling
  - Order Status Tracking
  - Digital Receipt Management

- **Administrative Tools**
  - User Management
  - Department Management
  - Sales Reporting
  - Analytics Dashboard

## Tech Stack

- **Frontend**
  - React + Vite
  - TailwindCSS
  - Shadcn UI
  - React Query
  - React Router

- **Backend**
  - Node.js
  - Express
  - MongoDB
  - JWT Authentication

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Docker (optional)
- Git

## Installation

### Option 1: Local Development

1. Clone the repository
```bash
git clone https://github.com/Kukaas/MarSUKAT-.git
cd MarSUKAT-
```

2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

3. Install Backend Dependencies
```bash
cd ../backend
npm install
```

4. Create Environment Files

Frontend (.env):
```env
VITE_SUPER_ADMIN_ACCESS_KEY=admin_access_password
VITE_API_URL=http://localhost:3000/api/v1
VITE_API_URL_NETWORK=your_ip_network
VITE_NODE_ENV=development
VITE_OCR_API_KEY=your_OCR_key
```

Backend (.env):
```env
MONGODB_URI=your_mongodb_uri
PORT=3000
NODE_ENV=development
AUTH_EMAIL=your_email@gmail.com
AUTH_PASSWORD=your_email_app_password
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
```

5. Start Development Servers

Frontend:
```bash
cd frontend
npm run dev
```

Backend:
```bash
cd backend
npm run dev
```

### Option 2: Using Docker

1. Clone the repository
```bash
git clone https://github.com/yourusername/MarSUKAT-.git
cd MarSUKAT-
```

2. Build and run with Docker Compose
```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Project Structure

```
MarSUKAT-/
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── routes/        # Route configurations
│   │   └── lib/           # Utilities and helpers
│   └── ...
├── backend/                # Node.js + Express backend
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── utils/            # Utility functions
└── ...
```

## Role-Based Access

- **Super Admin**: System configuration and user management
- **BAO**: Inventory and production management
- **Job Order**: Production monitoring and inventory tracking
- **Student**: Order placement and tracking
- **Coordinator**: Rentals placement and tracking

## Environment Support

- Modern evergreen browsers
- Mobile-responsive design
- Cross-platform compatibility

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is the property of Marinduque State University. All rights reserved.

## Author

- Chester Luke A. Maligaso

## Acknowledgments

- Marinduque State University
- Faculty and Staff
- Development Team
