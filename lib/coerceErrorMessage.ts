export default function coerceErrorMessage(error: unknown, unknownMessage: string = 'Unknown error') {
  if (error instanceof Error) return error.message;
  return unknownMessage;
}