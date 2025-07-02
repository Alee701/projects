
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

interface AdminInstances {
    auth: Auth;
    db: Firestore;
}

/**
 * Lazily initializes and returns the Firebase Admin SDK instances.
 * This prevents the SDK from initializing during the build process,
 * which would fail in environments where secrets are not yet available.
 */
export function getAdminInstances(): AdminInstances {
    if (admin.apps.length > 0) {
        const app = admin.apps[0]!;
        return { auth: admin.auth(app), db: admin.firestore(app) };
    }

    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set.");
    }
     if (!process.env.FIREBASE_PROJECT_ID) {
        throw new Error("FIREBASE_PROJECT_ID environment variable is not set.");
    }
    if (!process.env.FIREBASE_CLIENT_EMAIL) {
        throw new Error("FIREBASE_CLIENT_EMAIL environment variable is not set.");
    }

    const app = admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey.replace(/\\n/g, '\n'), // Important for parsing the key from env
        }),
    });

    return { auth: admin.auth(app), db: admin.firestore(app) };
}
