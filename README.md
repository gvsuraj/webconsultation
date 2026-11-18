# Telemedicine Web Consultation System

A full-stack telemedicine platform where patients can find doctors, book online/offline appointments, attend live video consultations, chat in real time, upload health records, and download e-prescriptions. Doctors get a dashboard to manage appointments, write prescriptions, review patient records, and run live consultations.

## Features

- Role-based authentication for **doctors** and **patients**
- Doctor profiles with specialization, experience, qualifications, location, availability, and profile photo
- Appointment booking with **Online / Offline** mode and status workflow (`Pending`, `Approved`, `Completed`, `Cancelled`)
- Live video consultation using **WebRTC** (`simple-peer`) with STOMP signaling
- Real-time chat with message history persisted in the database
- e-Prescriptions / consultation notes with **PDF download**
- Health record uploads (PDF/JPG/PNG) visible to the patient and their approved doctors
- Medicine order endpoints
- Search and filtering for doctors, patients, and appointments

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Java 17, Spring Boot 3.2.5, Spring Web, Spring Data JPA, Hibernate |
| Realtime | Spring WebSocket, STOMP, SockJS |
| Database | MySQL 8 |
| Frontend | React 19, React Router 7, Axios |
| Realtime client | `@stomp/stompjs`, `sockjs-client`, `simple-peer` (WebRTC) |
| PDF | jsPDF, jspdf-autotable |
| Build | Maven Wrapper (backend), Create React App (frontend) |

## Project Structure

```
webconsultation/
├── pom.xml
├── mvnw / mvnw.cmd
├── src/main/java/com/medical/webconsultation/
│   ├── config/         # CORS and WebSocket/STOMP configuration
│   ├── controller/     # REST controllers + WebSocket controller
│   ├── model/          # JPA entities and DTOs
│   └── repository/     # Spring Data JPA repositories
├── src/main/resources/
│   └── application.properties
└── telemedicine-frontend/
    ├── package.json
    └── src/
        ├── App.js                 # Routing and role-based route guards
        └── components/            # Dashboards, appointments, records, prescriptions, live consultation
```

## Prerequisites

- JDK 17 or newer
- Node.js 18+ and npm
- MySQL 8 running on `localhost:3306`

## Setup

### 1. Database

Create the database (tables are created automatically by Hibernate):

```sql
CREATE DATABASE medicaldb;
```

### 2. Backend configuration

`src/main/resources/application.properties` uses environment variables with local defaults:

```properties
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/medicaldb?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:root}
```

Override them if your MySQL setup differs:

```powershell
$env:DB_USERNAME="your_user"
$env:DB_PASSWORD="your_password"
```

### 3. Run the backend

Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

macOS/Linux:

```bash
./mvnw spring-boot:run
```

Backend runs at **http://localhost:8080**.

### 4. Run the frontend

```bash
cd telemedicine-frontend
npm install
npm start
```

Frontend runs at **http://localhost:3000** and expects the backend at `http://localhost:8080`.

## API Overview

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and return the user record |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/{id}` | Get user by ID |
| GET | `/api/users/email/{email}` | Get user by email |
| POST | `/api/users/upload-image/{id}` | Upload profile image (base64) |
| PUT | `/api/users/remove-image/{id}` | Remove profile image |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | List all doctors |
| GET | `/api/doctors/by-email/{email}` | Get doctor by user email |
| GET | `/api/doctors/user/{userId}` | Get doctor profile by user ID |
| GET | `/api/doctors/by-user/{userId}` | Alias for the above |
| POST | `/api/doctors/create` | Create a doctor profile |
| PUT | `/api/doctors/update/{id}` | Update a doctor profile |
| DELETE | `/api/doctors/delete/{id}` | Delete a doctor profile |
| POST | `/api/doctors/upload-image/{id}` | Upload doctor profile image |
| PUT | `/api/doctors/remove-image/{id}` | Remove doctor profile image |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments/user/{userId}` | Appointments for a patient |
| GET | `/api/appointments/doctor/{doctorId}` | Appointments for a doctor |
| GET | `/api/appointments/user/{userId}/mode/{mode}` | Patient appointments by mode |
| GET | `/api/appointments/doctor/{doctorId}/mode/{mode}` | Doctor appointments by mode |
| POST | `/api/appointments/create` | Book an appointment |
| PUT | `/api/appointments/update-status/{id}` | Update appointment status |
| DELETE | `/api/appointments/{id}` | Delete an appointment |

### Consultations and Prescriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/consultations` | List all consultations |
| POST | `/api/consultations/create` | Create notes/prescription for an appointment |
| GET | `/api/consultations/search?name=` | Search consultations by patient name |
| GET | `/api/consultations/patient/{patientId}` | Consultations for a patient |
| GET | `/api/consultations/doctor/{doctorId}/patients` | Distinct patients of a doctor |

### Health Records
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/records/user/{userId}` | Records for a patient |
| GET | `/api/records/doctor/{doctorId}` | Records of patients with approved/completed appointments |
| POST | `/api/records/upload` | Upload a record (base64 file) |
| GET | `/api/records/{id}` | Get a record by ID |
| DELETE | `/api/records/delete/{id}` | Delete a record |

### Medicine Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medicine-orders` | List all orders |
| POST | `/api/medicine-orders` | Place an order |
| PUT | `/api/medicine-orders/{id}/status` | Update order status |
| GET | `/api/medicine-orders/user/{userId}` | Orders for a user |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/{consultationId}` | Chat history for a consultation |

## WebSocket / STOMP

- SockJS endpoint: `/ws`
- Application prefix: `/app`
- Broker prefix: `/topic`

| Purpose | Publish to | Subscribe to |
|---------|------------|--------------|
| Chat message | `/app/chat/{consultationId}` | `/topic/chat/{consultationId}` |
| Typing status | `/app/chat/{consultationId}/typing` | `/topic/chat/{consultationId}/typing` |
| WebRTC signaling | `/app/signal/{consultationId}` | `/topic/signal/{consultationId}` |

## Known Limitations

- Passwords are stored and compared in plain text; there is no JWT/session-based authentication.
- API endpoints are not protected server-side; the frontend relies on `localStorage` for role checks.
- Profile images and uploaded documents are stored as base64 strings in MySQL (`LONGTEXT`).
- Backend URLs are hardcoded to `http://localhost:8080` in the frontend.
- `spring.jpa.hibernate.ddl-auto=update` is intended for development, not production.

## License

This project is intended for educational and demonstration purposes.
