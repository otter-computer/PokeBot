const FirebaseAdmin = require('firebase-admin');

class Firebase {
  /**
   * Initialize a Firebase app and database.
   * @constructor
   */
  constructor() {
    FirebaseAdmin.initializeApp({
      credential: FirebaseAdmin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });

    this.database = FirebaseAdmin.database();
  }
}

module.exports = Firebase;
