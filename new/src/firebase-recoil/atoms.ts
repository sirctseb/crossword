import { makeAuthAtom } from "./auth";
import { getFirebaseApp } from "../firebase";

export const authAtom = makeAuthAtom(getFirebaseApp());
