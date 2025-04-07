export const getStandardCurrencyCode = (currencyInput) => {
    // If it's already a 3-letter code, return it
    if (/^[A-Z]{3}$/.test(currencyInput)) {
        return currencyInput;
    }
    
    // Handle common symbols
    const symbolToCode = {
        '$': 'USD',
        '£': 'GBP',
        '€': 'EUR',
        '¥': 'JPY',
        '₹': 'INR',
        '₩': 'KRW',
        '₺': 'TRY',
        '₴': 'UAH',
        '₽': 'RUB',
        '₺': 'TRY',
    };
    
    return symbolToCode[currencyInput] || 'USD';
  }