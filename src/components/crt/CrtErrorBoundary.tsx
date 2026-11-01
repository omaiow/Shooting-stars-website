import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Rendered instead of the CRT if the 3D scene fails (network, WebGL…). */
  fallback: ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * If the CRT scene can't load, show the normal full-screen site rather than
 * letting the error take the whole page down.
 */
export class CrtErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('CRT frame failed; showing the site without it.', error, info.componentStack);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
