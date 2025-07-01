
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db, auth as adminAuth } from '@/lib/firebase-admin';
import type { ContactSubmission } from '@/lib/types';
import type { Timestamp } from 'firebase-admin/firestore';

export async function GET() {
    const headersList = headers();
    const authorization = headersList.get('authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'Authorization header missing or invalid.' }, { status: 401 });
    }

    const token = authorization.split('Bearer ')[1];
    if (!token) {
        return NextResponse.json({ message: 'Token missing.' }, { status: 401 });
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        
        // Check for admin custom claim
        if (decodedToken.admin !== true) {
            return NextResponse.json({ message: 'Insufficient permissions. User is not an admin.' }, { status: 403 });
        }

        // If user is an admin, fetch submissions
        const submissionsRef = db.collection('contactSubmissions').orderBy('submittedAt', 'desc');
        const snapshot = await submissionsRef.get();

        if (snapshot.empty) {
            return NextResponse.json([], { status: 200 });
        }

        const submissions = snapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore Timestamp to ISO string
            const submittedAt = (data.submittedAt as Timestamp)?.toDate()?.toISOString() || new Date().toISOString();
            return {
                id: doc.id,
                ...data,
                submittedAt,
            } as ContactSubmission;
        });
        
        return NextResponse.json(submissions, { status: 200 });

    } catch (error: any) {
        console.error('API Error fetching submissions:', error);
        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ message: 'Token expired. Please log in again.' }, { status: 401 });
        }
        if (error.code === 'auth/argument-error') {
            return NextResponse.json({ message: 'Invalid token.' }, { status: 401 });
        }
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
