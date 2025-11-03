# Pro-Train - Training Management System

## Overview

Pro-Train is a comprehensive training management system designed to streamline the process of conducting and managing corporate training programs. It provides a platform for trainers to create and manage training sessions, and for employees to enroll, participate, and track their progress.

## Features

### For Employees
- **Training Enrollment**: Browse and enroll in available training programs
- **Material Access**: Access training materials and resources
- **Quiz Taking**: Complete assessments to test knowledge
- **Progress Tracking**: Monitor personal training progress
- **Certificate Generation**: Receive certificates upon successful completion
- **Feedback System**: Provide feedback on completed training sessions

### For Trainers
- **Training Management**: Create and manage training programs
- **Material Management**: Upload and organize training materials
- **Quiz Creation**: Design and manage assessment quizzes
- **Attendance Tracking**: Monitor participant attendance
- **Performance Analytics**: View participant performance and quiz results
- **Feedback Review**: Access participant feedback

## Technology Stack

### Frontend
- React.js
- TailwindCSS for styling
- Vite for build tooling
- React Router for navigation
- Axios for API communication

### Backend
- Node.js
- Express.js
- MySQL database
- JWT for authentication
- Multer for file uploads

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm (v6 or higher)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following configurations:
   ```env
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=pro_train_db
   JWT_SECRET=your_secret_key
   PORT=3001
   ```

4. Initialize the database:
   ```bash
   node scripts/initializeDatabase.js
   ```

5. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
pro-train/
├── backend/
│   ├── config/           # Database and configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── routes/          # API routes
│   ├── database/        # SQL schema files
│   └── scripts/         # Database scripts
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   └── services/    # API services
│   └── public/          # Static files
```

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration

### Trainings
- GET `/api/trainings` - List all trainings
- GET `/api/trainings/:id` - Get training details
- POST `/api/trainings` - Create new training
- PUT `/api/trainings/:id` - Update training
- DELETE `/api/trainings/:id` - Delete training

### Materials
- GET `/api/trainings/:id/materials` - Get training materials
- POST `/api/trainings/:id/materials` - Upload material
- DELETE `/api/trainings/:id/materials/:materialId` - Delete material

### Quizzes
- GET `/api/quizzes/training/:trainingId` - Get training quizzes
- POST `/api/quizzes/create` - Create quiz
- POST `/api/quizzes/:quizId/questions` - Add question
- POST `/api/quizzes/:quizId/start` - Start quiz attempt
- POST `/api/quizzes/response` - Submit quiz response

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- TailwindCSS for the awesome utility-first CSS framework
- React team for the incredible frontend library
- Express.js team for the robust backend framework

## Screenshots

[Include screenshots of key features here]

## Support

For support, please email support@pro-train.com or open an issue in the repository.

---
© 2025 Pro-Train. All rights reserved.