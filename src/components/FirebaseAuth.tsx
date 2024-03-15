import StyledFirebaseAuth from "../firebase/ui/react-firebaseui";
import { firebaseAuthConfig } from "../firebase";
import { useFirebase } from "../firebase";

export const FirebaseAuth = () => {
  const { auth } = useFirebase();
  return (
    <StyledFirebaseAuth firebaseAuth={auth} uiConfig={firebaseAuthConfig} />
  );
};
