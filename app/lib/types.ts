// app/lib/types.ts

// Address structure
export interface Address {
    street1: string;
    street2?: string;
    city: string;
    plz: string;
}

// Customer structure
export interface Customer {
    id: number;
    firstname: string;
    lastname: string;
    companyname?: string;
    email: string;
    password: string;
    phone?: string;
    deliveryAddress: Address;
    billingAddress: Address;
}

// Subscription/Abo structure
export interface Subscription {
    id: number;
    cid: number; // Customer ID
    created: string;
    startabodate: string;
    endabodate: string;
    dataprivacyaccepted: boolean;
    abotype: 'Printed' | 'E-paper' | 'Website';
    deliverymethod: 'Post' | 'Delivery man';
    paymenttype: 'Direct debit' | 'Invoice';
    payment: 'Monthly' | 'Annual';
    subscriptiontype: 'Daily' | 'Weekend';
    calculatedprice: number;
    calculatedyearprice: number;
    localpaperversions: number;
}

// Local newspaper version
export interface LocalPaperVersion {
    id: number;
    name: string;
    picture: string;
}

// Distance calculation result
export interface DistanceResult {
    distance: number;
    plzDestination: string;
}

// New customer form data (no ID yet)
export type NewCustomer = Omit<Customer, 'id'> & { id?: number };

// New subscription form data (no ID yet)
export type NewSubscription = Omit<Subscription, 'id'> & { id?: number };
