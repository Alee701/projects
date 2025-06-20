
// save this as setAdminClaim.js
// Make sure to: npm install firebase-admin
const admin = require('firebase-admin');
// You need to download your service account key JSON from
// Firebase Console > Project Settings > Service accounts
// IMPORTANT: Replace './path/to/your-service-account-key.json' with the actual path to your key.
const serviceAccount = require('./path/to/your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// IMPORTANT: Replace 'UID_OF_THE_USER_TO_MAKE_ADMIN' with the actual UID of the user you want to make an admin.
// You can find the UID in the Firebase Console > Authentication > Users tab.
const userUid = 'UID_OF_THE_USER_TO_MAKE_ADMIN'; 

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
// 2. Install the Firebase Admin SDK: npm install firebase-admin (or yarn add firebase-admin) in your project directory.
// 3. Download your service account key JSON file from Firebase Console.
// 4. Update the `serviceAccount` path in this script to point to your downloaded key.
// 5. Update `userUid` with the UID of the user you want to grant admin rights.
// 6. Run from your terminal: node src/lib/setAdminClaim.js
//    (Adjust path to script if you save it elsewhere, e.g., node scripts/setAdminClaim.js)
// DO NOT commit your service account key to your Git repository.
// Add the key file's name to your .gitignore file.
