"use client";

import { RecoilRoot } from "recoil";

export const Root: React.FC<{ children: React.ReactNode }> = ({
  children,
}): React.ReactNode => <RecoilRoot>{children}</RecoilRoot>;
