# Social Justice App - Project Handover Document

## Project Overview
This is a Next.js-based social justice application that facilitates community building, coaching sessions, and discussions around social justice topics. The application is built using modern web technologies and follows best practices for scalability and maintainability.

## Technology Stack
- **Frontend Framework**: Next.js 15.2.4
- **UI Libraries**: 
  - Material-UI (MUI) v7
  - Headless UI
  - Tailwind CSS
- **Authentication**: Clerk
- **Database**: PostgreSQL with Prisma ORM
- **Development Tools**:
  - TypeScript
  - ESLint
  - Prettier
  - Husky (for pre-commit hooks)

## Project Setup and Installation

### Prerequisites
- Node.js (Latest LTS version)
- PostgreSQL database
- Clerk account for authentication

### Environment Setup
1. Clone the repository
   ```bash
   git clone git@github.com:BU-Spark/se-bcs-social-justice-app.git
   ```
2. cd into the repository
   ```bash
   cd se-bcs-social-justice-app
   ```
3. Checkout to dev branch
   ```bash
   git checkout dev
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env`:
   ```
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
    CLERK_SECRET_KEY="..."
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/?from=signup
    DATABASE_URL="prisma+postgres://..."
    # ZOOM SECRET KEYS
    ZOOM_ACCOUNT_ID="..."
    ZOOM_CLIENT_ID="..."
    ZOOM_CLIENT_SECRET="..."
   ```

### Database Setup
1. Initialize the database:
   ```bash
   npx prisma migrate dev
   ```
2. Seed the database:
   ```bash
   npx prisma db seed
   ```

### Running the Application
- Development mode (Frontend):
  ```bash
  npm run dev
  ```
- Development mode (Backend):
  ```bash
  npx prisma studio
  ```

## Core Features

### 1. User Authentication and Profiles
- User registration and login through Clerk
- Profile management with customizable information
- Role-based access control (member, leader, admin)

### 2. Onboarding after Signup
- User profile completion (name, username, profile picture)
- Interest selection for personalized experience
- Role selection (member, leader, admin)
- Community recommendations based on interests
- Quick tutorial for key features
- Guide for joining communities and scheduling sessions

### 3. Community Management
- Create and join communities
- Community-specific discussion boards
- Interest-based community categorization
- Member management within communities

### 4. Scheduling Sessions
- Schedule different types of sessions that comes from the API
- Appointment management system
- Recurring appointment support
- Session status tracking (scheduled, completed, canceled)
- Feature to have private sessions with multiple invitees and public session which are open to all.

### 4. Discussion Forums
- Create and participate in discussions
- Post content with text, images, and PDFs
- Comment system
- Voting mechanism (upvote/downvote)

## Database Schema

### Key Models

1. **User**
   - Basic info: id, email, name, username, imageUrl, ethnicity, phoneNumber
   - Role management (member, leader, admin)
   - Relationships:
     - Interests (UserInterest)
     - Community memberships
     - Hosted appointments
     - Appointment attendances
     - Comments
     - Posts
     - Votes

2. **Interest**
   - id, name (unique)
   - Relationships with users and communities

3. **Community**
   - Basic info: id, name (unique), imageUrl, type, description
   - Relationships:
     - Members (CommunityMembers)
     - Posts
     - Interests (CommunityInterest)

4. **AppointmentType**
   - id, title, description, icon
   - Access type (private/public)
   - Associated appointments

5. **Appointment**
   - Scheduling info: startTime, endTime, timeZone, locationOrLink
   - Status: scheduled, completed, canceled
   - Recurring options: isRecurring, recurrencePattern, recurrenceEndDate
   - Relationships:
     - Host (User)
     - Attendees
     - Parent/Child appointments for recurring sessions

6. **Posting**
   - Content: title, content, imageUrl, pdfUrl
   - Community association
   - Score tracking
   - Relationships:
     - Comments
     - Votes
     - Author (User)

7. **Comment**
   - Content and timestamps
   - Associated with Post and User

8. **Vote**
   - Type: UPVOTE/DOWNVOTE
   - Associated with Post and User

### Enums
- AppointmentStatus: scheduled, completed, canceled
- AttendeeRole: client, coach, participant
- RecurrencePattern: daily, weekly, biweekly, monthly, custom
- VoteType: UPVOTE, DOWNVOTE
- UserRole: member, leader, admin
- AppointmentAccessType: private, public

## Completed User Stories
1. ✅ Authentication (MVP): User authentication and profile management.
2. ✅ Onboarding (MVP): Onboarding Forms for user to tell more about themselves and their interests.
3. ✅ Scheduling (MVP): Client session scheduling and management
4. ✅ Community (MVP): Community forums and networking groups where you can post and do interaction.
5. ✅ Coaching(MVP): A place where members can access Chad’s content and see upcoming events.

## Pending Features
1. ❌ Community monetization (Stripe integration needed)
2. ❌ Coaching package monetization
3. ❌ Community member approval system
   - Ban functionality
   - Application process
   - Payment integration
4. ❌ Courses page:
   - Downloadable courses are pending to integrate.
   - Course creation to be linked with backend

## API Structure
The application follows a RESTful API structure with the following main endpoints:
- `/api/users` - User management
- `/api/communities` - Community operations
- `/api/appointments` - Session management
- `/api/posts` - Discussion management

## Security Considerations
- Authentication handled by Clerk
- Role-based access control
- Secure database connections
- Environment variable protection

## Testing
- ESLint for code quality
- Prettier for code formatting
- Husky for pre-commit hooks

## Deployment
The application can be deployed to any platform supporting Next.js applications:
- Vercel (recommended)
- AWS
- DigitalOcean
- Heroku

## Future Recommendations
1. Implement Stripe integration for monetization
2. Add community approval workflow
3. Enhance user engagement features
4. Implement analytics dashboard
5. Add real-time notifications and email support for getting invited in sessions
6. Improve Courses Page to be integrated with backend

## Contact Information
For any questions or support, please contact the BU Spark team.

## Additional Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Material-UI Documentation](https://mui.com/getting-started/usage/) 