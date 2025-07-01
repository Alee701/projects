
import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

// IMPORTANT: The service account credentials must be set as environment variables.
// You can get these from your Firebase project settings:
// Project settings > Service accounts > Generate new private key
// Then add these to your .env file or Vercel environment variables:
//
// FIREBASE_PROJECT_ID="your-project-id"
// FIREBASE_CLIENT_EMAIL="firebase-adminsdk-..."
// FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
// Note: When copying the private key, ensure it's enclosed in quotes and newlines are represented as \n.

interface AdminApp {
    app: App;
    auth: Auth;
    db: Firestore;
}

function initializeAdminApp(): AdminApp {
    if (admin.apps.length > 0) {
        const app = admin.apps[0]!;
        return { app, auth: admin.auth(app), db: admin.firestore(app) };
    }

    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set.");
    }

    const app = admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey.replace(/\\n/g, '\n'), // Important for parsing the key from env
        }),
    });

    return { app, auth: admin.auth(app), db: admin.firestore(app) };
}

export const { app, auth, db } = initializeAdminApp();
