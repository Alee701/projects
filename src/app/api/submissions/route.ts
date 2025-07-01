
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db, auth as adminAuth } from '@/lib/firebase-admin';
import type { ContactSubmission } from '@/lib/types';
import type { Timestamp } from 'firebase-admin/firestore';

async function verifyAdmin(authorization: string | null): Promise<{ decodedToken?: any, error?: NextResponse }> {
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return { error: NextResponse.json({ message: 'Authorization header missing or invalid.' }, { status: 401 }) };
    }

    const token = authorization.split('Bearer ')[1];
    if (!token) {
        return { error: NextResponse.json({ message: 'Token missing.' }, { status: 401 }) };
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        if (decodedToken.admin !== true) {
            return { error: NextResponse.json({ message: 'Insufficient permissions. User is not an admin.' }, { status: 403 }) };
        }
        return { decodedToken };
    } catch (error: any) {
        console.error('Token verification error:', error);
        if (error.code === 'auth/id-token-expired') {
            return { error: NextResponse.json({ message: 'Token expired. Please log in again.' }, { status: 401 }) };
        }
        if (error.code === 'auth/argument-error') {
            return { error: NextResponse.json({ message: 'Invalid token.' }, { status: 401 }) };
        }
        return { error: NextResponse.json({ message: 'An internal server error occurred during authentication.' }, { status: 500 }) };
    }
}

export async function GET() {
    const authorization = headers().get('authorization');
    const { error } = await verifyAdmin(authorization);
    if (error) return error;

    try {
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

    } catch (apiError: any) {
        console.error('API Error fetching submissions:', apiError);
        return NextResponse.json({ message: 'An internal server error occurred while fetching submissions.' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const authorization = headers().get('authorization');
    const { error: authError } = await verifyAdmin(authorization);
    if (authError) return authError;

    try {
        const { id } = await request.json();

        if (!id || typeof id !== 'string') {
            return NextResponse.json({ message: 'Submission ID is missing or invalid.' }, { status: 400 });
        }

        await db.collection('contactSubmissions').doc(id).delete();
        
        return NextResponse.json({ message: 'Submission deleted successfully' }, { status: 200 });

    } catch (apiError: any) {
        console.error('API Error deleting submission:', apiError);
        if (apiError instanceof SyntaxError) { // Catches invalid JSON body
             return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
        }
        return NextResponse.json({ message: 'An internal server error occurred while deleting the submission.' }, { status: 500 });
    }
}
