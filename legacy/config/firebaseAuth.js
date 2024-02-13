import firebase from 'firebase';

export default {
    autoUpgradeAnonymousUsers: true,
    callbacks: {
        signInSuccessWithAuthResult: (/* authResult, redirectUrl */) =>
            // TODO set user info in redux?
            true,
        uiShown: () => {
            // TODO ? example code hides a loader
        },
    },
    signInFlow: 'popup',
    // TODO can we come back to whatever the current url is?
    signInSuccessUrl: '/',
    signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    ],
    // TODO what are these used for?
    tosUrl: '/tos',
    privacyPolicyUrl: '/privacy',
};
