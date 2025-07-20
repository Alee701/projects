# Code with Ali Imran - Portfolio Showcase

**Live Demo:** [cw-ai.vercel.app](https://cw-ai.vercel.app)

![Code with Ali Imran Portfolio Showcase](https://res.cloudinary.com/dkfvndipz/image/upload/v1751431247/Code_with_Ali_Imran_1_qh4lf2.png)

## About This Project

This is a dynamic, full-stack portfolio application designed to showcase projects in a clean, professional, and interactive manner. It features a public-facing side for visitors to explore projects and a secure, feature-rich admin dashboard for portfolio management. The application leverages modern web technologies and includes AI-powered features to streamline content creation.

**Note:** This GitHub repository is private and used for development purposes. The live application linked above is public for portfolio viewing.

---

## Key Features

- **Dynamic Project Showcase:** Projects are displayed in a responsive grid and can be filtered by technology.
- **Detailed Project Pages:** Each project has a dedicated, SEO-optimized page with a full description, image gallery, and links to the live demo and GitHub repository.
- **Secure Admin Dashboard:** A password-protected area for administrators to manage all aspects of the portfolio.
- **Full CRUD for Projects:** Admins can create, read, update, and delete projects.
- **Contact Form Management:** Admins can view and manage submissions from the contact form.
- **AI-Powered Content Generation:** Utilizes Genkit to suggest project descriptions, saving time on content creation.
- **Cloudinary Image Management:** Handles image uploads and deletions via a Genkit flow integrated with Cloudinary.
- **Dark/Light Mode:** Theme toggling for user preference.

---

## Technology Stack

This project is built with a modern, full-stack JavaScript architecture:

-   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
-   **AI Integration:** [Firebase Genkit](https://firebase.google.com/docs/genkit)
-   **Database:** [Cloud Firestore](https://firebase.google.com/docs/firestore)
-   **Authentication:** [Firebase Authentication](https://firebase.google.com/docs/auth)
-   **Image Hosting:** [Cloudinary](https://cloudinary.com/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)

---

## Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn
-   A Firebase project with Firestore and Authentication enabled.
-   A Cloudinary account.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <repo-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    -   Create a `.env` file in the root of the project.
    -   Add your Firebase client-side configuration keys (prefixed with `NEXT_PUBLIC_`).
    -   Add your Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).

4.  **Add Firebase Admin Credentials:**
    -   Download your service account key from **Firebase Console > Project Settings > Service accounts**.
    -   Save the file as `firebasekey.json` in the root of your project.
    -   **Important:** Ensure `firebasekey.json` is added to your `.gitignore` file to keep it secure.

5.  **Set an Admin User:**
    -   Create a user in Firebase Authentication.
    -   Update the `userUid` in `src/lib/setAdminClaim.js` with the UID of your user.
    -   Run the script from your terminal to grant admin privileges:
        ```bash
        node src/lib/setAdminClaim.js
        ```

6.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:9002`.
