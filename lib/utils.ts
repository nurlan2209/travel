import { clsx } from "clsx";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return clsx(inputs);
}

export function formatCurrencyKzt(value: number) {
  return new Intl.NumberFormat("kk-KZ").format(value) + " ₸";
}
