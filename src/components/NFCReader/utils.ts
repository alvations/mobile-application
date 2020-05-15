export const formatCanId = (canId: string): string => {
  return canId.match(/.{1,4}/g)!.join(" ");
};
