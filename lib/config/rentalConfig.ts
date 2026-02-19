export interface RentalConfig {
  rentalDays: number;
  extensionDays: number;
  maxExtensions: number;
}

export function getRentalConfig(): RentalConfig {
  return {
    rentalDays: parseInt(process.env.RENTAL_DURATION_DAYS || "21", 10),
    extensionDays: parseInt(process.env.EXTENSION_DURATION_DAYS || "14", 10),
    maxExtensions: parseInt(process.env.MAX_EXTENSIONS || "2", 10),
  };
}
