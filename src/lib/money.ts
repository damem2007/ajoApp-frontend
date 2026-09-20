export function amount(minor: number, currency: string) {
  return (
    ({ CAD: "CA$", USD: "US$", NGN: "₦", GBP: "£" }[currency] ||
      currency + " ") +
    new Intl.NumberFormat("en-CA", { maximumFractionDigits: 2 }).format(
      minor / 100,
    )
  );
}
