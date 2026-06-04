export const normalizePercentValue = (value: number) => {
  return Math.min(100, Math.max(0, Math.round(value)));
};

export const normalizeRatePercentValue = (value: number) => {
  const percentValue = value > 0 && value <= 1 ? value * 100 : value;

  return normalizePercentValue(percentValue);
};
