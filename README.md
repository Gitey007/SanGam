# SanGam — College Collaboration & Hackathon Platform

SanGam is a comprehensive full-stack platform engineered for college students and developers to discover peers, showcase technical skills, assemble hackathon teams, and manage team recruitment workflows.

---

## 🚀 Key Features

- **Authentication & Security:** JWT-based stateless authentication, BCrypt password hashing, role-based route security, and CORS configuration.
- **User Profiles:** Complete profile management (name, college, branch, year, bio, technical skills).
- **Skills Directory:** Centralized catalog of programming languages, frameworks, and tools. Discover peers by skill proficiencies.
- **Team Management:**
  - Create and configure teams with customizable member capacities.
  - Automatic leader assignment upon creation.
  - Direct team joining and member departure.
  - Leader-only controls: member removal (leader cannot remove self) and member management.
- **Join Request Workflow:**
  - Students can submit join requests to any open team.
  - Team leaders review pending requests.
  - Atomic acceptance (adds member to team with capacity validation).
  - Rejection workflow without adding membership.
- **Consistent Error Handling:** Centralized `@RestControllerAdvice` delivering structured JSON error responses with proper HTTP status codes (400, 401, 403, 404, 409).
- **Modern Full-Stack UI:** Responsive React single-page application built with Vite, Tailwind CSS, Lucide icons, and React Router.

---

## 🛠️ Tech Stack

### Backend
- **Language:** Java 21
- **Framework:** Spring Boot 4.1.1
- **Security:** Spring Security 6 + JJWT (Java JSON Web Token 0.12.6)
- **Persistence:** Spring Data JPA + Hibernate
- **Database:** MySQL 9.x (`sangam_db`)
- **Build Tool:** Maven

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Icons:** Lucide React

---

## 🗄️ Database Architecture

SanGam uses the MySQL database `sangam_db` with `spring.jpa.hibernate.ddl-auto=validate`:

| Table | Description |
| :--- | :--- |
| `users` | User accounts with BCrypt-hashed credentials, academic info, and timestamps. |
| `skills` | Standardized technical skills (Java, Spring Boot, React, Docker, etc.). |
| `user_skills` | Many-to-many relationship associating users with their skills. |
| `teams` | Student teams with leader references and maximum capacity limits. |
| `team_members` | Composite key (`team_id`, `user_id`) storing roles (`LEADER`, `MEMBER`) and join timestamps. |
| `team_join_requests` | Unique composite key (`team_id`, `user_id`) tracking request status (`PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`). |

---

## ⚙️ Environment Variables

### Backend (`application.properties`)
| Variable | Default | Description |
| :--- | :--- | :--- |
| `JWT_SECRET` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` | 256-bit secret key used for signing JWT tokens. |
| `JWT_EXPIRATION` | `86400000` | Token expiration time in milliseconds (24 hours). |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/sangam_db` | JDBC MySQL connection URL. |
| `SPRING_DATASOURCE_USERNAME` | `root` | MySQL username. |
| `SPRING_DATASOURCE_PASSWORD` | `Sahul@54321` | MySQL password. |

### Frontend (`frontend/.env`)
| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Base URL of the backend REST API. |

---

## 🏁 Getting Started

### 1. Prerequisites
- **Java 21 JDK** installed (`java -version`)
- **Node.js** v20+ and **npm** (`node -v`)
- **MySQL 8.0+ / 9.0+** running locally with database `sangam_db`

### 2. Backend Setup & Execution
```bash
cd /Users/sahulkumar/Documents/SAHUL/SanGam/sangam

# Compile
./mvnw clean compile

# Run tests
./mvnw test

# Start the Spring Boot backend
./mvnw spring-boot:run
```
The backend starts at `http://localhost:8080`.

### 3. Frontend Setup & Execution
```bash
cd /Users/sahulkumar/Documents/SAHUL/SanGam/sangam/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Start the Vite development server
npm run dev -- --port 5173
```
The application opens in the browser at `http://localhost:5173`.

---

## 📡 REST API Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new student account (returns JWT token and profile).
- `POST /api/auth/login` — Authenticate credentials (returns JWT token and profile).

### User Profiles (`/api/users`)
- `GET /api/users` — List all registered students.
- `GET /api/users/me` — Get profile of currently authenticated user.
- `GET /api/users/{id}` — Get student profile by ID.
- `PUT /api/users/{id}` — Update user profile details.
- `GET /api/users/skill/{skillId}` — Find students by skill.

### Skills (`/api/skills`)
- `GET /api/skills` — List all skills.
- `GET /api/skills/{id}` — Get skill details.
- `POST /api/skills` — Suggest and add a new skill.
- `POST /api/skills/users/{userId}/skills/{skillId}` — Add skill to student profile.
- `DELETE /api/skills/users/{userId}/skills/{skillId}` — Remove skill from student profile.

### Teams (`/api/teams`)
- `POST /api/teams` — Create a new team (authenticated user becomes `LEADER`).
- `GET /api/teams` — List all active teams.
- `GET /api/teams/{teamId}` — Get team details.
- `GET /api/teams/{teamId}/members` — List members of a team.
- `POST /api/teams/{teamId}/join` — Join a team directly.
- `DELETE /api/teams/{teamId}/leave` — Leave a team (leaders cannot leave directly).
- `DELETE /api/teams/{teamId}/members/{memberId}` — Leader removes a team member.

### Team Join Requests (`/api/teams/{teamId}/join-requests`)
- `POST /api/teams/{teamId}/join-request` — Submit a join request.
- `GET /api/teams/{teamId}/join-requests` — Leader views pending join requests.
- `POST /api/teams/{teamId}/join-requests/{requestId}/accept` — Leader accepts request (adds member).
- `POST /api/teams/{teamId}/join-requests/{requestId}/reject` — Leader rejects request.
