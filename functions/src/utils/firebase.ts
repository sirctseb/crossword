import admin from "firebase-admin";
import type { DataSnapshot } from "firebase-admin/database";

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

export { admin };

export const snapVal = (snap: DataSnapshot) => snap.val();
