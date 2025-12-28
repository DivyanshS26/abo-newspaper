
/**
 * Calculate subscription price based on parameters
 */
export function calculatePrice(
    distance: number,
    subscriptionType: 'Daily' | 'Weekend',
    paymentType: 'Monthly' | 'Annual',
    deliveryMethod: 'Post' | 'Delivery man'
): { monthlyPrice: number; yearlyPrice: number } {

    let basePrice = subscriptionType === 'Daily' ? 15.99 : 8.99;

    if (deliveryMethod === 'Post') {
        if (distance > 50) basePrice += 5.0;
        else if (distance > 20) basePrice += 2.5;
    }

    const yearlyPrice = paymentType === 'Annual'
        ? basePrice * 12 * 0.9  // 10% discount for annual
        : basePrice * 12;

    return {
        monthlyPrice: parseFloat(basePrice.toFixed(2)),
        yearlyPrice: parseFloat(yearlyPrice.toFixed(2)),
    };
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
    return `€${price.toFixed(2)}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Hash password (simple - for demo only)
 */
export function hashPassword(password: string): string {

    return btoa(password);
}
