"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Link from "next/link";
import { Button } from "./ui/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === "development";
      
      return (
        <div className="w-full min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="bg-card border border-border p-8 rounded-3xl max-w-lg w-full space-y-6 shadow-xl relative overflow-hidden">
            <span className="text-5xl block animate-bounce select-none">✨</span>
            <div className="space-y-2">
              <h2 className="text-xl font-black font-heading">Something went wrong</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                An unexpected error occurred in the CelebrationCraft application. Don&apos;t worry, your event data is safe.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button onClick={this.handleReset} className="flex-1 font-bold">
                Try Again 🔄
              </Button>
              <Link href="/" className="flex-1" onClick={this.handleReset}>
                <Button variant="outline" className="w-full font-bold">
                  Go Home ➔
                </Button>
              </Link>
            </div>

            {isDev && this.state.error && (
              <details className="text-left bg-secondary/40 p-4 rounded-xl border border-border mt-4 text-xs font-mono overflow-auto max-h-48 text-muted-foreground">
                <summary className="cursor-pointer font-bold text-foreground focus:outline-none mb-1">
                  Error Details (Dev Mode)
                </summary>
                <p className="font-bold text-destructive">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <pre className="mt-2 text-[10px] leading-normal whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
