class RateLimiter {
  private limited: Partial<Record<string, Set<string>>> = {};

  isLimited = (fieldId: string, userId: string) => !!this.limited[fieldId]?.has(userId);

  limit = (fieldId: string, userId: string, time: number) => {
    if (!(fieldId in this.limited)) this.limited[fieldId] = new Set(userId);
    else this.limited[fieldId]!.add(userId);

    setTimeout(() => {
      this.limited[fieldId]?.delete(userId);
    }, time);
  };
}

export const rateLimiter = new RateLimiter();
