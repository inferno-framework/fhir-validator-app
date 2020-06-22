import React from 'react';

export interface WithContextProps<T> {
  context: T;
}

export const withContext = <T, P extends WithContextProps<T>>(
  context: React.Context<T>,
  Component: React.ComponentType<P>
) => {
  const displayName = Component.displayName = Component.displayName || Component.name;

  const ComponentWithContext = (props: Omit<P, keyof WithContextProps<T>>) => (
    <Component {...props as P} context={React.useContext(context)} />
  );

  ComponentWithContext.displayName = `withContext(${displayName})`;
  return ComponentWithContext;
};
