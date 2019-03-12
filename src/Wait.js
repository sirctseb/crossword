import React from 'react';

export default (
  RealComponent,
  propTypes = RealComponent.propTypes,
  WaitComponent = null,
) => props =>
  (Object.keys(propTypes).every(key => props[key] !== undefined) ?
    <RealComponent {...props} /> :
    WaitComponent && <WaitComponent {...props} />);

