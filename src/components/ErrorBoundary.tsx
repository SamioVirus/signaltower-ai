import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Top-level error boundary.
 *
 * A render error in one chart should not leave the viewer staring at a blank
 * page with no idea what happened. The fallback says what broke and offers a
 * way out.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // No telemetry service in a static demo; the console is the only sink.
    console.error("SignalTower render error", error, info.componentStack);
  }

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="grid min-h-screen place-items-center bg-canvas px-6">
        <div className="max-w-lg text-center">
          <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-risk-text">
            Something broke
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-primary">
            This view failed to render
          </h1>
          <p className="mt-3 text-sm leading-6 text-secondary">
            The error was logged to the browser console. Reloading usually
            clears it, since SignalTower holds no server-side state.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-subtle bg-surface-sunken p-3 text-left font-mono text-xs text-muted">
            {error.message}
          </pre>
          <button
            type="button"
            onClick={() => window.location.assign("/")}
            className="mt-5 rounded-lg bg-accent-solid px-4 py-2 text-sm font-semibold text-on-accent transition hover:bg-accent-solid-hover"
          >
            Back to the start
          </button>
        </div>
      </div>
    );
  }
}
