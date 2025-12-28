// app/subscription/checkout/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context/AppContext';
import { saveAboForCustomer } from '@/lib/Api';
import { formatPrice } from '@/lib/utils';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import type { Customer, Subscription } from '@/lib/types';

export default function CheckoutPage() {
    const router = useRouter();
    const { currentUser, currentSubscription, deliveryPlz, selectedVersion } = useAppContext();

    const [paymentMethod, setPaymentMethod] = useState<'Direct debit' | 'Invoice'>('Direct debit');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!currentUser || !currentSubscription || !deliveryPlz || !selectedVersion) {
        // Missing data - redirect back
        router.push('/subscription/address');
        return null;
    }

    const handleConfirmOrder = async () => {
        setLoading(true);
        setError('');

        try {
            // Prepare subscription for save (add dates, customer ID, privacy)
            const subscriptionToSave: Subscription = {
                ...currentSubscription as Subscription,
                id: 0, // Backend auto-generates
                cid: currentUser.id,
                created: new Date().toISOString().split('T')[0],
                startabodate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next week
                endabodate: '2099-12-31', // Long term
                dataprivacyaccepted: true,
                paymenttype: paymentMethod,
                localpaperversions: selectedVersion.id,
            } as Subscription;

            console.log('Saving subscription:', subscriptionToSave);

            const result = await saveAboForCustomer(subscriptionToSave);
            console.log('Save result:', result);

            if (result.success[0]) {
                router.push('/subscription/confirmation');
            } else {
                setError('Order confirmation failed. Please try again.');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setError('Payment processing error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const monthlyPrice = (currentSubscription.calculatedprice || 0);
    const yearlyPrice = (currentSubscription.calculatedyearprice || 0);
    const isAnnual = currentSubscription.payment === 'Annual';

    return (
        <main className="min-h-screen p-4 py-8 bg-paper">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">
                        Order Review & Payment
                    </h1>
                    <p className="text-sm font-sans text-gray-700">
                        Step 4 of 4 • Secure checkout
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <div>
                        <Card title="Order Summary">
                            <div className="space-y-4 font-sans">
                                <div>
                                    <p className="text-sm text-gray-600">Customer</p>
                                    <p className="font-bold">{currentUser.firstname} {currentUser.lastname}</p>
                                    <p className="text-sm">{currentUser.email}</p>
                                </div>

                                <div className="border-t-2 border-border pt-4">
                                    <p className="text-sm text-gray-600">Subscription</p>
                                    <p className="font-bold">{selectedVersion.name}</p>
                                    <p className="text-sm text-gray-600">
                                        {currentSubscription.subscriptiontype} • {currentSubscription.deliverymethod} • PLZ {deliveryPlz}
                                    </p>
                                    <p className="text-sm text-gray-600">{currentSubscription.payment} • {currentSubscription.paymenttype}</p>
                                </div>

                                <div className="bg-gold bg-opacity-20 p-4 border-2 border-gold rounded-lg">
                                    <p className="text-lg font-bold mb-1">
                                        {formatPrice(monthlyPrice)} / month
                                    </p>
                                    {isAnnual && (
                                        <p className="text-sm text-green-700">
                                            Annual total: {formatPrice(yearlyPrice)} (save 10%)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Addresses & Payment */}
                    <div className="space-y-6">
                        {/* Delivery Address */}
                        <Card title="Delivery Address">
                            <div className="font-sans space-y-1 text-sm">
                                <p>{currentUser.deliveryAddress.street1}</p>
                                {currentUser.deliveryAddress.street2 && <p>{currentUser.deliveryAddress.street2}</p>}
                                <p>{currentUser.deliveryAddress.plz} {currentUser.deliveryAddress.city}</p>
                            </div>
                        </Card>

                        {/* Billing Address */}
                        <Card title="Billing Address">
                            <div className="font-sans space-y-1 text-sm">
                                <p>{currentUser.billingAddress.street1}</p>
                                {currentUser.billingAddress.street2 && <p>{currentUser.billingAddress.street2}</p>}
                                <p>{currentUser.billingAddress.plz} {currentUser.billingAddress.city}</p>
                            </div>
                        </Card>

                        {/* Payment Method (MVP: Direct debit / Invoice) */}
                        <Card title="Payment Method">
                            <div className="space-y-3">
                                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                    paymentMethod === 'Direct debit' ? 'border-gold bg-hover' : 'border-border hover:border-gold'
                                }`}
                                     onClick={() => setPaymentMethod('Direct debit')}
                                >
                                    <div className="flex items-center">
                                        <input type="radio" id="debit" checked={paymentMethod === 'Direct debit'} onChange={() => {}} className="mr-3 w-5 h-5" />
                                        <label htmlFor="debit" className="font-bold cursor-pointer">Direct Debit</label>
                                    </div>
                                    <p className="text-xs font-sans text-gray-600 mt-1">Automatic monthly/annual from bank account</p>
                                </div>

                                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                    paymentMethod === 'Invoice' ? 'border-gold bg-hover' : 'border-border hover:border-gold'
                                }`}
                                     onClick={() => setPaymentMethod('Invoice')}
                                >
                                    <div className="flex items-center">
                                        <input type="radio" id="invoice" checked={paymentMethod === 'Invoice'} onChange={() => {}} className="mr-3 w-5 h-5" />
                                        <label htmlFor="invoice" className="font-bold cursor-pointer">Invoice</label>
                                    </div>
                                    <p className="text-xs font-sans text-gray-600 mt-1">Pay by bank transfer (monthly)</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {error && (
                    <div className="max-w-4xl mx-auto mt-6">
                        <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 font-sans text-sm">
                            {error}
                        </div>
                    </div>
                )}

                {/* Confirm Button */}
                <div className="mt-12 max-w-4xl mx-auto text-center">
                    <Button
                        variant="primary"
                        onClick={handleConfirmOrder}
                        disabled={loading}
                        className="text-xl py-4 px-12"
                    >
                        {loading ? 'Processing...' : `Confirm Order - ${formatPrice(monthlyPrice)}`}
                    </Button>
                    <p className="text-xs mt-4 font-sans text-gray-600">
                        Secure checkout • No charge until first delivery
                    </p>
                </div>

                <div className="mt-8 text-center">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/subscription/register')}
                        disabled={loading}
                    >
                        ← Back to Registration
                    </Button>
                </div>
            </div>
        </main>
    );
}
