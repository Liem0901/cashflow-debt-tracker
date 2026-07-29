import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Render error:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-black px-6 text-center">
        <p className="text-sm text-portfolio-gray">Something went wrong loading this page.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-portfolio-elevated px-4 py-2 text-sm font-medium text-white"
        >
          Reload
        </button>
      </div>
    );
  }
}
