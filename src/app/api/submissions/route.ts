
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getAdminInstances } from '@/lib/firebase-admin';
import type { ContactSubmission } from '@/lib/types';
import type { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

async function verifyAdmin(authorization: string | null): Promise<{ decodedToken?: any, errorResponse?: NextResponse }> {
    const { auth: adminAuth } = getAdminInstances();
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return { errorResponse: NextResponse.json({ message: 'Authorization header missing or invalid.' }, { status: 401 }) };
    }

    const token = authorization.split('Bearer ')[1];
    if (!token) {
        return { errorResponse: NextResponse.json({ message: 'Token missing.' }, { status: 401 }) };
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(token, true); // Check for revocation
        if (decodedToken.admin !== true) {
            return { errorResponse: NextResponse.json({ message: 'Insufficient permissions. User is not an admin.' }, { status: 403 }) };
        }
        return { decodedToken };
    } catch (error: any) {
        console.error('Token verification error:', error);
        let message = 'An internal server error occurred during authentication.';
        if (error.code === 'auth/id-token-expired') {
            message = 'Token expired. Please log in again.';
        } else if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-revoked') {
            message = 'Invalid token. Please log in again.';
        }
        return { errorResponse: NextResponse.json({ message }, { status: 401 }) };
    }
}

export async function GET(request: Request) {
    const authorization = headers().get('authorization');
    const { errorResponse } = await verifyAdmin(authorization);
    if (errorResponse) return errorResponse;

    try {
        const { db } = getAdminInstances();
        const submissionsRef = db.collection('contactSubmissions').orderBy('submittedAt', 'desc');
        const snapshot = await submissionsRef.get();

        if (snapshot.empty) {
            return NextResponse.json([], { status: 200 });
        }

        const submissions = snapshot.docs.map(doc => {
            const data = doc.data();
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

export async function PUT(request: Request) {
    const authorization = headers().get('authorization');
    const { errorResponse } = await verifyAdmin(authorization);
    if (errorResponse) return errorResponse;

    try {
        const { db } = getAdminInstances();
        const body = await request.json();
        const { id, updates } = z.object({
            id: z.string(),
            updates: z.object({
                isRead: z.boolean().optional(),
            }).passthrough(),
        }).parse(body);

        if (!id || !updates || Object.keys(updates).length === 0) {
            return NextResponse.json({ message: 'Submission ID and updates object are required.' }, { status: 400 });
        }

        await db.collection('contactSubmissions').doc(id).update(updates);
        
        return NextResponse.json({ message: 'Submission updated successfully' }, { status: 200 });

    } catch (apiError: any) {
        console.error('API Error updating submission:', apiError);
        if (apiError instanceof z.ZodError || apiError instanceof SyntaxError) {
             return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
        }
        return NextResponse.json({ message: 'An internal server error occurred while updating the submission.' }, { status: 500 });
    }
}


export async function DELETE(request: Request) {
    const authorization = headers().get('authorization');
    const { errorResponse } = await verifyAdmin(authorization);
    if (errorResponse) return errorResponse;

    try {
        const { db } = getAdminInstances();
        const body = await request.json();
        const { ids } = z.object({
            ids: z.array(z.string()).min(1, "At least one ID must be provided."),
        }).parse(body);

        const batch = db.batch();
        ids.forEach((id: string) => {
            const docRef = db.collection('contactSubmissions').doc(id);
            batch.delete(docRef);
        });
        
        await batch.commit();
        
        return NextResponse.json({ message: 'Submissions deleted successfully' }, { status: 200 });

    } catch (apiError: any) {
        console.error('API Error deleting submission(s):', apiError);
        if (apiError instanceof z.ZodError || apiError instanceof SyntaxError) {
             return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
        }
        return NextResponse.json({ message: 'An internal server error occurred while deleting the submission(s).' }, { status: 500 });
    }
}
