export const assertUnreachable = (_x: never): never => {
  throw new Error('Error Unreachable');
};
