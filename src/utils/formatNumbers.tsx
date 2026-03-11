export function formatWithCommas(number: number | string | null) {
  if (number == null) return '';
  
    return Number(number).toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
}

export function formatWithCommasDEC(value: string | null) {
  if (!value) return '';

  // Split the input into integer and decimal parts
  const [integerPart, decimalPart] = value.split('.');

  // Format integer part with commas
  const formattedInteger = Number(integerPart.replace(/[^0-9]/g, '')).toLocaleString('en-US');

  // Return formatted integer part with decimal part (if any)
  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

export function formatWithCommasAndDec(number: number | string | null) {
  if (number == null) return '';
  
  return Number(number).toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
}