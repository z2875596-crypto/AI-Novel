export function retryableGenerationError(error: unknown): boolean {
  const status = (error as { status?: number } | null)?.status
  return !status || status === 408 || status === 429 || status >= 500
}

/** Retry generation only; game state is committed once by the caller. */
export async function generateWithRetry<T>(
  attempt: (index: number) => Promise<T>,
  signal: AbortSignal,
  onRetry: () => void,
): Promise<T> {
  for (let index = 0; index < 2; index++) {
    signal.throwIfAborted()
    try { return await attempt(index) }
    catch (error) {
      if (signal.aborted || index === 1 || !retryableGenerationError(error)) throw error
      onRetry()
    }
  }
  throw new Error('Generation failed')
}
