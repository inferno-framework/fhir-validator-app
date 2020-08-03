import React, { useContext, FC, ComponentType, Context } from 'react';

export interface WithContextProps<T> {
  context: T;
}

type ComponentWithContextProps<T, P> = Omit<P, keyof WithContextProps<T>>;

export const withContext = <T, P extends WithContextProps<T>>(
  context: Context<T>,
  Component: ComponentType<P>
): FC<ComponentWithContextProps<T, P>> => {
  const displayName = (Component.displayName = Component.displayName || Component.name);

  const ComponentWithContext: FC<ComponentWithContextProps<T, P>> = (props) => (
    <Component {...(props as P)} context={useContext(context)} />
  );

  ComponentWithContext.displayName = `withContext(${displayName})`;
  return ComponentWithContext;
};
