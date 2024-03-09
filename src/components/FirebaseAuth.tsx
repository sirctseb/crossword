import StyledFirebaseAuth from "../firebase/ui/react-firebaseui";
import { getFirebaseAuth } from "../firebase";
import { firebaseAuthConfig } from "../firebase";

const auth = getFirebaseAuth();

export const FirebaseAuth = () => {
  return (
    <StyledFirebaseAuth firebaseAuth={auth} uiConfig={firebaseAuthConfig} />
  );
};
