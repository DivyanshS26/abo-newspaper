'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context/AppContext';
import { getLocalVersionsForPlz, getDistanceFromCompanyToDestinationPlz } from '@/lib/Api';
import { formatPrice } from '@/lib/utils';
import type { LocalPaperVersion } from '@/lib/types';

const MAX_LOCAL_DELIVERY_KM = 50;

function determineDeliveryMethod(distanceKm: number, localVersions: LocalPaperVersion[]) {
    if (localVersions.length === 0) {
        return 'Post';
    }
    if (distanceKm <= MAX_LOCAL_DELIVERY_KM) {
        return 'DeliveryMan';
    }
    return 'Post';
}

function calculateStrictPrice({
                                  subscriptionType,
                                  distanceKm,
                                  paymentInterval
                              }: {
    subscriptionType: 'Daily' | 'Weekend';
    distanceKm: number;
    paymentInterval: 'Monthly' | 'Annual';
}) {
    const basePrice = subscriptionType === 'Daily' ? 15.99 : 8.99;

    let distanceFactor = 1.0;
    if (distanceKm > 0 && distanceKm <= 50) distanceFactor = 1.1;
    else if (distanceKm > 50 && distanceKm <= 200) distanceFactor = 1.3;
    else if (distanceKm > 200) distanceFactor = 1.6;

    const monthlyPrice = basePrice * distanceFactor;
    let yearlyPrice = monthlyPrice * 12;

    if (paymentInterval === 'Annual') {
        yearlyPrice = yearlyPrice * 0.9;
    }

    return {
        monthlyPrice: Number(monthlyPrice.toFixed(2)),
        yearlyPrice: Number(yearlyPrice.toFixed(2))
    };
}

