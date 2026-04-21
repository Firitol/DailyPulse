
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * Silenced listener to prevent error reporting as requested.
 * This component remains registered in the provider but no longer logs
 * or reacts to permission errors, providing a completely silent experience.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    // No-op: We are ignoring all emitted permission errors to prevent console noise
    // and potential development overlays as requested by the user.
    const handleError = () => {
      // Intentionally empty to silence errors
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null;
}
