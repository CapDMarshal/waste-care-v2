import { useRouter } from 'next/navigation';

interface UseConfirmationProps {
  onResetReport: () => void;
}

export function useConfirmation({ onResetReport }: UseConfirmationProps) {
  const router = useRouter();

  const handleDone = () => {
    // Reset report data
    onResetReport();
    // Navigate to dashboard using Next.js router
    router.push('/dashboard');
  };

  const handleBack = () => {
    window.history.back();
  };

  return {
    handleDone,
    handleBack,
  };
}
