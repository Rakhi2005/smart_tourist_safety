<<<<<<< HEAD
# smart_tourist_safety
=======
# Smart Tourist Safety Monitoring & Incident Response System

A comprehensive desktop application built with React, Node.js, and MySQL for monitoring tourist safety and managing incident responses.

## Features

### 🔐 Authentication & Authorization
- User registration and login
- Role-based access control (Admin, Safety Officer, Tourist)
- Secure JWT token authentication
- Profile management

### 📊 Dashboard
- Real-time safety statistics
- Incident overview with charts and graphs
- Recent activity monitoring
- System health indicators

### 🚨 Incident Management
- Report new incidents with detailed information
- Track incident status (Reported, Investigating, Resolved, Closed)
- Severity levels (Low, Medium, High, Critical)
- Incident types (Theft, Accident, Medical, Lost Person, Natural Disaster, Other)
- Location-based incident tracking
- File attachments support

### 📍 Location Management
- Add and manage tourist locations
- Location types (Beach, Mountain, City, Monument, Park, Other)
- Safety level assessment
- GPS coordinates support
- Location-based incident statistics

### 🛡️ Safety Alerts
- Create and manage safety alerts
- Alert types (Weather, Traffic, Security, Medical, General)
- Severity levels (Info, Warning, Danger)
- Location-specific alerts
- Expiration management

### 👥 User Management (Admin)
- User account management
- Role assignment
- Account activation/deactivation
- User activity monitoring

### 🖥️ Desktop Application
- Cross-platform desktop app using Electron
- Native menu integration
- Keyboard shortcuts
- System tray support
- Auto-updater ready

## Technology Stack

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Styled Components** - CSS-in-JS styling
- **React Icons** - Icon library
- **Recharts** - Data visualization
- **React Hot Toast** - Notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Joi** - Data validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### Desktop
- **Electron** - Desktop app framework
- **Electron Builder** - App packaging

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/smart-tourist-safety.git
cd smart-tourist-safety
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

### 3. Database Setup
1. Create a MySQL database:
```sql
CREATE DATABASE smart_tourist_safety;
```

2. Import the database schema:
```bash
mysql -u root -p smart_tourist_safety < backend/database/schema.sql
```

### 4. Environment Configuration
Create a `.env` file in the `backend` directory:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smart_tourist_safety

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 5. Start the Application

#### Development Mode (Web)
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
# Backend only
npm run server

# Frontend only
npm run client
```

#### Desktop Application
```bash
# Start desktop app in development
npm run electron-dev

# Build and package desktop app
npm run dist
```
## Usage

### Default Login Credentials
- **Admin**: admin@smarttourist.com / password
- **User**: user@example.com / password

### Getting Started
1. Launch the application
2. Register a new account or use demo credentials
3. Explore the dashboard to view safety statistics
4. Report incidents or create safety alerts
5. Manage locations and user accounts (admin only)

### Key Features Usage

#### Reporting an Incident
1. Navigate to "Incidents" page
2. Click "Report Incident"
3. Fill in incident details:
   - Title and description
   - Incident type and severity
   - Location (if applicable)
   - GPS coordinates (optional)
4. Submit the report

#### Creating Safety Alerts
1. Go to "Safety Alerts" page
2. Click "Create Alert"
3. Provide alert information:
   - Title and message
   - Alert type and severity
   - Target location
   - Expiration date
4. Publish the alert

#### Managing Locations
1. Access "Locations" page
2. Add new locations with:
   - Name and address
   - Location type
   - Safety level assessment
   - GPS coordinates
   - Description
3. Edit or delete existing locations

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Incidents
- `GET /api/incidents` - Get incidents (with filtering)
- `GET /api/incidents/:id` - Get single incident
- `POST /api/incidents` - Create incident
- `PUT /api/incidents/:id` - Update incident
- `GET /api/incidents/stats/overview` - Get incident statistics

### Locations
- `GET /api/locations` - Get locations (with filtering)
- `GET /api/locations/:id` - Get single location
- `POST /api/locations` - Create location
- `PUT /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location
- `GET /api/locations/stats/overview` - Get location statistics

## Database Schema

The application uses the following main tables:
- `users` - User accounts and authentication
- `locations` - Tourist locations and safety data
- `incidents` - Incident reports and tracking
- `safety_alerts` - Safety alerts and notifications
- `emergency_contacts` - Emergency contact information
- `safety_tips` - Safety tips and guidelines

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation with Joi
- SQL injection prevention
- CORS configuration
- Security headers with Helmet
- Rate limiting

## Development

### Project Structure
```
smart-tourist-safety/
├── backend/                 # Node.js backend
│   ├── config/             # Database configuration
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── database/           # Database schema
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── App.js          # Main app component
│   └── package.json
├── electron/               # Electron desktop app
│   ├── main.js            # Main process
│   └── preload.js         # Preload script
└── package.json           # Root package.json
```

### Scripts
- `npm run dev` - Start development servers
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run electron` - Start desktop app
- `npm run electron-dev` - Start desktop app in development
- `npm run build` - Build frontend for production
- `npm run dist` - Build desktop app for distribution

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@smarttourist.com or create an issue in the GitHub repository.

## Roadmap

- [ ] Real-time notifications with WebSocket
- [ ] Mobile app companion
- [ ] Advanced analytics and reporting
- [ ] Integration with external safety APIs
- [ ] Multi-language support
- [ ] Offline mode support
- [ ] Advanced mapping integration
- [ ] AI-powered risk assessment
>>>>>>> 6a2bfe0a (Initial commit)
