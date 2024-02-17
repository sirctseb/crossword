import { initializeApp } from "firebase/app";
import { settings } from "../settings/Settings";

export function getFirebaseApp() {
  return initializeApp(settings.firebase);
}
