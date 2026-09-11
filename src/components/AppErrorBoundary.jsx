import React from 'react';

export default class AppErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[v0] HOMMIE UI crashed:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen bg-[#f6f8f7] px-6 py-16 text-[#132238]">
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl font-black text-amber-700">H</div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">HOMMIE</p>
          <h1 className="mt-3 text-2xl font-black tracking-tight">Something went wrong</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">The page hit an unexpected issue. Your account and bookings are safe. Reload to continue.</p>
          <button type="button" onClick={this.handleReload} className="mt-7 rounded-xl bg-[#132238] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#203653]">Reload HOMMIE</button>
        </div>
      </main>
    );
  }
}
