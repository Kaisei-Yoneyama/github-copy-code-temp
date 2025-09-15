export async function retry<T>(
  task: () => T | Promise<T>,
  baseMs = 500,
  attempts = 5,
): Promise<T> {
  try {
    return await Promise.try(task)
  } catch (error) {
    if (attempts < 1) throw error
    await new Promise((resolve) => setTimeout(resolve, baseMs))
    return retry(task, attempts - 1, baseMs * 2)
  }
}
