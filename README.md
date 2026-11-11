# DevLink — Developer Collaboration Platform

DevLink is a developer collaboration platform designed to connect developers with project owners looking for collaborators. It provides a space where developers can discover projects, apply for opportunities, and collaborate with others to gain practical experience and build their portfolios.

The platform allows users to participate as both project owners and collaborators, creating opportunities for developers to share ideas, contribute their skills, and build software together.

**Project Status:** In Development

## How It Works

DevLink is built around a project-based collaboration workflow:

1. **User registration and profiles:** Developers create accounts and build profiles containing their skills, experience, GitHub and portfolio links.
2. **Project creation:** Project owners publish projects, provide descriptions, define the roles they need, and specify the number of collaborators they can accommodate.
3. **Project discovery:** Developers browse available projects and explore opportunities that match their interests and skills.
4. **Application workflow:** Interested developers submit applications for available roles. Project owners can review, accept or reject applications.
5. **Project membership:** When an application is accepted, the developer becomes a project member and receives an assigned role.
6. **Collaboration and progress tracking:** Accepted members can communicate through project messaging, while owners manage project progress through defined status transitions.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Python, Django |
| API | Django REST Framework |
| Database | PostgreSQL |
| Authentication | JWT (SimpleJWT) |
| ORM | Django ORM |

## Features

- **User authentication:** Custom user model with email-based authentication and JWT token management.
- **Developer profiles:** Profiles containing skills, experience, educational information and portfolio links.
- **Project management:** Create, update and manage collaborative software projects.
- **Project discovery:** Browse available projects and explore collaboration opportunities.
- **Role-based applications:** Apply for specific project roles, including Frontend Developer, Backend Developer and UI/UX Designer.
- **Application management:** Submit, withdraw, accept and reject project applications.
- **Project membership:** Automatically establish project membership following application acceptance.
- **Capacity management:** Enforce project member limits during the application acceptance process.
- **Project progress tracking:** Manage project lifecycle through OPEN, IN_PROGRESS and COMPLETE statuses.
- **Project messaging:** Enable communication between accepted project collaborators.
- **Access control:** Restrict project management operations to authorized project owners.

## Application Workflow

Applications follow a defined lifecycle:

| Status | Description |
|---|---|
| PENDING | Application submitted and awaiting review |
| ACCEPTED | Application approved by the project owner |
| REJECTED | Application declined by the project owner |
| WITHDRAWN | Application withdrawn by the applicant |

Project owners control project status transitions:

- OPEN → IN_PROGRESS
- IN_PROGRESS → COMPLETE

These transitions help maintain a predictable project lifecycle and prevent unauthorized status changes.

## Database Design

The backend uses PostgreSQL with Django's ORM to manage the relationships between the application's main entities.

Core models include:

- **User:** Handles authentication and account information.
- **Profile:** Stores additional developer information and portfolio details.
- **Project:** Contains project descriptions, ownership, required roles, capacity and status.
- **Application:** Tracks developer applications and their review status.
- **ProjectMember:** Represents accepted collaborators and their assigned project roles.

The application separates user authentication from profile information, allowing account management and developer-specific data to be handled independently.

## Backend Architecture

The Django backend is organized into separate applications based on functionality:

- **Accounts:** User registration, authentication and account management.
- **Profiles:** Developer profile management.
- **Projects:** Project creation, discovery and management.
- **Applications:** Application submission, review and membership workflows.
- **Messaging:** Communication between accepted project collaborators.

The API handles validation, permissions and business rules to ensure that project operations follow the intended workflow.

## Testing

Automated backend tests are used to verify important application workflows and business rules, including:

- Application submission and withdrawal.
- Application acceptance and rejection.
- Project membership creation.
- Role assignment and project capacity validation.
- Project status transitions.
- Access restrictions for project owners and other users.

## Running Locally

### Prerequisites

- Python
- Node.js and npm
- PostgreSQL
- Git

### Backend Setup

1. Clone the repository:

   ```bash
   git clone <REPOSITORY_URL>
   cd developer_collaboration_platform
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   ```

   Windows:

   ```bash
   venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Configure your environment variables and PostgreSQL database connection.

5. Apply database migrations:

   ```bash
   python manage.py migrate
   ```

6. Start the development server:

   ```bash
   python manage.py runserver
   ```

The backend will typically be available at `http://127.0.0.1:8000`.

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

The frontend will typically be available at `http://localhost:5173`.

## Current Development Status

DevLink is currently under development. Core backend functionality and project collaboration workflows are being implemented, with frontend integration and further feature development ongoing.

## Future Improvements

- Advanced developer discovery and search.
- Improved project recommendation mechanisms.
- Additional collaboration and communication features.
- Enhanced project activity tracking.

## Author

Built by Esther Idumu as a personal software engineering project to explore full-stack development, backend architecture, relational database design and collaborative application workflows.
