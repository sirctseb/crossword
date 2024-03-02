import { makeAuthAtom } from "./auth";
import { getFirebaseApp, getFirebaseDatabase } from "../firebase";
import { makeAtomFamily } from ".";
import type { Box, Crossword } from "../firebase/types";

export const authAtom = makeAuthAtom(getFirebaseApp());

export const crosswordAtomFamily = makeAtomFamily<
  Crossword,
  { crosswordId: string }
>("/crosswords/{crosswordId}", getFirebaseDatabase());

export type ArrayCrossword = Omit<Crossword, "boxes"> & { boxes: Box[][] };
