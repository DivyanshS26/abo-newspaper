
export interface Address {
    street1: string;
    street2?: string;
    city: string;
    plz: string;
}

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

export interface Subscription {
    id: number;
    cid: number;
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

export interface LocalPaperVersion {
    id: number;
    name: string;
    picture: string;
}

export interface DistanceResult {
    distance: number;
    plzDestination: string;
}

export type NewCustomer = Omit<Customer, 'id'> & { id?: number };

export type NewSubscription = Omit<Subscription, 'id'> & { id?: number };
