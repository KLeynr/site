
'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    errorEmitter.on('permission-error', (error) => {
      toast({
        variant: 'destructive',
        title: 'Erişim Engellendi',
        description: `Bu işlemi gerçekleştirmek için yetkiniz yok. (Yol: ${error.context.path})`,
      });
    });
  }, [toast]);

  return null;
}
