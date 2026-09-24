import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InstallNudge() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showNudge, setShowNudge] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if not previously dismissed recently
      const dismissedAt = localStorage.getItem('install_nudge_dismissed');
      if (!dismissedAt || Date.now() - parseInt(dismissedAt) > 1000 * 60 * 60 * 24 * 7) { // 7 days
        setShowNudge(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowNudge(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowNudge(false);
    localStorage.setItem('install_nudge_dismissed', Date.now().toString());
  };

  if (!showNudge) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom-10 pointer-events-none">
      <div className="max-w-md mx-auto bg-card border border-border shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4 pointer-events-auto ring-1 ring-black/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <Download className="text-primary" size={20} />
          </div>
          <div>
            <p className="font-semibold text-sm">Install App</p>
            <p className="text-xs text-muted-foreground">Add to home screen for quick access.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleInstallClick} className="rounded-xl h-8 text-xs font-semibold">
            Install
          </Button>
          <button onClick={handleDismiss} className="text-muted-foreground hover:bg-muted p-1.5 rounded-full transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
