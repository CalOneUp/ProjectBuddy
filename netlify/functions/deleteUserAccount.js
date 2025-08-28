const admin = require('firebase-admin');

// Initialize the Firebase Admin SDK
// IMPORTANT: The service account credentials must be set as an environment variable
// in your Netlify build settings. The variable should be named FIREBASE_ADMIN_CONFIG
// and its value should be the full JSON content of the service account key.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_CONFIG)),
  });
}

const db = admin.firestore();

exports.handler = async function(event, context) {
  // Ensure the request is a POST request
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Get the ID token from the Authorization header
  if (!event.headers.authorization || !event.headers.authorization.startsWith('Bearer ')) {
    return { statusCode: 401, body: 'Unauthorized: No token provided' };
  }
  const idToken = event.headers.authorization.split('Bearer ')[1];

  try {
    // Verify the ID token to get the user's UID
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // --- Step 1: Delete user's projects from Firestore ---
    // Note: This only deletes the project documents themselves. For a more robust
    // solution, you would need to recursively delete all subcollections (tasks, comments, etc.)
    // which is a more complex operation, often handled by a dedicated cleanup utility.
    const projectsRef = db.collectionGroup('projects').where('ownerId', '==', uid);
    const snapshot = await projectsRef.get();

    if (!snapshot.empty) {
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            console.log(`Preparing to delete project: ${doc.id} for user: ${uid}`);
            batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`Successfully deleted ${snapshot.size} projects for user: ${uid}`);
    }

    // --- Step 2: Delete the user from Firebase Authentication ---
    await admin.auth().deleteUser(uid);
    console.log(`Successfully deleted auth user: ${uid}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Account and associated projects deleted successfully.' }),
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    // Provide a more specific error message if the token is expired
    if (error.code === 'auth/id-token-expired') {
        return { statusCode: 401, body: 'Unauthorized: Token expired. Please sign in again.' };
    }
    return { statusCode: 500, body: `Internal Server Error: ${error.message}` };
  }
};
