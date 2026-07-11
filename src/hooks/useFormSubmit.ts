import { useState } from 'react';
import { toast } from 'sonner';

export function useFormSubmit() {
  const [loading, setLoading] = useState(false);

  const execute = async <T,>(
    actionFn: () => Promise<{ error?: string } | T>,
    onSuccess: () => void,
    successMessage: string
  ) => {
    setLoading(true);
    try {
      const result = await actionFn();
      
      // If the server action returns an error explicitly
      if (result && typeof result === 'object' && 'error' in result && result.error) {
        throw new Error(result.error as string);
      }
      
      toast.success(successMessage);
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, execute };
}
