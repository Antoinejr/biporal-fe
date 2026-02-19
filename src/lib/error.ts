import { AxiosError } from "axios";

export function getFriendlyErrorMessage(err: unknown): string {
  if (!(err instanceof AxiosError)) {
    return err instanceof Error ? err.message : "An unexpected error occured";
  }
  const status = err.response?.status;
  const serverMessage = err.response?.data.message;

  if (status === 401)
    return "Incorrect username or password. Please try again.";
  if (status === 403)
    return "You don't have permission to perform this action.";
  if (status === 404) return "The requested information could not be found.";
  if (status === 500)
    return "The server is having a moment. Please try again in a few minutes.";

  if (serverMessage) {
    const rawMsg = Array.isArray(serverMessage)
      ? serverMessage.join(". ")
      : serverMessage;

    return rawMsg
      .replace(/lagId/gi, "Reference ID")
      .replace(/notes/gi, "Note field")
      .replace(/credentials/gi, "login details");
  }

  return err.message || "Connection failed. Please check your internet.";
}
