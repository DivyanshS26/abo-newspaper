
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Customer, Subscription, LocalPaperVersion } from '../types';

interface AppContextType {

    currentUser: Customer | null;
    setCurrentUser: (user: Customer | null) => void;


    currentSubscription: Partial<Subscription> | null;
    setCurrentSubscription: (sub: Partial<Subscription> | null) => void;

    selectedVersion: LocalPaperVersion | null;
    setSelectedVersion: (version: LocalPaperVersion | null) => void;

    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;

    deliveryPlz: string;
    setDeliveryPlz: (plz: string) => void;

    deliveryCity: string;
    setDeliveryCity: (city: string) => void;

}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<Customer | null>(null);
    const [currentSubscription, setCurrentSubscription] = useState<Partial<Subscription> | null>(null);
    const [selectedVersion, setSelectedVersion] = useState<LocalPaperVersion | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [deliveryPlz, setDeliveryPlz] = useState('');
    const [deliveryCity, setDeliveryCity] = useState('');

    return (
        <AppContext.Provider
            value={{
                currentUser,
                setCurrentUser,
                currentSubscription,
                setCurrentSubscription,
                selectedVersion,
                setSelectedVersion,
                isLoading,
                setIsLoading,
                deliveryPlz,
                setDeliveryPlz,
                deliveryCity,
                setDeliveryCity,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
}
