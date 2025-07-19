
// save this as setAdminClaim.js
// Make sure to: npm install firebase-admin
const admin = require('firebase-admin');

// IMPORTANT: 
// 1. Download your service account key JSON file from Firebase Console:
//    Project Settings > Service accounts > Firebase Admin SDK > Generate new private key.
// 2. Save this key file in the ROOT DIRECTORY of your project as 'firebasekey.json'.
// 3. CRITICAL: Ensure 'firebasekey.json' is listed in your .gitignore file to prevent committing it.
const serviceAccount = require('../../firebasekey.json'); // Assumes key is in root

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// IMPORTANT: Replace 'YOUR_USER_UID_HERE' with the actual UID of the user you want to make an admin.
// You can find the UID in the Firebase Console > Authentication > Users tab.
const userUid = 'YOUR_USER_UID_HERE'; // <-- REPLACE THIS UID

if (userUid === 'YOUR_USER_UID_HERE') {
    console.error('Error: Please replace "YOUR_USER_UID_HERE" with an actual user UID in src/lib/setAdminClaim.js');
    process.exit(1);
}

admin.auth().setCustomUserClaims(userUid, { admin: true })
  .then(() => {
    console.log(`Successfully set admin claim for user ${userUid}`);
    console.log('The user may need to log out and log back in for the claim to take effect immediately on the client.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error setting custom claims:', error);
    process.exit(1);
  });

// How to run this script:
// 1. Ensure you have Node.js installed.
// 2. In your project directory: npm install firebase-admin
// 3. Download your service account key JSON file from Firebase Console and save it as 'firebasekey.json' in your project root.
// 4. Update `userUid` in this script with the UID of the user you want to grant admin rights.
// 5. Run from your terminal: node src/lib/setAdminClaim.js 
// DO NOT commit your service account key to your Git repository. Ensure it's in .gitignore.
