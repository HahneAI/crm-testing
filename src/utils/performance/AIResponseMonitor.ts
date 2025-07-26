import toast from 'react-hot-toast';

const AI_RESPONSE_THRESHOLD = 3000; // 3 seconds

export const monitorAIResponse = async <T>(
  promise: Promise<T>
): Promise<T> => {
  const startTime = Date.now();

  try {
    const result = await promise;
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (duration > AI_RESPONSE_THRESHOLD) {
      toast.error(
        `AI response took too long: ${duration}ms. Please try again.`
      );
      // Optionally, send a performance alert here.
    }

    return result;
  } catch (error) {
    toast.error('An error occurred while communicating with the AI.');
    throw error;
  }
};
