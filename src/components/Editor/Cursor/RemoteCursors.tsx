import React from "react";

import { block } from "../../../styles";
import "./remote-cursors.scss";
import type { Cursor } from "../../../firebase/types";
import type { Entity } from "./useRemoteCursors";
const bem = block("remote-cursors");

interface RemoteCursorsProps {
  cursors?: Entity<Cursor>[];
}

export const RemoteCursors: React.FC<RemoteCursorsProps> = ({
  cursors = null,
}) =>
  cursors && (
    <div className={bem()}>
      {cursors.map(({ id, color, displayName, photoUrl }) => (
        <div
          key={id}
          className={bem("cursor")}
          style={{ backgroundColor: `#${color}` }}
        >
          <div className={bem("details")}>
            <div>{displayName || "Unknown puzzler"}</div>
            {photoUrl && <img src={photoUrl} />}
          </div>
        </div>
      ))}
    </div>
  );
