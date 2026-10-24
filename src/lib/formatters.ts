export function formatINR(amount: number | null | undefined, hidePrivacy: boolean = false): string {
  if (hidePrivacy) {
    return "₹ ••••••.••";
  }
  const val = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatINRWithDecimals(amount: number | null | undefined, hidePrivacy: boolean = false): string {
  return formatINR(amount, hidePrivacy);
}

export function maskAccountNumber(accNumber?: string | null, last4?: string | null, hidePrivacy: boolean = false): string {
  if (hidePrivacy) {
    return "•••• •••• ••••";
  }
  const digits = last4 || (accNumber ? accNumber.slice(-4) : "0000");
  return `•••• •••• •••• ${digits}`;
}

export function maskCreditCardNumber(last4?: string | null, hidePrivacy: boolean = false): string {
  if (hidePrivacy) {
    return "•••• •••• •••• ••••";
  }
  const digits = last4 || "xxxx";
  return `•••• •••• •••• ${digits}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatThermalDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}
