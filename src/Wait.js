import React from 'react';

export default (
  RealComponent,
  {
    propTypes = RealComponent.propTypes,
    WaitComponent = null,
    toggle = (props) => Object.keys(propTypes).every((key) => props[key] !== undefined),
  } = {}
) => (props) => (toggle(props) ? <RealComponent {...props} /> : WaitComponent && <WaitComponent {...props} />);
