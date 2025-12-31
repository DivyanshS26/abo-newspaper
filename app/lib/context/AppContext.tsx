'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

function getStoredValue<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

export function AppProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUserState] = useState<Customer | null>(() =>
        getStoredValue('app_currentUser', null)
    );
    const [currentSubscription, setCurrentSubscriptionState] = useState<Partial<Subscription> | null>(() =>
        getStoredValue('app_currentSubscription', null)
    );
    const [selectedVersion, setSelectedVersionState] = useState<LocalPaperVersion | null>(() =>
        getStoredValue('app_selectedVersion', null)
    );
    const [deliveryPlz, setDeliveryPlzState] = useState<string>(() =>
        getStoredValue('app_deliveryPlz', '')
    );
    const [deliveryCity, setDeliveryCityState] = useState<string>(() =>
        getStoredValue('app_deliveryCity', '')
    );
    const [isLoading, setIsLoading] = useState(false);

    // Wrapped setters that save synchronously to sessionStorage
    const setCurrentUser = (user: Customer | null) => {
        setCurrentUserState(user);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('app_currentUser', JSON.stringify(user));
        }
    };

    const setCurrentSubscription = (sub: Partial<Subscription> | null) => {
        setCurrentSubscriptionState(sub);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('app_currentSubscription', JSON.stringify(sub));
        }
    };

    const setSelectedVersion = (version: LocalPaperVersion | null) => {
        setSelectedVersionState(version);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('app_selectedVersion', JSON.stringify(version));
        }
    };

    const setDeliveryPlz = (plz: string) => {
        setDeliveryPlzState(plz);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('app_deliveryPlz', JSON.stringify(plz));
        }
    };

    const setDeliveryCity = (city: string) => {
        setDeliveryCityState(city);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('app_deliveryCity', JSON.stringify(city));
        }
    };

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
