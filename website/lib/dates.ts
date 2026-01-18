export const parseUTCDate = (date: string) => {
  return new Date(new Date(date).getTime() - 60 * 60 * 1000);
};
