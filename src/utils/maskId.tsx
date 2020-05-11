export const maskId = (id: string, numTrailingCharsShown = 4): string => {
  return id.slice(id.length - numTrailingCharsShown).padStart(id.length, "*");
};
