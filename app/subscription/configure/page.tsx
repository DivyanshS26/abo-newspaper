// app/subscription/configure/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context/AppContext';
import { getLocalVersionsForPlz, getDistanceFromCompanyToDestinationPlz } from '@/lib/Api';
import { calculatePrice, formatPrice } from '@/lib/utils';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import type { LocalPaperVersion } from '@/lib/types';

export default function ConfigurePage() {
    const router = useRouter();
    const { deliveryPlz, setCurrentSubscription, setSelectedVersion } = useAppContext();

    // State
    const [localVersions, setLocalVersions] = useState<LocalPaperVersion[]>([]);
    const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
    const [subscriptionType, setSubscriptionType] = useState<'Daily' | 'Weekend'>('Daily');
    const [deliveryMethod, setDeliveryMethod] = useState<'Post' | 'Delivery man'>('Delivery man');
    const [paymentType, setPaymentType] = useState<'Monthly' | 'Annual'>('Monthly');
    const [distance, setDistance] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Helper: normalize API `localversions` into LocalPaperVersion[]
    const normalizeLocalVersions = (lv: unknown): LocalPaperVersion[] => {
        if (lv == null) return [];


        // Top-level may be an array or an object with numeric keys -> normalize to array
        const top = Array.isArray(lv) ? (lv as unknown[]) : Object.values(lv as Record<string, unknown>);

        if (top.length === 0) return [];

        // The API often returns the actual versions as the first entry; that entry may itself be an array or an object
        const first = top[0];

        // Type guard
        const isLocalPaperVersion = (item: unknown): item is LocalPaperVersion => {
            return typeof item === 'object' && item !== null && 'id' in (item as Record<string, unknown>);
        };

        // If `first` is already a LocalPaperVersion, treat `top` as the array of versions
        if (isLocalPaperVersion(first)) {
            return top.filter(isLocalPaperVersion);
        }

        // Otherwise, try to unwrap `first` as a container
        const candidate: unknown[] = Array.isArray(first)
            ? (first as unknown[])
            : (first && typeof first === 'object' ? Object.values(first as Record<string, unknown>) : []);

        return candidate.filter(isLocalPaperVersion);
    };

    // Load data on mount
    useEffect(() => {
        if (!deliveryPlz) {
            // No PLZ - redirect back
            router.push('/subscription/address');
            return;
        }

        const loadConfigurationData = async () => {
            try {
                setLoading(true);
                setError('');

                console.log('Loading config for PLZ:', deliveryPlz);

                // Load local versions
                const versionsResult = await getLocalVersionsForPlz(deliveryPlz);
                console.log('Full API Response:', versionsResult?.localversions);

                let versions: LocalPaperVersion[] = [];
                let apiReturnedData = false; // Track if API actually returned something

                if (versionsResult?.localversions) {
                    apiReturnedData = true;
                    versions = normalizeLocalVersions(versionsResult.localversions);
                    console.log('Final parsed versions:', versions);
                    console.log('Number of versions:', versions.length);
                }

                // If API returned data but it's empty = invalid/unsupported postal code
                if (apiReturnedData && versions.length === 0) {
                    console.warn('API returned empty data - invalid or unsupported postal code');
                    setError(`No newspaper editions available for postal code ${deliveryPlz}. Please try a different address.`);
                    setLocalVersions([]);
                    setLoading(false);
                    return; // Stop here, don't load distance
                }

                // If API didn't respond at all = network/technical error, use fallback
                if (!apiReturnedData) {
                    console.warn('API did not respond, using fallback data');
                    versions = [
                        { id: 1, name: 'Stadtausgabe', picture: '' },
                        { id: 2, name: 'Sportversion', picture: '' },
                        { id: 3, name: 'Landkreisinfos', picture: '' },
                    ];
                    setError('Could not connect to server. Showing default editions.');
                }

                setLocalVersions(versions);

                // Auto-select first version
                if (versions.length > 0) {
                    setSelectedVersionId(versions[0].id);
                    console.log('Auto-selected version:', versions[0]);
                }

                // Calculate distance
                const distanceResult = await getDistanceFromCompanyToDestinationPlz(deliveryPlz);
                console.log('Distance API Response:', distanceResult);
                const distanceValue = distanceResult.distanceCalcObj[0].distance;
                console.log('Parsed distance:', distanceValue);
                setDistance(distanceValue);
                const COMPANY_PLZ = '72762'; // From Database.js pressCompanyInfos.plz [file:2]

                if (distanceValue === 0 && deliveryPlz !== COMPANY_PLZ) {
                    setError(`Postal code ${deliveryPlz} not supported (distance lookup failed). Try a known German PLZ.`);
                    setLocalVersions([]);
                    return; // Block editions
                }

            } catch (err) {
                console.error('Error loading configuration:', err);

                // Technical error - use fallback
                console.warn('Technical error, using fallback data');
                const fallbackVersions = [
                    { id: 1, name: 'Stadtausgabe', picture: '' },
                    { id: 2, name: 'Sportversion', picture: '' },
                    { id: 3, name: 'Landkreisinfos', picture: '' },
                ];
                setLocalVersions(fallbackVersions);
                setSelectedVersionId(fallbackVersions[0].id);
                setDistance(0);


                setError('Technical error occurred. Showing default options.');
            } finally {
                setLoading(false);
            }
        };



        loadConfigurationData();
    }, [deliveryPlz, router]);


    // Calculate pricing
    const pricing = calculatePrice(distance, subscriptionType, paymentType, deliveryMethod);

    const handleContinue = () => {
        console.log('handleContinue called, selectedVersionId =', selectedVersionId);
        if (!selectedVersionId) {
            setError('Please select a newspaper edition');
            return;
        }

        // Find selected version
        const version = localVersions.find(v => v.id === selectedVersionId);

        if (!version) {
            setError('Invalid edition selection');
            return;
        }

        // Save to context
        setSelectedVersion(version);
        setCurrentSubscription({
            abotype: 'Printed',
            deliverymethod: deliveryMethod,
            paymenttype: 'Direct debit',
            payment: paymentType,
            subscriptiontype: subscriptionType,
            calculatedprice: pricing.monthlyPrice,
            calculatedyearprice: pricing.yearlyPrice,
            localpaperversions: selectedVersionId,
            dataprivacyaccepted: false,
        });

        // Navigate to registration
        router.push('/subscription/register');
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4">
                <Card>
                    <p className="text-center font-sans">Loading subscription options...</p>
                </Card>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-4 py-8">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">
                        Configure Your Subscription
                    </h1>
                    <p className="text-sm font-sans text-gray-700">
                        Step 2 of 4 • Customize your newspaper delivery
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">

                    {/* Configuration Panel */}
                    <div className="md:col-span-2">
                        <Card title="Subscription Options">

                            {error && (
                                <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 mb-4 font-sans text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Local Edition Selection */}
                            <div className="mb-6">
                                <div className="block text-sm font-bold mb-3 uppercase tracking-wide">
                                    Local Edition <span className="text-red-600">*</span>
                                </div>



                                {localVersions.length === 0 ? (
                                    <div className="border-2 border-red-500 p-4 text-center bg-red-50">
                                        <p className="font-sans text-red-700">
                                            No local editions available for your postal code.
                                        </p>
                                        <Button
                                            variant="outline"
                                            onClick={() => router.push('/subscription/address')}
                                            className="mt-3"
                                        >
                                            ← Change Address
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {localVersions.map((version, idx) => (
                                            <button
                                                key={`version-${version.id ?? idx}`}
                                                type="button"
                                                onClick={() => {
                                                    console.log('Version clicked:', version.id);
                                                    setSelectedVersionId(version.id);
                                                }}
                                                className={`w-full text-left border-2 p-4 cursor-pointer transition-all ${
                                                    selectedVersionId === version.id
                                                        ? 'border-gold bg-hover'
                                                        : 'border-border hover:border-gold'
                                                }`}
                                            >
                                                <h3 className="font-bold text-lg">{version.name}</h3>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>


                            {/* Subscription Type */}
                            <div className="mb-6">
                                <div className="block text-sm font-bold mb-3 uppercase tracking-wide">
                                    Subscription Type
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSubscriptionType('Daily')}
                                        className={`border-2 p-4 cursor-pointer text-center transition-all ${
                                            subscriptionType === 'Daily'
                                                ? 'border-gold bg-hover'
                                                : 'border-border hover:border-gold'
                                        }`}
                                    >
                                        <h4 className="font-bold">Daily</h4>
                                        <p className="text-xs font-sans text-gray-600 mt-1">7 days a week</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSubscriptionType('Weekend')}
                                        className={`border-2 p-4 cursor-pointer text-center transition-all ${
                                            subscriptionType === 'Weekend'
                                                ? 'border-gold bg-hover'
                                                : 'border-border hover:border-gold'
                                        }`}
                                    >
                                        <h4 className="font-bold">Weekend</h4>
                                        <p className="text-xs font-sans text-gray-600 mt-1">Sat & Sun only</p>
                                    </button>
                                </div>
                            </div>

                            {/* Delivery Method */}
                            <div className="mb-6">
                                <div className="block text-sm font-bold mb-3 uppercase tracking-wide">
                                    Delivery Method
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => distance < 20 && setDeliveryMethod('Delivery man')}
                                        disabled={distance >= 20}
                                        className={`border-2 p-4 cursor-pointer text-center transition-all ${
                                            distance < 20 && deliveryMethod === 'Delivery man'
                                                ? 'border-gold bg-hover'
                                                : 'border-border hover:border-gold'
                                        } ${distance >= 20 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        title={distance >= 20 ? 'Delivery agents only serve local areas (<20km)' : ''}
                                    >
                                        <h4 className="font-bold">Delivery Agent</h4>
                                        <p className="text-xs font-sans text-gray-600 mt-1">
                                            {distance < 20 ? 'Available in your area' : 'Not available (>20km away)'}
                                        </p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeliveryMethod('Post')}
                                        className={`border-2 p-4 cursor-pointer text-center transition-all ${
                                            deliveryMethod === 'Post'
                                                ? 'border-gold bg-hover'
                                                : 'border-border hover:border-gold'
                                        }`}
                                    >
                                        <h4 className="font-bold">Postal Service</h4>
                                        <p className="text-xs font-sans text-gray-600 mt-1">Nationwide delivery</p>
                                    </button>
                                </div>
                                {distance >= 20 && (
                                    <p className="text-xs text-yellow-700 mt-2 font-sans">
                                        💡 Delivery agents only serve local areas. Use Post for nationwide.
                                    </p>
                                )}
                            </div>

                            {/* Payment Interval */}
                            <div className="mb-6">
                                <div className="block text-sm font-bold mb-3 uppercase tracking-wide">
                                    Payment Interval
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentType('Monthly')}
                                        className={`border-2 p-4 cursor-pointer text-center transition-all ${
                                            paymentType === 'Monthly'
                                                ? 'border-gold bg-hover'
                                                : 'border-border hover:border-gold'
                                        }`}
                                    >
                                        <h4 className="font-bold">Monthly</h4>
                                        <p className="text-xs font-sans text-gray-600 mt-1">Pay each month</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentType('Annual')}
                                        className={`border-2 p-4 cursor-pointer text-center transition-all ${
                                            paymentType === 'Annual'
                                                ? 'border-gold bg-hover'
                                                : 'border-border hover:border-gold'
                                        }`}
                                    >
                                        <h4 className="font-bold">Annual</h4>
                                        <p className="text-xs font-sans text-gray-600 mt-1">
                                            Save 10% • Best value
                                        </p>
                                    </button>
                                </div>
                            </div>

                        </Card>
                    </div>

                    {/* Price Summary Sidebar */}
                    <div>
                        <Card title="Price Summary" className="sticky top-4">
                            <div className="space-y-4 font-sans">

                                <div className="border-b-2 border-border pb-3">
                                    <p className="text-xs text-gray-600 mb-1">Edition</p>
                                    <p className="font-bold">
                                        {localVersions.find(v => v.id === selectedVersionId)?.name || 'Not selected'}
                                    </p>
                                    </div>

                                <div className="border-b-2 border-border pb-3">
                                    <p className="text-xs text-gray-600 mb-1">Type</p>
                                    <p className="font-bold">{subscriptionType}</p>
                                </div>

                                <div className="border-b-2 border-border pb-3">
                                    <p className="text-xs text-gray-600 mb-1">Delivery</p>
                                    <p className="font-bold">{deliveryMethod}</p>
                                </div>

                                <div className="border-b-2 border-border pb-3">
                                    <p className="text-xs text-gray-600 mb-1">Distance</p>
                                    <p className="font-bold">{distance.toFixed(1)} km</p>
                                </div>

                                <div className="bg-gold bg-opacity-20 p-4 border-2 border-gold">
                                    <p className="text-xs text-gray-700 mb-2">Monthly Price</p>
                                    <p className="text-3xl font-bold text-ink">
                                        {formatPrice(pricing.monthlyPrice)}
                                    </p>
                                    {paymentType === 'Annual' && (
                                        <p className="text-xs text-gray-600 mt-2">
                                            Annual: {formatPrice(pricing.yearlyPrice)}
                                            <span className="text-green-700 font-bold ml-1">(10% off)</span>
                                        </p>
                                    )}
                                </div>

                            </div>
                        </Card>
                    </div>

                </div>

                {/* Navigation */}
                <div className="mt-8 max-w-4xl mx-auto">
                    <div className="md:col-span-2 flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/subscription/address')}
                        >
                            ← Back
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleContinue}
                            disabled={selectedVersionId === null}
                            title={selectedVersionId === null ? 'Select a newspaper edition first' : 'Continue to registration'}
                            fullWidth
                        >
                            Continue to Registration →
                        </Button>
                    </div>
                </div>


            </div>
        </main>
    );
}
