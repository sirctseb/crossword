"use client";

import { autoUpgradeAnonymousUsers, initializeUI } from "@firebase-ui/core";
import { ConfigProvider } from "@firebase-ui/react";
import { getFirebaseApp } from "../../firebase";

const ui = initializeUI({
  app: getFirebaseApp(),
  behaviors: [autoUpgradeAnonymousUsers()],
});

export const FirebaseUIProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => <ConfigProvider ui={ui}>{children}</ConfigProvider>;
