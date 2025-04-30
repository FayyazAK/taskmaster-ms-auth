# 🔐 TaskMaster Auth Service

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange.svg)

The TaskMaster Auth Service is a dedicated microservice responsible for user authentication and authorization in the TaskMaster ecosystem.

## ✨ Features

### Authentication

- JWT-based authentication with secure cookie options
- User registration and login endpoints
- Password hashing with bcrypt
- Secure session management
- Token refresh mechanism

### Authorization

- Role-based access control (admin/regular users)
- Permission management
- Token validation and verification
- Secure middleware for protected routes

### Security

- HTTPS support
- Rate limiting to prevent abuse
- Input validation and sanitization
- Helmet security headers
- CORS protection with configurable settings

## 🛠️ Technical Stack

- **Backend**: Node.js, Express.js 5.x
- **Authentication**: JWT, bcrypt
- **Security**: Helmet, rate-limiting
- **Logging**: Winston with daily rotation

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/YourUsername/taskmaster-ms-auth.git
   cd taskmaster-ms-auth
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file using `.env-example` as template

4. Start the service:
   ```bash
   # Development mode
   npm start
   ```

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/current-user` - Get current user info
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh JWT token

### User Management

- `PUT /api/user/update-profile` - Update user profile

### Admin Routes (admin role required)

- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `POST /api/admin/users` - Create a new user
- `PUT /api/admin/users/:id` - Update a user
- `DELETE /api/admin/users/:id` - Delete a user

## 🔐 Security Considerations

- Always change default admin credentials in production
- Use environment variables for sensitive information
- Enable HTTPS in production
- Configure proper CORS settings
- Set appropriate rate limits
- Regularly update dependencies

## 📄 License

This project is licensed under the ISC License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue in the GitHub repository.

---

Made with ❤️ by Fayyaz AK
