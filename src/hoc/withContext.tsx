import React from 'react';

export interface WithContextProps<T> {
  context: T;
}

type ComponentWithContextProps<T, P> = Omit<P, keyof WithContextProps<T>>;

export const withContext = <T, P extends WithContextProps<T>>(
  context: React.Context<T>,
  Component: React.ComponentType<P>
): React.FC<ComponentWithContextProps<T, P>> => {
  const displayName = (Component.displayName = Component.displayName || Component.name);

  const ComponentWithContext: React.FC<ComponentWithContextProps<T, P>> = (props) => (
    <Component {...(props as P)} context={React.useContext(context)} />
  );

  ComponentWithContext.displayName = `withContext(${displayName})`;
  return ComponentWithContext;
};
