import * as React from 'react';

export const navigationRef = React.createRef();

export function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
}

/**
 * Replace the whole navigation state with a single route.
 *
 * `navigate` is not sufficient for eviction: it pushes or surfaces a
 * route while leaving the rest of the stack — including the private
 * screen the user was on — underneath it, reachable with a back gesture.
 * A session ending has to remove the history, not cover it.
 */
export function resetTo(name) {
  navigationRef.current?.reset({index: 0, routes: [{name}]});
}
