# A Note on Data Deletion

This document explains what happens when a user deletes their account from Meet & Tackle.

## What is Deleted

When a user clicks the "Delete My Account" button and confirms the action, their **Firebase Authentication user account is permanently deleted**. This means:
- Their email, password, and any associated authentication providers (like their Google account link) are removed from the Firebase Auth system.
- They will no longer be able to log in to Meet & Tackle with those credentials.

## What is NOT Deleted

**Deleting an authentication account does NOT automatically delete the data that user created in Cloud Firestore.**

Specifically, the **projects** created by the user will remain in the database. They will become "orphaned" because their `ownerId` will no longer correspond to an existing user in the authentication system.

## Why?

Deleting a user's associated data automatically requires server-side logic, typically in the form of a **Cloud Function** that is triggered by the `functions.auth.user().onDelete()` event.

This client-side application does not have the permissions or capability to set up such a function.

## Recommended Action

To provide a complete data deletion experience, you should create and deploy a Cloud Function for Firebase with the following logic:

```javascript
// This is an example in Node.js for Cloud Functions for Firebase
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.onUserDeleted = functions.auth.user().onDelete(async (user) => {
  const firestore = admin.firestore();
  const userId = user.uid;

  // Find all projects owned by the deleted user
  const query = firestore.collectionGroup('projects').where('ownerId', '==', userId);
  const snapshot = await query.get();

  // Delete each project and its subcollections
  const batch = firestore.batch();
  snapshot.docs.forEach(doc => {
    console.log(`Deleting project ${doc.id} for user ${userId}`);
    // Note: Deleting a document does NOT delete its subcollections.
    // For a full cleanup, you would need to recursively delete subcollections (tasks, comments, etc.)
    // This is a more complex operation. A simpler approach for now is just deleting the project doc.
    batch.delete(doc.ref);
  });

  return batch.commit();
});
```

This function would ensure that when a user deletes their account, all the projects they own are also removed from the database.
