# Firestore Security Rules for Meet & Tackle

To enable the new hybrid authentication model (private ownership but public, collaborative access), you must update the security rules for your Cloud Firestore database.

**IMPORTANT:** These rules are intentionally more open to allow non-logged-in users to contribute to projects, as requested. Anyone with a project link will be able to read its contents and make changes. The application prompts for a name before allowing changes, but the database itself allows writes from any user.

Please copy and paste the following rules into the "Rules" tab of your Cloud Firestore console.

```json
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Rules for the main 'projects' collection
    match /artifacts/meetandtackle-app/public/data/projects/{projectId} {
      // Anyone can read a project's main details (name, deadline, etc.)
      allow read: if true;

      // Only the authenticated owner can update the project's main details or delete it.
      // Any authenticated user can join a project (update the 'members' array).
      allow create: if true;
      allow update: if request.auth != null &&
                    (request.auth.uid == resource.data.ownerId ||
                     request.resource.data.diff(resource.data).affectedKeys().hasOnly(['members']));
      allow delete: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }

    // Rules for subcollections within a project (tasks, comments, activityLog)
    match /artifacts/meetandtackle-app/public/data/projects/{projectId}/{document=**} {
      // Anyone can read and write to the subcollections (e.g., adding tasks,
      // updating status, posting comments). The application logic handles
      // prompting for a name from non-logged-in users.
      allow read, write: if true;
    }

    // --- Legacy Rules (if you have old data) ---
    // Repeat the same rules for the old 'project-buddy-app' ID if you need to support old projects.
    match /artifacts/project-buddy-app/public/data/projects/{projectId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }

    match /artifacts/project-buddy-app/public/data/projects/{projectId}/{document=**} {
       allow read, write: if true;
    }
  }
}
```

## Firestore Index Requirement

To allow for querying projects by owner and sorting them by creation date, you will also need to create a **composite index** in Firestore. (This is the same index as before, but it's crucial for the "Your Projects" list for logged-in users).

1.  Go to the "Indexes" tab in your Cloud Firestore console.
2.  Click "Create Index".
3.  **Collection ID:** `projects`
4.  **Fields to index:**
    *   `ownerId` - Ascending
    *   `createdAt` - Descending
5.  **Query scope:** Collection
6.  Click "Create".

The index will take a few minutes to build. The "Your Projects" list on the homepage will not work until this index is active.
