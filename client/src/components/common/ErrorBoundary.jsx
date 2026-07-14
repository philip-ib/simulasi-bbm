import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
          <div className="bg-white rounded-xl shadow-md border-t-4 border-red-600 p-8 max-w-md text-center">
            <h1 className="text-xl font-bold text-red-600 mb-2">Terjadi Kesalahan</h1>
            <p className="text-slate-600 mb-4">
              Aplikasi mengalami error. Silakan refresh halaman.
            </p>
            {process.env.NODE_ENV !== "production" && (
              <pre className="text-left bg-slate-100 rounded-lg p-4 mb-4 text-xs text-red-700 overflow-auto max-h-40">
                {this.state.error?.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Refresh Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
