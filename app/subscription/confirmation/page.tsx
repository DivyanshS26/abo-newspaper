// app/subscription/confirmation/page.tsx
'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { useAppContext } from '@/lib/context/AppContext';
import { formatPrice } from '@/lib/utils';

export default function ConfirmationPage() {
    const router = useRouter();
    const { currentUser, currentSubscription, selectedVersion, deliveryPlz } = useAppContext();

    // Guard: if user refreshes and context is empty, send them home.
    const isMissingData = !currentUser || !currentSubscription || !selectedVersion || !deliveryPlz;

    const orderSummary = useMemo(() => {
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
            deliveryPlz,
        };
    }, [isMissingData, currentUser, currentSubscription, selectedVersion, deliveryPlz]);

    if (isMissingData) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4 bg-paper">
                <div className="max-w-xl w-full">
                    <Card title="Session expired">
                        <p className="font-sans text-sm text-gray-700 mb-6">
                            Order details are no longer available (page refresh clears the mock session).
                        </p>
                        <Button variant="primary" onClick={() => router.push('/')} fullWidth>
                            Back to homepage
                        </Button>
                    </Card>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-4 py-12 bg-paper">
            <div className="max-w-2xl w-full">
                <div className="newspaper-header mb-8">
                    <h1 className="text-4xl font-bold uppercase tracking-wider">Thank you</h1>
                    <p className="text-sm font-sans text-gray-700 mt-2">
                        Your subscription order has been received.
                    </p>
                </div>

                <Card title="Order confirmation">
                    <div className="font-sans text-sm text-gray-800 space-y-4">
                        <div className="border-2 border-border p-4 bg-hover">
                            <p className="font-bold mb-1">Customer</p>
                            <p>{orderSummary?.name}</p>
                            <p className="text-gray-700">{orderSummary?.email}</p>
                        </div>

                        <div className="border-2 border-border p-4">
                            <p className="font-bold mb-2">Subscription summary</p>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-600">Edition</p>
                                    <p className="font-bold">{orderSummary?.editionName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Delivery PLZ</p>
                                    <p className="font-bold">{orderSummary?.deliveryPlz}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Subscription type</p>
                                    <p className="font-bold">{orderSummary?.subscriptionType}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Delivery method</p>
                                    <p className="font-bold">{orderSummary?.deliveryMethod}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Payment interval</p>
                                    <p className="font-bold">{orderSummary?.paymentInterval}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Payment type</p>
                                    <p className="font-bold">{orderSummary?.paymentType}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-2 border-gold p-4 bg-gold bg-opacity-20">
                            <p className="font-bold mb-1">Price</p>
                            <p className="text-2xl font-bold text-ink">
                                {formatPrice(orderSummary?.monthly ?? 0)} / month
                            </p>
                            {orderSummary?.isAnnual && (
                                <p className="text-xs text-gray-700 mt-1">
                                    Annual total: {formatPrice(orderSummary?.yearly ?? 0)}
                                </p>
                            )}
                        </div>

                        <div className="ornamental-divider" />

                        {/* Spec: final "Thank you" page includes a link back to homepage */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <a href="https://www.tagesschau.de" target="_blank" rel="noreferrer" className="block w-full">
                                <Button variant="primary" fullWidth>
                                    Back to homepage
                                </Button>
                            </a>

                            <Button
                                variant="outline"
                                onClick={() => router.push('/subscription/address')}
                                fullWidth
                            >
                                Start a new order
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </main>
    );
}
