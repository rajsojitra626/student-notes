# Student Notes Hub

## Current State
A notes-sharing app where students can register/login (Internet Identity) and then browse, upload, download, search, filter, edit, and delete notes. Currently all backend functions require user authentication. The frontend has an AuthPage for login/registration.

## Requested Changes (Diff)

### Add
- No new features

### Modify
- Backend: Remove all authorization/access control checks. All functions (getAllNotes, getNote, searchNotes, createNote, updateNote, deleteNote, getUserNotes) should work without authentication. Only owner-check remains for updateNote and deleteNote.
- Frontend: Remove AuthPage and login requirement. All pages (Browse, Upload, Note Detail) should be accessible without login. Remove "My Notes" section that requires a logged-in user identity. Remove any login prompts or redirects.

### Remove
- Authorization/MixinAuthorization import and usage from backend
- Login/Registration page (AuthPage.tsx) from frontend
- Any frontend auth guards or redirects to login

## Implementation Plan
1. Regenerate backend without authorization component -- open access for all read and write operations, owner stored as Principal but not enforced for reads
2. Update frontend: remove AuthPage, remove auth hooks, make BrowsePage the default landing page
3. Upload form remains but works anonymously (owner will be anonymous principal)
4. Notes can be browsed, searched, filtered, downloaded by anyone
5. Edit/Delete still tied to owner principal (anonymous users share same principal so edit/delete works for same session)
