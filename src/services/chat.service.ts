export function getWelcomeMessage(userName = "Guest"): string {
  return `Welcome to Time Chat, ${userName}.`;
}

export function getServerTimeMessage(): string {
  const now = new Date();
  return `Server is alive. Current UTC time: ${now.toISOString()}`;
}
