import React, { useCallback } from "react";

import { block } from "../../../../styles";
import type { Box } from "../../../../firebase/types";

const bem = block("box-controls");
import "./box-controls.scss";

export interface BoxControlsProps {
  box: Box;
  onToggleAttribute: (attribute: "circled" | "shaded" | "blocked") => void;
}

export const BoxControls: React.FC<BoxControlsProps> = ({
  box: { blocked, circled, shaded },
  onToggleAttribute,
}) => {
  const killEvent = useCallback<React.MouseEventHandler>((evt) => {
    // this is to prevent bringing focus to the box or opening the rebus
    // if the controls are clicked
    evt.preventDefault();
    evt.stopPropagation();
  }, []);

  const handleToggleBlocked = useCallback<React.MouseEventHandler>(
    (evt) => {
      onToggleAttribute("blocked");
      evt.stopPropagation();
    },
    [onToggleAttribute]
  );

  const handleToggleCircled = useCallback<React.MouseEventHandler>(
    (evt) => {
      onToggleAttribute("circled");
      evt.stopPropagation();
    },
    [onToggleAttribute]
  );

  const handleToggleShaded = useCallback<React.MouseEventHandler>(
    (evt) => {
      onToggleAttribute("shaded");
      evt.stopPropagation();
    },
    [onToggleAttribute]
  );

  return (
    <div className="box-controls">
      <div
        className={bem("block", { blocked })}
        onMouseDown={killEvent}
        onClick={handleToggleBlocked}
      />
      {!blocked && (
        <div
          className={bem("circle", { circled })}
          onMouseDown={killEvent}
          onClick={handleToggleCircled}
        />
      )}
      {!blocked && (
        <div
          className={bem("shade", { shaded })}
          onMouseDown={killEvent}
          onClick={handleToggleShaded}
        />
      )}
    </div>
  );
};

export default BoxControls;
