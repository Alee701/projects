
// save this as setAdminClaim.js
// Make sure to: npm install firebase-admin
const admin = require('firebase-admin');

// IMPORTANT: 
// 1. Download your service account key JSON file from Firebase Console:
//    Project Settings > Service accounts > Firebase Admin SDK > Generate new private key.
// 2. Save this key file in a SECURE LOCAL DIRECTORY, NOT in your project's src folder or any deployed folder.
// 3. Update the path below to point to YOUR ACTUAL key file.
// 4. CRITICAL: If you place this key file anywhere within your project structure temporarily,
//    ADD ITS FILENAME TO YOUR .gitignore FILE IMMEDIATELY to prevent committing it.
//    For example, if your key file is named 'my-firebase-admin-key.json', add 'my-firebase-admin-key.json' to .gitignore.
const serviceAccount = require('./firebasekey.json'); // 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// IMPORTANT: Replace 'UID_OF_THE_USER_TO_MAKE_ADMIN' with the actual UID of the user you want to make an admin.
// You can find the UID in the Firebase Console > Authentication > Users tab.
const userUid = 'Z1zjYfcgaDff5dwg6N2s4bmyFxi1'; // <-- REPLACE THIS UID

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
// 2. In your project directory (or where you have this script): npm install firebase-admin
// 3. Download your service account key JSON file from Firebase Console.
// 4. Update the `serviceAccount` path in this script to point to your downloaded key.
// 5. Update `userUid` with the UID of the user you want to grant admin rights.
// 6. Run from your terminal: node src/lib/setAdminClaim.js 
//    (Adjust path to script if you run it from a different directory).
// DO NOT commit your service account key to your Git repository. Ensure it's in .gitignore if placed in the project.