export default function ConfigurePage() {
    const router = useRouter();
    const { deliveryPlz, setCurrentSubscription, setSelectedVersion } = useAppContext();

    const [localVersions, setLocalVersions] = useState<LocalPaperVersion[]>([]);
    const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);

    const [subscriptionType, setSubscriptionType] = useState<'Daily' | 'Weekend'>('Daily');
    const [paymentType, setPaymentType] = useState<'Monthly' | 'Annual'>('Monthly');

    const [distance, setDistance] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const normalizeLocalVersions = (lv: unknown): LocalPaperVersion[] => {
        if (lv === null) return [];
        const top = Array.isArray(lv) ? lv : Object.values(lv as Record<string, unknown>);
        if (top.length === 0) return [];

        return top.map((item: any) => ({
            id: item.id,
            name: item.name,
            picture: item.picture
        }));
    };

    const deliveryMethod = useMemo(() => {
        return determineDeliveryMethod(distance, localVersions);
    }, [distance, localVersions]);

    const pricing = useMemo(() => {
        return calculateStrictPrice({
            subscriptionType,
            distanceKm: distance,
            paymentInterval: paymentType
        });
    }, [subscriptionType, distance, paymentType]);

    const pricingDaily = calculateStrictPrice({ subscriptionType: 'Daily', distanceKm: distance, paymentInterval: paymentType });
    const pricingWeekend = calculateStrictPrice({ subscriptionType: 'Weekend', distanceKm: distance, paymentInterval: paymentType });

    const monthlyCostIfMonthly = calculateStrictPrice({ subscriptionType, distanceKm: distance, paymentInterval: 'Monthly' }).monthlyPrice;
    const annualBase = monthlyCostIfMonthly * 12;
    const annualSavings = annualBase - pricing.yearlyPrice;
    const showAnnualSavings = paymentType === 'Annual' && annualSavings > 0.1;

    const selectedVersionName = localVersions.find((v) => v.id === selectedVersionId)?.name ?? 'Not selected';

    useEffect(() => {
        if (!deliveryPlz) {
            router.push('/subscription/address');
            return;
        }

        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                const distanceResult = await getDistanceFromCompanyToDestinationPlz(deliveryPlz);
                const distanceValue = distanceResult?.distanceCalcObj?.[0]?.distance ?? 0;

                if (distanceValue === 0 && deliveryPlz !== '72762') {
                    setError(`Postal code ${deliveryPlz} not found or distance calculation failed.`);
                    setLoading(false);
                    return;
                }
                setDistance(distanceValue);

                const versionsResult = await getLocalVersionsForPlz(deliveryPlz);
                let versions: LocalPaperVersion[] = [];

                if (versionsResult?.localversions) {
                    versions = normalizeLocalVersions(versionsResult.localversions);
                }

                if (versions.length === 0) {
                    setError(`No newspaper editions available for postal code ${deliveryPlz}.`);
                } else {
                    setLocalVersions(versions);
                    setSelectedVersionId(versions[0].id);
                }

            } catch (err) {
                setError('Technical error occurred connecting to the backend.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [deliveryPlz, router]);

    const handleContinue = () => {
        if (!selectedVersionId) {
            setError('Please select a newspaper edition');
            return;
        }

        const selectedVersionObj = localVersions.find((v) => v.id === selectedVersionId);
        if (selectedVersionObj) {
            setSelectedVersion(selectedVersionObj);
        }

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

        router.push('/subscription/register');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-xl font-semibold">Loading configuration...</p>
            </div>
        );
    }

    const isContinueDisabled = !selectedVersionId || !!error;

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-x-hidden antialiased">
            <header className="sticky top-0 z-50 border-b bg-surface-light/95 px-6 py-4 backdrop-blur">
                <div className="max-w-7xl mx-auto font-bold text-xl">The Daily Chronicle</div>
            </header>

            <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8">

                <div className="mb-10 max-w-4xl">
                    <p className="text-sm text-text-secondary">Step 2 of 4: Configure Subscription</p>
                    <div className="h-2 w-full rounded-full bg-border-light overflow-hidden mt-2">
                        <div className="h-full bg-primary w-1/2" />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                    <div className="flex-1 flex flex-col gap-10">

                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-black">Customize your subscription</h1>
                            <p className="text-text-secondary text-lg">Delivery to <strong>{deliveryPlz}</strong></p>
                        </div>

                        {error && (
                            <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
                                {error}
                                <button onClick={() => router.push('/subscription/address')} className="block mt-2 font-bold underline">
                                    Change Address
                                </button>
                            </div>
                        )}

                        <section className="space-y-4">
                            <h3 className="text-lg font-bold">1. Select Edition</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {localVersions.map((version) => (
                                    <button
                                        key={version.id}
                                        type="button"
                                        onClick={() => setSelectedVersionId(version.id)}
                                        className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                                            selectedVersionId === version.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border-light hover:border-primary/50'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">{version.name}</span>
                                            {selectedVersionId === version.id && (
                                                <span className="text-primary font-bold">Selected</span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-lg font-bold">2. Frequency</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setSubscriptionType('Daily')}
                                    className={`rounded-xl border-2 p-6 text-left transition-all ${
                                        subscriptionType === 'Daily' ? 'border-primary bg-primary/5' : 'border-border-light'
                                    }`}
                                >
                                    <h4 className="text-lg font-bold">Daily Edition</h4>
                                    <p className="text-sm text-text-secondary">Mon-Sun</p>
                                    <div className="mt-2 text-xl font-bold">{formatPrice(pricingDaily.monthlyPrice)} / mo</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSubscriptionType('Weekend')}
                                    className={`rounded-xl border-2 p-6 text-left transition-all ${
                                        subscriptionType === 'Weekend' ? 'border-primary bg-primary/5' : 'border-border-light'
                                    }`}
                                >
                                    <h4 className="text-lg font-bold">Weekend Only</h4>
                                    <p className="text-sm text-text-secondary">Sat-Sun</p>
                                    <div className="mt-2 text-xl font-bold">{formatPrice(pricingWeekend.monthlyPrice)} / mo</div>
                                </button>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-lg font-bold">3. Delivery Method</h3>
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-border-light">
                                <div className="flex items-center gap-4">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                        deliveryMethod === 'DeliveryMan' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        <span className="material-symbols-outlined">
                                            {deliveryMethod === 'DeliveryMan' ? 'pedal_bike' : 'local_post_office'}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold">
                                            {deliveryMethod === 'DeliveryMan' ? 'Morning Courier' : 'Postal Service'}
                                        </h4>
                                        <p className="text-sm text-text-secondary">
                                            {deliveryMethod === 'DeliveryMan'
                                                ? 'Your address is within our local distribution area.'
                                                : 'Your address is outside our local range. Delivered by mail.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-lg font-bold">4. Billing Cycle</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setPaymentType('Monthly')}
                                    className={`p-4 rounded-xl border-2 font-bold ${
                                        paymentType === 'Monthly' ? 'border-primary bg-primary/5' : 'border-border-light'
                                    }`}
                                >
                                    Monthly
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentType('Annual')}
                                    className={`relative p-4 rounded-xl border-2 font-bold ${
                                        paymentType === 'Annual' ? 'border-primary bg-primary/5' : 'border-border-light'
                                    }`}
                                >
                                    Annual
                                    {showAnnualSavings && (
                                        <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                                            Save {formatPrice(annualSavings)}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </section>

                    </div>

                    <div className="w-full lg:w-[380px] shrink-0">
                        <div className="sticky top-28 flex flex-col gap-6">
                            <div className="rounded-xl border border-border-light shadow-lg overflow-hidden bg-surface-light dark:bg-surface-dark">
                                <div className="bg-gray-50 dark:bg-white/5 p-6 border-b border-border-light">
                                    <h3 className="text-lg font-bold">Summary</h3>
                                </div>

                                <div className="p-6 space-y-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-text-secondary">Base Price ({subscriptionType})</span>
                                        <span className="font-medium">
                                            {formatPrice(subscriptionType === 'Daily' ? 15.99 : 8.99)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-text-secondary">
                                        <span>Distance ({distance.toFixed(1)} km)</span>
                                        <span>
                                            {distance <= 50 ? 'x 1.1' : distance <= 200 ? 'x 1.3' : 'x 1.6'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between border-b border-dashed pb-2">
                                        <span className="text-text-secondary">Distance Surcharge</span>
                                        <span className="font-medium text-red-600 dark:text-red-400">
                                            +{formatPrice(pricing.monthlyPrice - (subscriptionType === 'Daily' ? 15.99 : 8.99))}
                                        </span>
                                    </div>

                                    <div className="flex justify-between font-semibold">
                                        <span>Monthly Subtotal</span>
                                        <span>{formatPrice(pricing.monthlyPrice)}</span>
                                    </div>

                                    {paymentType === 'Annual' && (
                                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-900/30 mt-2">
                                            <div className="flex justify-between text-green-700 dark:text-green-400 font-bold">
                                                <span>Annual Discount (10%)</span>
                                                <span>- {formatPrice((pricing.monthlyPrice * 12) - pricing.yearlyPrice)}</span>
                                            </div>
                                            <div className="text-xs text-green-600 dark:text-green-500 mt-1">
                                                You save by paying yearly!
                                            </div>
                                        </div>
                                    )}

                                    <hr className="border-border-light" />

                                    <div className="flex justify-between items-end pt-2">
                                        <span className="text-lg font-bold">Total</span>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-primary">
                                                {paymentType === 'Annual'
                                                    ? formatPrice(pricing.yearlyPrice)
                                                    : formatPrice(pricing.monthlyPrice)}
                                            </div>
                                            <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">
                                                billed {paymentType.toLowerCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleContinue}
                                disabled={isContinueDisabled}
                                className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
                                    isContinueDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:opacity-90'
                                }`}
                            >
                                Continue to Registration
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/subscription/address')}
                                className="w-full py-3 text-sm font-bold text-text-secondary hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Back to Address
                            </button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
