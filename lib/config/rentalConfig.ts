import { LogEvents } from "../logEvents";
import { errorLogger } from "../logger";

export interface RentalConfig {
  rentalDays: number;
  extensionDays: number;
  maxExtensions: number;
}

export function getRentalConfig(): RentalConfig {
  const { RENTAL_DURATION_DAYS, EXTENSION_DURATION_DAYS, MAX_EXTENSIONS } =
    process.env;

  if (
    RENTAL_DURATION_DAYS === undefined ||
    EXTENSION_DURATION_DAYS === undefined ||
    MAX_EXTENSIONS === undefined
  ) {
    errorLogger.warn(
      {
        event: LogEvents.CONFIG_ERROR,
        endpoint: "rentalConfig",
        reason: "No extension duration config provided, going to default",
      },
      "No extension duration config provided, going to default",
    );
  }
  return {
    rentalDays: parseInt(RENTAL_DURATION_DAYS || "21", 10),
    extensionDays: parseInt(EXTENSION_DURATION_DAYS || "14", 10),
    maxExtensions: parseInt(MAX_EXTENSIONS || "2", 10),
  };
}
