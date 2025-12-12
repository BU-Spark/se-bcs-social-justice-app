This is a template for Spark! DS 519 projects. It has pre-configured eslint.config.mjs - ([`ESLint`](https://eslint.org/)) and .prettierrc - ([`Prettier`](https://prettier.io/)) to reflect industry standard development guidelines.

## Setting Up Your Developer Experience

To get the most out of ESLint and Prettier, It is recommended to make the changes to you IDE:

#### Add this code to your _.vscode/settings.json_

```json
{
  "editor.formatOnSave": true,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

#### Download these VSCode extensions:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Getting Started

This template uses Next.js. If you havent used Next before or need more information, take a look here:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

To run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result. Do not use Microsoft Edge 🤮

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Adding Additional Tech

Most projects will require the use of other technologies. Below are a few guides and recommedations for integrating commonly used software into your Next.js project.

- [Next.js Setup w/ Prisma](https://www.dhiwise.com/post/the-ultimate-guide-to-next-js-prisma-setup)
- [Emotion & Next.js](https://www.dhiwise.com/post/implementing-nextjs-emotions-in-your-project) - Emotion is the default CSS-in JS library for all new Spark! projects. Use Emotion instead of styled-components, as styled-components is not as easily compatible with Server Side Rendering, or Typed CSS variables. Emotion is also more readily compatible with a wide array of component libraries.
- [Clerk Setup w/ Next.js](https://clerk.com/docs/quickstarts/nextjs) - Clerk will be the default user authentication software for all new Spark! projects. Please reach out to Omar for creating and retrieving API keys for your project. Do NOT use firebase/auth even if your project uses Firestore.
- #### Component Libraries
  - All new projects will be required to use a [design system](https://www.figma.com/blog/design-systems-101-what-is-a-design-system/) You will receive designs from your DS488 design team which will utilize a design kit. Use the corresponding component library to implement those designs on the front end of your project.

## Project Overview

This is a Next.js-based social justice application which is an all in one platform that facilitates community building, coaching sessions, and discussions around social justice topics. The application is built using modern web technologies and follows best practices for scalability and maintainability.

## Technology Stack

- **Frontend Framework**: Next.js 15.2.4
- **UI Libraries**:
  - Material-UI (MUI) v7
  - Headless UI
  - Tailwind CSS
- **Authentication**: Clerk
- **Database**:
  - PostgreSQL with Prisma ORM
  - AWS S3 for media files
- **Development Tools**:
  - TypeScript
  - ESLint
  - Prettier
  - Husky (for pre-commit hooks)
- **Payment**
  - Stripe
    - Current confirmation is based off redirection, need to link to a webhook, there is code for webhook.

## Project Setup and Installation

### Prerequisites

- Node.js (Latest LTS version)
- PostgreSQL database
- Clerk account for authentication
- Stripe for payment
- AWS S3 database

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
4. Install dependencies:
   ```bash
   npm install
   ```
5. Set up environment variables in `.env`:

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
    # CLOUDINARY SECRET KEYS
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="..."
    # STRIPE SECRET KEYS
    STRIPE_SECRET_KEY="sk_test_..." # or sk_live_... for production
    STRIPE_WEBHOOK_SECRET="whsec_..." # Webhook signing secret from Stripe Dashboard
    EMAIL_USER=...
    EMAIL_PASSWORD=...
    SMTP_HOST=...
    SMTP_PORT=...
   ```

### Database Setup

1. Initialize the database:
   ```bash
   npx prisma migrate dev
   ```
2. Seed the database:
   ```bash
   npx prisma db seed
   npx tsx ./db/seed
   ```

### AWS S3

1. No initialization needed
2. Need to check if the access to the AWS S3 is open for both upload and retrival, contact TPM
3. Future implementation: need webhook for payment confirmation, currently flawed.

### Emails

1. User the admin email/ testing email for sending emails from the platform to users.
2. view the .env structure.

### Create and run a migration (Optional)

```bash
npx prisma migrate dev --name <name of the migration>
npx prisma generate
```

### Running the Application

- Development mode (Frontend):
  ```bash
  npm run dev
  ```
- Development mode (Backend / Accessing databse):
  ```bash
  npx prisma studio
  ```
