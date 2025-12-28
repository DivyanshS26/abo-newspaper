// app/subscription/configure/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context/AppContext';
import { getLocalVersionsForPlz, getDistanceFromCompanyToDestinationPlz } from '@/lib/Api';
import { calculatePrice, formatPrice } from '@/lib/utils';
import type { LocalPaperVersion } from '@/lib/types';

export default function ConfigurePage() {
    const router = useRouter();
    const { deliveryPlz, setCurrentSubscription, setSelectedVersion } = useAppContext();

    // State (kept)
    const [localVersions, setLocalVersions] = useState<LocalPaperVersion[]>([]);
    const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
    const [subscriptionType, setSubscriptionType] = useState<'Daily' | 'Weekend'>('Daily');
    const [deliveryMethod, setDeliveryMethod] = useState<'Post' | 'Delivery man'>('Post');
    const [paymentType, setPaymentType] = useState<'Monthly' | 'Annual'>('Monthly');
    const [distance, setDistance] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Helper: normalize API `localversions` into LocalPaperVersion[]
    const normalizeLocalVersions = (lv: unknown): LocalPaperVersion[] => {
        if (lv == null) return [];

        const top = Array.isArray(lv) ? (lv as unknown[]) : Object.values(lv as Record<string, unknown>);
        if (top.length === 0) return [];

        const first = top[0];

        const isLocalPaperVersion = (item: unknown): item is LocalPaperVersion => {
            return typeof item === 'object' && item !== null && 'id' in (item as Record<string, unknown>);
        };

        if (isLocalPaperVersion(first)) {
            return top.filter(isLocalPaperVersion);
        }

        const candidate: unknown[] = Array.isArray(first)
            ? (first as unknown[])
            : first && typeof first === 'object'
                ? Object.values(first as Record<string, unknown>)
                : [];

        return candidate.filter(isLocalPaperVersion);
    };

    // Treat first backend result as "local edition for your area"
    const recommendedVersionId = localVersions?.[0]?.id ?? null;

    // Delivery Agent only for the local edition of the area; other editions require Post. [file:6]
    const COMPANYPLZ = "72762"
    const DELIVERY_MAN_MAX_KM = 50

    const canUseDeliveryMan = useMemo(() => {
        if (!deliveryPlz) return false
        if (deliveryPlz === COMPANYPLZ) return true
        return Number.isFinite(distance) && distance > 0 && distance <= DELIVERY_MAN_MAX_KM
    }, [deliveryPlz, distance])


    useEffect(() => {
        if (!canUseDeliveryMan && deliveryMethod === 'Delivery man') {
            setDeliveryMethod('Post');
        }
    }, [canUseDeliveryMan, deliveryMethod]);

    // Load on mount (kept)
    useEffect(() => {
        if (!deliveryPlz) {
            router.push('/subscription/address');
            return;
        }

        const load = async () => {
            try {
                setLoading(true);
                setError('');

                const versionsResult = await getLocalVersionsForPlz(deliveryPlz);

                let versions: LocalPaperVersion[] = [];
                let apiReturnedData = false;

                if (versionsResult?.localversions) {
                    apiReturnedData = true;
                    versions = normalizeLocalVersions(versionsResult.localversions);
                }

                if (apiReturnedData && versions.length === 0) {
                    setError(`No newspaper editions available for postal code ${deliveryPlz}. Please try a different address.`);
                    setLocalVersions([]);
                    setLoading(false);
                    return;
                }

                if (!apiReturnedData) {
                    versions = [
                        { id: 1, name: 'Stadtausgabe', picture: '' },
                        { id: 2, name: 'Sportversion', picture: '' },
                        { id: 3, name: 'Landkreisinfos', picture: '' },
                    ];
                    setError('Could not connect to server. Showing default editions.');
                }

                setLocalVersions(versions);

                if (versions.length > 0) {
                    setSelectedVersionId(versions[0].id);
                }

                const distanceResult = await getDistanceFromCompanyToDestinationPlz(deliveryPlz);
                const distanceValue = distanceResult.distanceCalcObj[0].distance;
                setDistance(distanceValue);

                const COMPANY_PLZ = '72762';
                if (distanceValue === 0 && deliveryPlz !== COMPANY_PLZ) {
                    setError(`Postal code ${deliveryPlz} not supported (distance lookup failed). Try a known German PLZ.`);
                    setLocalVersions([]);
                    return;
                }
            } catch {
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

        load();
    }, [deliveryPlz, router]);

    // Pricing (kept)
    const pricing = calculatePrice(distance, subscriptionType, paymentType, deliveryMethod);
    const pricingDaily = calculatePrice(distance, 'Daily', paymentType, deliveryMethod);
    const pricingWeekend = calculatePrice(distance, 'Weekend', paymentType, deliveryMethod);
    const annualBase = pricing.monthlyPrice * 12;
    const annualSavings = annualBase - pricing.yearlyPrice;
    const showAnnualSavings = paymentType === 'Annual' && Number.isFinite(annualSavings) && annualSavings > 0.0001;

    const selectedVersionName =
        localVersions.find(v => v.id === selectedVersionId)?.name ?? 'Not selected';

    const handleContinue = () => {
        if (!selectedVersionId) {
            setError('Please select a newspaper edition');
            return;
        }

        const version = localVersions.find(v => v.id === selectedVersionId);
        if (!version) {
            setError('Invalid edition selection');
            return;
        }

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

        router.push('/subscription/register');
    };

    // --- UI (template styling) ---
    if (loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-x-hidden antialiased">
                <div className="relative flex min-h-screen flex-col">
                    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border-light dark:border-border-dark bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur px-6 py-4 md:px-10 lg:px-40">
                        <div className="flex items-center gap-4">
                            <div className="text-primary">
                                <span className="material-symbols-outlined text-3xl">newsmode</span>
                            </div>
                            <h2 className="text-xl font-bold leading-tight tracking-tight text-text-main dark:text-white">
                                The Daily Chronicle
                            </h2>
                        </div>
                    </header>

                    <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 lg:px-40 py-8">
                        <div className="max-w-[960px]">
                            <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6 shadow-sm">
                                <p className="text-base font-semibold">Loading subscription options...</p>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    const isContinueDisabled = selectedVersionId === null || localVersions.length === 0;

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-x-hidden antialiased">
            <div className="relative flex min-h-screen flex-col">
                {/* Top Navigation (no avatar/profile button) */}
                <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border-light dark:border-border-dark bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur px-6 py-4 md:px-10 lg:px-40">
                    <div className="flex items-center gap-4">
                        <div className="text-primary">
                            <span className="material-symbols-outlined text-3xl">newsmode</span>
                        </div>
                        <h2 className="text-xl font-bold leading-tight tracking-tight text-text-main dark:text-white">
                            The Daily Chronicle
                        </h2>
                    </div>
                </header>

                <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 lg:px-40 py-8">
                    {/* Progress Bar */}
                    <div className="mb-10 max-w-[960px]">
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-end">
                                <p className="text-text-main dark:text-white text-base font-semibold leading-normal">
                                    Step 2 of 4
                                </p>
                                <p className="text-text-secondary text-sm">Configure Subscription</p>
                            </div>
                            <div className="h-2 w-full rounded-full bg-border-light dark:bg-border-dark overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                                    style={{ width: '50%' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Main Content Layout */}
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                        {/* Left Column */}
                        <div className="flex-1 flex flex-col gap-10">
                            {/* Page Heading */}
                            <div className="flex flex-col gap-2">
                                <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-text-main dark:text-white">
                                    Customize your subscription
                                </h1>
                                <p className="text-text-secondary text-lg">
                                    Choose the plan that fits your reading habits.
                                </p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="max-w-[960px] rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-4">
                                    <p className="text-sm font-medium text-red-700 dark:text-red-200">{error}</p>
                                </div>
                            )}

                            {/* Section 1: Local Edition (no search; options like you already do) */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-text-main dark:bg-white text-white dark:text-black text-xs font-bold">
                    1
                  </span>
                                    <h3 className="text-lg font-bold">
                                        Select Local Edition{' '}
                                        <span className="text-primary text-sm font-normal ml-1">(Required)</span>
                                    </h3>
                                </div>

                                <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm">
                                    {localVersions.length === 0 ? (
                                        <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-4 text-center">
                                            <p className="text-sm text-red-700 dark:text-red-200">
                                                No local editions available for your postal code.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => router.push('/subscription/address')}
                                                className="mt-4 inline-flex items-center justify-center rounded-lg border border-border-light dark:border-border-dark hover:bg-gray-200 dark:hover:bg-gray-800 px-6 py-3 text-sm font-bold text-text-secondary transition-all"
                                            >
                                                <span className="material-symbols-outlined mr-2 text-sm">arrow_back</span>
                                                Change address
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3">
                                            {localVersions.map((version, idx) => {
                                                const active = selectedVersionId === version.id;
                                                const isRecommended = recommendedVersionId === version.id;

                                                return (
                                                    <button
                                                        key={`version-${version.id ?? idx}`}
                                                        type="button"
                                                        onClick={() => setSelectedVersionId(version.id)}
                                                        className={[
                                                            'w-full text-left rounded-xl border-2 p-4 transition-all',
                                                            'bg-surface-light dark:bg-surface-dark',
                                                            active
                                                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                                : 'border-border-light dark:border-border-dark hover:border-primary/50',
                                                        ].join(' ')}
                                                    >
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex flex-col">
                                                                <h4 className="text-base font-bold text-text-main dark:text-white">
                                                                    {version.name}
                                                                </h4>
                                                                <p className="text-sm text-text-secondary">
                                                                    {isRecommended
                                                                        ? 'Local edition for your area (delivery agent possible).'
                                                                        : 'Non-local edition (sent by post).'}
                                                                </p>
                                                            </div>
                                                            {active && (
                                                                <span className="material-symbols-outlined text-primary text-[20px]">
                                  check_circle
                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Section 2: Frequency */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-text-main dark:bg-white text-white dark:text-black text-xs font-bold">
                    2
                  </span>
                                    <h3 className="text-lg font-bold">Subscription Type</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Daily */}
                                    <button
                                        type="button"
                                        onClick={() => setSubscriptionType('Daily')}
                                        className={[
                                            'h-full text-left rounded-xl border-2 p-6 transition-all',
                                            'bg-surface-light dark:bg-surface-dark',
                                            subscriptionType === 'Daily'
                                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                : 'border-border-light dark:border-border-dark hover:border-primary/50',
                                        ].join(' ')}
                                    >
                                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <span className="material-symbols-outlined">calendar_view_day</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-text-main dark:text-white">Daily Edition</h4>
                                        <p className="mt-1 text-sm text-text-secondary">
                                            Full access Monday through Sunday.
                                        </p>

                                        <div className="mt-4 flex justify-between items-center">
                      <span className="text-lg font-bold text-text-main dark:text-white">
                        {formatPrice(pricingDaily.monthlyPrice)}
                          <span className="text-sm font-normal text-text-secondary">/mo</span>
                      </span>
                                            <span
                                                className={[
                                                    'material-symbols-outlined text-primary transition-opacity',
                                                    subscriptionType === 'Daily' ? 'opacity-100' : 'opacity-0',
                                                ].join(' ')}
                                            >
                        check_circle
                      </span>
                                        </div>
                                    </button>

                                    {/* Weekend */}
                                    <button
                                        type="button"
                                        onClick={() => setSubscriptionType('Weekend')}
                                        className={[
                                            'h-full text-left rounded-xl border-2 p-6 transition-all',
                                            'bg-surface-light dark:bg-surface-dark',
                                            subscriptionType === 'Weekend'
                                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                : 'border-border-light dark:border-border-dark hover:border-primary/50',
                                        ].join(' ')}
                                    >
                                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                            <span className="material-symbols-outlined">weekend</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-text-main dark:text-white">Weekend Only</h4>
                                        <p className="mt-1 text-sm text-text-secondary">
                                            Saturday & Sunday delivery.
                                        </p>

                                        <div className="mt-4 flex justify-between items-center">
                      <span className="text-lg font-bold text-text-main dark:text-white">
                        {formatPrice(pricingWeekend.monthlyPrice)}
                          <span className="text-sm font-normal text-text-secondary">/mo</span>
                      </span>
                                            <span
                                                className={[
                                                    'material-symbols-outlined text-primary transition-opacity',
                                                    subscriptionType === 'Weekend' ? 'opacity-100' : 'opacity-0',
                                                ].join(' ')}
                                            >
                        check_circle
                      </span>
                                        </div>
                                    </button>
                                </div>
                            </section>

                            {/* Section 3: Delivery Method */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-text-main dark:bg-white text-white dark:text-black text-xs font-bold">
                    3
                  </span>
                                    <h3 className="text-lg font-bold">Delivery Method</h3>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {/* Agent */}
                                    <button
                                        type="button"
                                        disabled={!canUseDeliveryMan}
                                        onClick={() => {
                                            if (canUseDeliveryMan) setDeliveryMethod('Delivery man');
                                        }}
                                        className={[
                                            'flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl p-4 border-2 transition-all text-left',
                                            'bg-surface-light dark:bg-surface-dark',
                                            canUseDeliveryMan
                                                ? deliveryMethod === 'Delivery man'
                                                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                    : 'border-border-light dark:border-border-dark hover:border-primary/50'
                                                : 'border-border-light dark:border-border-dark opacity-60 cursor-not-allowed',
                                        ].join(' ')}
                                        title={
                                            canUseDeliveryMan
                                                ? ''
                                                : 'Delivery agents can only deliver the local edition for your area; other editions are sent by post.'
                                        }
                                    >
                                        <div
                                            className={[
                                                'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                                                canUseDeliveryMan ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-400',
                                            ].join(' ')}
                                        >
                                            <span className="material-symbols-outlined">pedal_bike</span>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-base font-bold text-text-main dark:text-white">Morning Courier</h4>
                                                {!canUseDeliveryMan && (
                                                    <span className="rounded bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Unavailable
                          </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-text-secondary">
                                                Hand delivered to your doorstep.
                                            </p>
                                        </div>

                                        <div className="hidden sm:block">
                      <span
                          className={[
                              'material-symbols-outlined text-primary transition-opacity',
                              deliveryMethod === 'Delivery man' ? 'opacity-100' : 'opacity-0',
                          ].join(' ')}
                      >
                        check_circle
                      </span>
                                        </div>
                                    </button>

                                    {/* Postal */}
                                    <button
                                        type="button"
                                        onClick={() => setDeliveryMethod('Post')}
                                        className={[
                                            'flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl p-4 border-2 transition-all text-left',
                                            'bg-surface-light dark:bg-surface-dark',
                                            deliveryMethod === 'Post'
                                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                : 'border-border-light dark:border-border-dark hover:border-primary/50',
                                        ].join(' ')}
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <span className="material-symbols-outlined">local_post_office</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-base font-bold text-text-main dark:text-white">Postal Service</h4>
                                            <p className="text-sm text-text-secondary">
                                                Required for non-local editions.
                                            </p>
                                        </div>
                                        <div className="hidden sm:block">
                      <span
                          className={[
                              'material-symbols-outlined text-primary transition-opacity',
                              deliveryMethod === 'Post' ? 'opacity-100' : 'opacity-0',
                          ].join(' ')}
                      >
                        check_circle
                      </span>
                                        </div>
                                    </button>
                                </div>

                                {!canUseDeliveryMan && (
                                    <p className="text-sm text-text-secondary">
                                        Delivery agents only deliver the edition belonging to their distribution area; other editions are sent by post.
                                    </p>
                                )}
                            </section>

                            {/* Section 4: Payment Interval */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-text-main dark:bg-white text-white dark:text-black text-xs font-bold">
                    4
                  </span>
                                    <h3 className="text-lg font-bold">Billing Cycle</h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Monthly */}
                                    <button
                                        type="button"
                                        onClick={() => setPaymentType('Monthly')}
                                        className={[
                                            'flex items-center justify-center gap-2 rounded-xl border-2 p-4 text-center transition-all',
                                            'bg-surface-light dark:bg-surface-dark',
                                            paymentType === 'Monthly'
                                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                : 'border-border-light dark:border-border-dark hover:border-primary/50',
                                        ].join(' ')}
                                    >
                                        <span className="font-bold text-text-main dark:text-white">Monthly</span>
                                    </button>

                                    {/* Annual */}
                                    <button
                                        type="button"
                                        onClick={() => setPaymentType('Annual')}
                                        className={[
                                            'relative flex items-center justify-center gap-2 rounded-xl border-2 p-4 text-center transition-all',
                                            'bg-surface-light dark:bg-surface-dark',
                                            paymentType === 'Annual'
                                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                : 'border-border-light dark:border-border-dark hover:border-primary/50',
                                        ].join(' ')}
                                    >
                                        <span className="font-bold text-text-main dark:text-white">Annual</span>
                                        {showAnnualSavings && (
                                            <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                        Save {formatPrice(annualSavings)}
                      </span>
                                        )}
                                    </button>
                                </div>
                            </section>
                        </div>

                        {/* Right Column: Sticky Summary */}
                        <div className="w-full lg:w-[380px] shrink-0">
                            <div className="sticky top-28 flex flex-col gap-6">
                                <div className="overflow-hidden rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-lg">
                                    <div className="border-b border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-white/5 p-6">
                                        <h3 className="text-lg font-bold text-text-main dark:text-white">Summary</h3>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        <ul className="space-y-4">
                                            <li className="flex items-start justify-between gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-text-secondary">Edition</span>
                                                    <span className="text-base font-semibold text-text-main dark:text-white">
                            {selectedVersionName}
                          </span>
                                                </div>
                                                {selectedVersionId ? (
                                                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-red-400 text-[20px]">error</span>
                                                )}
                                            </li>

                                            <li className="flex items-start justify-between gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-text-secondary">Plan</span>
                                                    <span className="text-base font-semibold text-text-main dark:text-white">
                            {subscriptionType === 'Daily' ? 'Daily Edition' : 'Weekend Only'}
                          </span>
                                                </div>
                                                <span className="text-sm font-medium text-text-main dark:text-white">
                          {formatPrice(pricing.monthlyPrice)}/mo
                        </span>
                                            </li>

                                            <li className="flex items-start justify-between gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-text-secondary">Delivery</span>
                                                    <span className="text-base font-semibold text-text-main dark:text-white">
                            {deliveryMethod === 'Post' ? 'Postal Service' : 'Morning Courier'}
                          </span>
                                                </div>
                                                <span className="text-sm font-medium text-text-main dark:text-white">
                          {distance.toFixed(1)} km
                        </span>
                                            </li>

                                            {paymentType === 'Annual' && showAnnualSavings && (
                                                <li className="flex items-start justify-between gap-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-text-secondary">Discount</span>
                                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit">
                              Annual
                            </span>
                                                    </div>
                                                    <span className="text-sm font-medium text-primary">
                            -{formatPrice(annualSavings)}
                          </span>
                                                </li>
                                            )}
                                        </ul>

                                        <hr className="border-border-light dark:border-border-dark border-dashed" />

                                        <div className="flex items-end justify-between">
                                            <span className="text-lg font-medium text-text-main dark:text-white">Total</span>
                                            <div className="flex flex-col items-end">
                        <span className="text-3xl font-black text-text-main dark:text-white">
                          {paymentType === 'Annual'
                              ? formatPrice(pricing.yearlyPrice)
                              : formatPrice(pricing.monthlyPrice)}
                        </span>
                                                <span className="text-xs text-text-secondary">
                          {paymentType === 'Annual' ? 'billed annually' : 'billed monthly'}
                        </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="bg-gray-50 dark:bg-white/5 p-6 flex flex-col gap-3">
                                        <button
                                            type="button"
                                            onClick={handleContinue}
                                            disabled={isContinueDisabled}
                                            className={[
                                                'flex w-full items-center justify-center rounded-lg px-6 py-4 text-base font-bold transition-all',
                                                isContinueDisabled
                                                    ? 'bg-border-light dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                                    : 'bg-primary text-white hover:opacity-95',
                                            ].join(' ')}
                                        >
                                            Continue to registration
                                        </button>

                                        {isContinueDisabled && (
                                            <p className="text-center text-xs text-text-secondary">
                                                Please select a local edition to continue.
                                            </p>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => router.push('/subscription/address')}
                                            className="flex w-full items-center justify-center rounded-lg border border-transparent hover:bg-gray-200 dark:hover:bg-gray-800 px-6 py-3 text-sm font-bold text-text-secondary transition-all mt-2"
                                        >
                                            <span className="material-symbols-outlined mr-2 text-sm">arrow_back</span>
                                            Back
                                        </button>
                                    </div>
                                </div>

                                {/* Trust badge (kept generic, no Stripe claim) */}
                                <div className="flex items-center gap-3 px-4 py-2 opacity-70">
                                    <span className="material-symbols-outlined text-green-600">lock</span>
                                    <span className="text-xs text-text-secondary">
                    Secure checkout. Your information is encrypted.
                  </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="mt-20 border-t border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark py-10">
                    <div className="max-w-[1280px] mx-auto px-6 text-center text-text-secondary text-sm">
                        © {new Date().getFullYear()} The Daily Chronicle. All rights reserved.
                    </div>
                </footer>
            </div>
        </div>
    );
}
