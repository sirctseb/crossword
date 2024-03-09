import React from "react";

import { block } from "../../../styles";

import "./user-section.scss";

const bem = block("user-section");

export const UserSection: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className={bem()}>{children}</div>;
