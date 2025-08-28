# A Note on Data Deletion

This document explains what happens when a user deletes their account from Meet & Tackle.

## The Deletion Process

When a user clicks the "Delete My Account" button and confirms the action, a secure, server-side Netlify Function is called. This function performs the following actions:

1.  **Authenticates the User:** It verifies the user's ID token to ensure they are who they say they are.
2.  **Deletes Firestore Data:** It finds all projects in the database where the user is the owner (`ownerId`) and deletes them.
3.  **Deletes Auth Record:** After successfully deleting the data, it permanently deletes the user's record from the Firebase Authentication system.

This process ensures that when a user deletes their account, both their login credentials and the projects they own are permanently removed from the system.
