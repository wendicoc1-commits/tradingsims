'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  title?: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

/**
 * WidgetErrorBoundary - Catches runtime render errors inside individual dashboard widgets.
 * Prevents a single faulty widget from causing a White Screen of Death across the entire workstation.
 */
export class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMsg: error?.message || 'Terjadi kesalahan tidak terduga pada widget ini.',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[WidgetErrorBoundary caught in "${this.props.title || 'Widget'}"]`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMsg: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full min-h-[220px] flex flex-col items-center justify-center p-4 bg-[#09090b] border border-rose-900/50 rounded-lg text-center font-mono select-none">
          <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <span className="text-xs font-bold text-zinc-200">
            {this.props.title || 'Widget'} Mengalami Kendala
          </span>
          <p className="text-[10px] text-zinc-500 mt-1 max-w-xs truncate">
            {this.state.errorMsg}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-3 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] rounded flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-700 font-sans"
          >
            <RefreshCw className="w-3 h-3 text-amber-400" />
            <span>Muat Ulang Widget</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WidgetErrorBoundary;
