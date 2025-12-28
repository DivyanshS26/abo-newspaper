
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context/AppContext';
import { saveAboForCustomer } from '@/lib/Api';
import { formatPrice } from '@/lib/utils';
import type { Subscription } from '@/lib/types';

type PaymentMethod = 'Direct debit' | 'Invoice';

export default function CheckoutPage() {
    const router = useRouter();
    const { currentUser, currentSubscription, deliveryPlz, selectedVersion } = useAppContext();

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Direct debit');
    const [iban, setIban] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!currentUser || !currentSubscription || !deliveryPlz || !selectedVersion) {
        router.push('/subscription/address');
        return null;
    }

    const isAnnual = currentSubscription.payment === 'Annual';
    const monthlyPrice = currentSubscription.calculatedprice || 0;
    const yearlyPrice = currentSubscription.calculatedyearprice || 0;

    // Simple UI-only validation (doesn't change backend functionality).
    const canSubmit = useMemo(() => {
        if (loading) return false;
        if (!acceptTerms) return false;
        if (paymentMethod === 'Direct debit' && !iban.trim()) return false;
        return true;
    }, [acceptTerms, iban, loading, paymentMethod]);

    const handleConfirmOrder = async () => {
        setError('');

        if (!acceptTerms) {
            setError('Please accept the Terms & Conditions and Privacy Policy.');
            return;
        }
        if (paymentMethod === 'Direct debit' && !iban.trim()) {
            setError('Please enter your IBAN for Direct Debit.');
            return;
        }

        setLoading(true);

        try {
            const subscriptionToSave: Subscription = {
                ...(currentSubscription as Subscription),
                id: 0,
                cid: currentUser.id,
                created: new Date().toISOString().split('T')[0],
                startabodate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                endabodate: '2099-12-31',
                dataprivacyaccepted: true,
                paymenttype: paymentMethod,
                localpaperversions: selectedVersion.id,
            } as Subscription;

            const result = await saveAboForCustomer(subscriptionToSave);

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

    const delivery = currentUser.deliveryAddress;
    const billing = currentUser.billingAddress;

    const billingSameAsDelivery =
        billing.street1 === delivery.street1 &&
        (billing.street2 || '') === (delivery.street2 || '') &&
        billing.city === delivery.city &&
        billing.plz === delivery.plz;

    return (
        <div className="relative flex min-h-screen flex-col bg-background-light dark:bg-background-dark text-[#181411] dark:text-gray-100 font-display overflow-x-hidden">
            {/* Header: ONLY brand */}
            <header className="sticky top-0 z-50 flex items-center border-b border-solid border-[#f4f2f0] dark:border-[#3a2e26] bg-white/95 dark:bg-[#1e1611]/95 backdrop-blur px-6 md:px-10 lg:px-40 py-3 shadow-sm">
                <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => router.push('/')}
                    role="button"
                    tabIndex={0}
                >
                    <div className="size-8 text-primary">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path
                                clipRule="evenodd"
                                d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                                fill="currentColor"
                                fillRule="evenodd"
                            />
                        </svg>
                    </div>
                    <h2 className="text-[#181411] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                        The Daily Chronicle
                    </h2>
                </div>
            </header>

            <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Bar */}
                <div className="mb-8 max-w-[960px] mx-auto">
                    <div className="flex justify-between items-end mb-2">
                        <p className="text-sm font-semibold text-primary uppercase tracking-wide">Checkout</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Step 4 of 4</p>
                    </div>
                    <div className="h-2 w-full bg-[#e6e0db] dark:bg-[#3a2e26] rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '100%' }} />
                    </div>
                </div>

                {/* Page Heading */}
                <div className="mb-10 max-w-[960px] mx-auto text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-[#181411] dark:text-white mb-2">
                        Finalize your subscription
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Please review your details and select a payment method.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1100px] mx-auto">
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Your Details */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-[#181411] dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">location_on</span>
                                    Your Details
                                </h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Delivery */}
                                <div className="group relative bg-white dark:bg-[#1e1611] border border-[#e6e0db] dark:border-[#3a2e26] rounded-lg p-5 transition-all hover:border-primary/50 hover:shadow-md">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Delivery Address
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => router.push('/subscription/register')}
                                            className="text-primary hover:text-primary/80 text-sm font-bold flex items-center gap-1 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                                        </button>
                                    </div>

                                    <div className="text-[#181411] dark:text-gray-200">
                                        <p className="font-bold text-lg mb-1">
                                            {currentUser.firstname} {currentUser.lastname}
                                        </p>
                                        <p className="leading-relaxed">
                                            {delivery.street1}
                                            {delivery.street2 ? <><br />{delivery.street2}</> : null}
                                            <br />
                                            {delivery.plz} {delivery.city}
                                        </p>
                                    </div>
                                </div>

                                {/* Billing */}
                                <div className="group relative bg-white dark:bg-[#1e1611] border border-[#e6e0db] dark:border-[#3a2e26] rounded-lg p-5 transition-all hover:border-primary/50 hover:shadow-md">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Billing Address
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => router.push('/subscription/register')}
                                            className="text-primary hover:text-primary/80 text-sm font-bold flex items-center gap-1 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                                        </button>
                                    </div>

                                    <div className="text-[#181411] dark:text-gray-200">
                                        {billingSameAsDelivery && (
                                            <p className="font-medium text-gray-500 dark:text-gray-400 italic mb-1">
                                                Same as delivery address
                                            </p>
                                        )}
                                        <p className="font-bold text-lg">
                                            {currentUser.firstname} {currentUser.lastname}
                                        </p>
                                        <p className="leading-relaxed">
                                            {billing.street1}
                                            {billing.street2 ? <><br />{billing.street2}</> : null}
                                            <br />
                                            {billing.plz} {billing.city}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Payment Method */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-[#181411] dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">payments</span>
                                    Payment Method
                                </h2>
                                <div className="flex items-center gap-1 text-green-600 dark:text-green-500 text-xs font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                                    <span className="material-symbols-outlined text-[14px]">lock</span>
                                    Secure Payment
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Direct Debit */}
                                <label
                                    className={[
                                        'relative flex cursor-pointer rounded-lg p-5 shadow-sm focus:outline-none transition-colors',
                                        paymentMethod === 'Direct debit'
                                            ? 'border border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary'
                                            : 'border border-[#e6e0db] dark:border-[#3a2e26] bg-white dark:bg-[#1e1611] hover:border-gray-300 dark:hover:border-gray-600',
                                    ].join(' ')}
                                    onClick={() => setPaymentMethod('Direct debit')}
                                >
                                    <input className="sr-only" name="payment-method" type="radio" value="direct-debit" checked={paymentMethod === 'Direct debit'} readOnly />
                                    <span className="flex flex-1">
                    <span className="flex flex-col w-full">
                      <span className="block text-base font-bold text-[#181411] dark:text-white flex items-center gap-2">
                        Direct Debit (SEPA)
                        <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full uppercase">
                          Preferred
                        </span>
                      </span>
                      <span className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-300">
                        Automatic monthly/annual deduction. Easy and secure.
                      </span>

                        {paymentMethod === 'Direct debit' && (
                            <div className="mt-4 w-full max-w-md">
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="iban">
                                    IBAN Number
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <span className="material-symbols-outlined text-gray-400 text-[18px]">
                                account_balance
                              </span>
                                    </div>
                                    <input
                                        id="iban"
                                        name="iban"
                                        value={iban}
                                        onChange={(e) => setIban(e.target.value)}
                                        placeholder="DE00 0000 0000 0000 0000 00"
                                        type="text"
                                        className="block w-full rounded border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-[#2c221b] dark:ring-[#3a2e26] dark:text-white"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    By providing your IBAN, you authorize The Daily Chronicle to debit your account.
                                </p>
                            </div>
                        )}
                    </span>
                  </span>

                                    <span aria-hidden="true" className="material-symbols-outlined text-primary text-2xl h-6 w-6">
                    {paymentMethod === 'Direct debit' ? 'check_circle' : 'circle'}
                  </span>
                                </label>

                                {/* Invoice */}
                                <label
                                    className={[
                                        'relative flex cursor-pointer rounded-lg p-5 shadow-sm focus:outline-none transition-colors',
                                        paymentMethod === 'Invoice'
                                            ? 'border border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary'
                                            : 'border border-[#e6e0db] dark:border-[#3a2e26] bg-white dark:bg-[#1e1611] hover:border-gray-300 dark:hover:border-gray-600',
                                    ].join(' ')}
                                    onClick={() => setPaymentMethod('Invoice')}
                                >
                                    <input className="sr-only" name="payment-method" type="radio" value="invoice" checked={paymentMethod === 'Invoice'} readOnly />
                                    <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-base font-bold text-[#181411] dark:text-white">
                        Invoice
                      </span>
                      <span className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-300">
                        Receive an invoice by email. Payment due within 14 days.
                      </span>
                    </span>
                  </span>
                                    <span aria-hidden="true" className="material-symbols-outlined text-2xl h-6 w-6 text-gray-300 dark:text-gray-600">
                    {paymentMethod === 'Invoice' ? 'check_circle' : 'circle'}
                  </span>
                                </label>
                            </div>
                        </section>

                        {/* Terms */}
                        <section className="pt-4 border-t border-[#f4f2f0] dark:border-[#3a2e26]">
                            <div className="flex items-start">
                                <div className="flex h-6 items-center">
                                    <input
                                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                    />
                                </div>
                                <div className="ml-3 text-sm leading-6">
                                    <label className="font-medium text-gray-900 dark:text-gray-100" htmlFor="terms">
                                        I agree to the{' '}
                                        <a className="text-primary hover:underline" href="#">
                                            Terms &amp; Conditions
                                        </a>{' '}
                                        and{' '}
                                        <a className="text-primary hover:underline" href="#">
                                            Privacy Policy
                                        </a>
                                        .
                                    </label>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        You can cancel your subscription at any time with a 30-day notice period.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Errors */}
                        {error && (
                            <div className="rounded-lg border border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-200 p-4 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse sm:flex-row items-center gap-4 pt-2">
                            <button
                                type="button"
                                onClick={() => router.push('/subscription/register')}
                                disabled={loading}
                                className="w-full sm:w-auto px-6 py-3 text-[#181411] dark:text-gray-200 font-bold text-sm hover:bg-gray-100 dark:hover:bg-[#2c221b] rounded-lg transition-colors disabled:opacity-50"
                            >
                                Back
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmOrder}
                                disabled={!canSubmit}
                                className="w-full sm:w-auto flex-1 bg-primary hover:bg-primary/90 disabled:bg-primary/60 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                            >
                                <span>{loading ? 'Processing...' : 'Confirm Order & Pay'}</span>
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-28 space-y-4">
                            <div className="bg-white dark:bg-[#1e1611] rounded-xl shadow-lg border border-[#e6e0db] dark:border-[#3a2e26] overflow-hidden">
                                {/* Summary Header */}
                                <div className="bg-[#221810] px-6 py-4 flex items-center justify-between">
                                    <h3 className="text-white font-bold text-lg">Order Summary</h3>
                                    <span className="material-symbols-outlined text-white/50">receipt_long</span>
                                </div>

                                {/* Product Info */}
                                <div className="p-6 border-b border-[#f4f2f0] dark:border-[#3a2e26]">
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-16 h-20 rounded overflow-hidden flex-shrink-0 bg-[#e6e0db] dark:bg-[#3a2e26] flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary">newspaper</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#181411] dark:text-white leading-tight">
                                                {selectedVersion.name}
                                            </h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {currentSubscription.subscriptiontype} • {currentSubscription.deliverymethod}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 mt-4 text-sm">
                                        <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                                            <span>Billing Interval</span>
                                            <span className="font-medium text-[#181411] dark:text-white">
                        {currentSubscription.payment}
                      </span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                                            <span>Delivery PLZ</span>
                                            <span className="font-medium text-[#181411] dark:text-white">{deliveryPlz}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                                            <span>Customer</span>
                                            <span className="font-medium text-[#181411] dark:text-white">
                        {currentUser.firstname} {currentUser.lastname}
                      </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Breakdown */}
                                <div className="p-6 bg-[#fcfbf9] dark:bg-[#251d16]">
                                    <div className="flex justify-between items-center mb-2 text-sm text-gray-600 dark:text-gray-300">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(isAnnual ? yearlyPrice : monthlyPrice)}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2 text-sm text-gray-600 dark:text-gray-300">
                                        <span>Shipping</span>
                                        <span className="text-green-600 dark:text-green-500 font-medium">Free</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-4 text-sm text-gray-600 dark:text-gray-300">
                                        <span>Tax (Included)</span>
                                        <span>{formatPrice(0)}</span>
                                    </div>

                                    <div className="flex justify-between items-end pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div>
                                            <span className="block text-xs text-gray-500 uppercase font-semibold">Total to pay</span>
                                            <span className="text-xs text-gray-400">
                        {isAnnual ? 'Renews annually' : 'Renews monthly'}
                      </span>
                                        </div>
                                        <span className="text-2xl font-black text-primary">
                      {formatPrice(isAnnual ? yearlyPrice : monthlyPrice)}
                    </span>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Signal */}
                            <div className="bg-[#f0f9ff] dark:bg-[#1a2e3b] rounded-lg p-4 border border-blue-100 dark:border-blue-900/30 flex items-start gap-3">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 mt-0.5">
                  verified_user
                </span>
                                <div>
                                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                                        Secure checkout
                                    </h4>
                                    <p className="text-xs text-blue-800/70 dark:text-blue-300/70 mt-1">
                                        Payments are processed securely. No charge until your subscription starts.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
