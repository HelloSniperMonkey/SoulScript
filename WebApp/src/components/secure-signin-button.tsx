"use client"

import React, { useState, useEffect } from 'react';
import { signInWithGoogle } from '@/lib/firebase';
import { Button } from '@/components/ui/button';

/**
 * A helper function to detect if the app is running in a known webview.
 * This is not 100% foolproof but covers most common cases like Facebook, Instagram, and LinkedIn.
 */
const isWebView = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  // Check for specific keywords found in in-app browser user agents
  const webViewKeywords = /FBAN|FBAV|Instagram|LinkedIn|WebView|wv/i;
  const isStandalone = !!window.matchMedia('(display-mode: standalone)').matches;

  // A more reliable check for iOS webviews
  const isIOSWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(userAgent);
  
  // Check for LinkedIn specifically
  const isLinkedInWebView = /LinkedIn/i.test(userAgent);
  
  // If it's not a standard browser and not in standalone mode (e.g., PWA)
  if (isIOSWebView || isLinkedInWebView || (webViewKeywords.test(userAgent) && !isStandalone)) {
    return true;
  }
  
  return false;
};

interface SecureSignInButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  children?: React.ReactNode;
}

/**
 * A wrapper component that shows the normal sign-in button in a regular browser,
 * but shows a "Open in Browser" prompt when inside a restrictive webview.
 */
const SecureSignInButton: React.FC<SecureSignInButtonProps> = ({ 
  variant = "ghost", 
  className = "text-white hover:bg-purple-900/30",
  children = "Sign In with Google"
}) => {
  const [inWebView, setInWebView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // We only run this check on the client-side after the component mounts
    setInWebView(isWebView());
  }, []);

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const user = await signInWithGoogle();
      if (user) {
        console.log('Signed in successfully:', user.displayName);
        window.location.href = '/dashboard'; // Redirect to the main app page
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      // Handle sign-in errors
    } finally {
      setIsLoading(false);
    }
  };
  
  const openInBrowser = () => {
    // This creates a link to the current page and simulates a click
    // The target="_blank" is a strong hint for the OS to open it in the default browser
    const link = document.createElement('a');
    link.href = window.location.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (inWebView) {
    // RENDER THIS INSIDE A WEBVIEW
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 rounded-md max-w-sm" role="alert">
        <p className="font-bold text-sm">🔒 Secure Sign-in Required</p>
        <p className="text-xs mt-1 mb-3">For your security, please open this page in your main browser (Safari, Chrome, etc.) to sign in with Google.</p>
        <Button
          onClick={openInBrowser}
          variant="default"
          size="sm"
          className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 h-auto"
        >
          🌐 Continue in Browser
        </Button>
      </div>
    );
  }

  // RENDER THIS IN A NORMAL BROWSER
  return (
    <Button 
      onClick={handleGoogleSignIn}
      variant={variant}
      className={className}
      disabled={isLoading}
    >
      {isLoading ? "Signing in..." : children}
    </Button>
  );
};

export default SecureSignInButton;
