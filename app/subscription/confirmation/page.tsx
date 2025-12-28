
'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context/AppContext';
import { formatPrice } from '@/lib/utils';

export default function ConfirmationPage() {
    const router = useRouter();
    const { currentUser, currentSubscription, selectedVersion, deliveryPlz } = useAppContext();

    const isMissingData = !currentUser || !currentSubscription || !selectedVersion || !deliveryPlz;

    const summary = useMemo(() => {
        if (isMissingData) return null;

        const monthly = Number(currentSubscription?.calculatedprice ?? 0);
        const yearly = Number(currentSubscription?.calculatedyearprice ?? 0);
        const isAnnual = currentSubscription?.payment === 'Annual';

        return {
            name: `${currentUser.firstname} ${currentUser.lastname}`,
            email: currentUser.email,
            editionName: selectedVersion.name,
            subscriptionType: currentSubscription.subscriptiontype,
            deliveryMethod: currentSubscription.deliverymethod,
            paymentInterval: currentSubscription.payment,
            paymentType: currentSubscription.paymenttype,
            monthly,
            yearly,
            isAnnual,
            deliveryAddress: currentUser.deliveryAddress,
            deliveryPlz,
        };
    }, [isMissingData, currentUser, currentSubscription, selectedVersion, deliveryPlz]);

    const nextBillingDateLabel = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }, []);

    if (isMissingData) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-[#181411] dark:text-gray-100 flex flex-col">
                <header className="w-full bg-white dark:bg-[#2d231b] border-b border-[#e6e0db] dark:border-[#3e342e]">
                    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="h-16 flex items-center">
                            <div className="flex items-center gap-3 text-[#181411] dark:text-white">
                                <div className="size-8 flex items-center justify-center bg-primary/10 rounded-lg text-primary">
                                    <span className="material-symbols-outlined text-2xl">newspaper</span>
                                </div>
                                <h2 className="text-xl font-bold leading-tight tracking-tight">The Daily Chronicle</h2>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-grow flex items-center justify-center px-4 sm:px-6 py-12">
                    <div className="w-full max-w-[640px] bg-white dark:bg-[#2d231b] rounded-2xl shadow-sm border border-[#e6e0db] dark:border-[#3e342e] overflow-hidden">
                        <div className="bg-[#fcfbf9] dark:bg-[#28201a] px-6 py-4 border-b border-[#e6e0db] dark:border-[#3e342e]">
                            <h1 className="text-base font-bold text-[#181411] dark:text-white">Session expired</h1>
                        </div>
                        <div className="p-6 md:p-8">
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                                Order details are no longer available (page refresh clears the mock session).
                            </p>
                            <button
                                onClick={() => router.push('/')}
                                className="w-full rounded-xl h-12 px-6 bg-primary text-white text-base font-bold shadow-md hover:bg-[#d55e0d] hover:shadow-lg transition-all duration-200"
                            >
                                Back to homepage
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#181411] dark:text-gray-100 flex flex-col min-h-screen overflow-x-hidden">
            <header className="w-full bg-white dark:bg-[#2d231b] border-b border-[#e6e0db] dark:border-[#3e342e]">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-16 flex items-center">
                        <div className="flex items-center gap-3 text-[#181411] dark:text-white">
                            <div className="size-8 flex items-center justify-center bg-primary/10 rounded-lg text-primary">
                                <span className="material-symbols-outlined text-2xl">newspaper</span>
                            </div>
                            <h2 className="text-xl font-bold leading-tight tracking-tight">The Daily Chronicle</h2>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 sm:px-6">
                <div className="flex flex-col items-center text-center gap-6 mb-10">
                    <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-5xl text-primary">check_circle</span>
                    </div>

                    <div className="max-w-lg space-y-3">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#181411] dark:text-white">
                            Thank you!
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 font-normal leading-relaxed">
                            Your subscription order has been received. We have sent a confirmation email with your
                            order details to{' '}
                            <span className="font-medium text-[#181411] dark:text-white">{summary?.email}</span>.
                        </p>
                    </div>
                </div>

                <div className="w-full max-w-[640px] bg-white dark:bg-[#2d231b] rounded-2xl shadow-sm border border-[#e6e0db] dark:border-[#3e342e] overflow-hidden">
                    <div className="bg-[#fcfbf9] dark:bg-[#28201a] px-6 py-4 border-b border-[#e6e0db] dark:border-[#3e342e] flex justify-between items-center">
                        <h3 className="text-base font-bold text-[#181411] dark:text-white">Order Summary</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
              #{String(Date.now()).slice(-5)}
            </span>
                    </div>

                    <div className="p-6 md:p-8">
                        {/* Product Row */}
                        <div className="flex flex-col sm:flex-row gap-6 mb-8 items-start">
                            <div className="w-full sm:w-32 aspect-[4/3] rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 shadow-inner flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-5xl">newspaper</span>
                            </div>

                            <div className="flex-1 space-y-1">
                                <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-1">
                                    {summary?.subscriptionType}
                                </p>
                                <h4 className="text-xl font-bold text-[#181411] dark:text-white">
                                    {summary?.editionName}
                                </h4>
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed max-w-sm pt-1">
                                    Delivery method: {summary?.deliveryMethod}. Payment: {summary?.paymentInterval} (
                                    {summary?.paymentType}).
                                </p>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 border-t border-[#e6e0db] dark:border-[#3e342e] pt-6">
                            <div className="flex flex-col gap-1">
                                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide font-medium">
                                    Billing Frequency
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-400 text-lg">calendar_month</span>
                                    <p className="text-[#181411] dark:text-white font-medium">
                                        {summary?.paymentInterval}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide font-medium">
                                    Next Billing Date
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-400 text-lg">event</span>
                                    <p className="text-[#181411] dark:text-white font-medium">{nextBillingDateLabel}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 sm:col-span-2">
                                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide font-medium">
                                    Shipping Address
                                </p>
                                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-gray-400 text-lg mt-0.5">
                    location_on
                  </span>
                                    <p className="text-[#181411] dark:text-white font-medium leading-normal">
                                        {summary?.name}
                                        <br />
                                        {summary?.deliveryAddress.street1}
                                        {summary?.deliveryAddress.street2 ? (
                                            <>
                                                <br />
                                                {summary?.deliveryAddress.street2}
                                            </>
                                        ) : null}
                                        <br />
                                        {summary?.deliveryAddress.plz} {summary?.deliveryAddress.city}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="mt-8 pt-6 border-t border-dashed border-[#e6e0db] dark:border-[#3e342e] flex items-center justify-between">
                            <p className="text-[#181411] dark:text-white font-bold text-lg">Total</p>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-[#181411] dark:text-white">
                                    {formatPrice(summary?.isAnnual ? summary?.yearly ?? 0 : summary?.monthly ?? 0)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    including VAT {summary?.isAnnual ? '/ year' : '/ month'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full max-w-[480px] justify-center">
                    <a
                        className="flex-1 min-w-[200px] flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary text-white text-base font-bold shadow-md hover:bg-[#d55e0d] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                        href="https://www.tagesschau.de"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span>Back to homepage</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </a>

                    <button
                        onClick={() => router.push('/subscription/address')}
                        className="flex-1 min-w-[200px] flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-transparent border-2 border-[#e6e0db] dark:border-[#3e342e] text-[#181411] dark:text-white text-base font-bold hover:bg-[#f4f2f0] dark:hover:bg-[#3e342e] transition-all duration-200"
                    >
                        Start a new order
                    </button>
                </div>
            </main>
        </div>
    );
}
