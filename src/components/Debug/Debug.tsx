export const DebugValue: React.FC<any> = (props) => {
  return <pre>{JSON.stringify(props, undefined, "\t")}</pre>;
};
