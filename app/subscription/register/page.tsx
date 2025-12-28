
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context/AppContext';
import { saveCustomer, readCustomer } from '@/lib/Api';
import { isValidEmail, hashPassword } from '@/lib/utils';
import type { NewCustomer } from '@/lib/types';

export default function RegisterPage() {
    const router = useRouter();
    const { currentSubscription, deliveryPlz, deliveryCity, setCurrentUser, setIsLoading } =
        useAppContext();

    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [companyname, setCompanyname] = useState('');

    const [deliveryStreet1, setDeliveryStreet1] = useState('');
    const [deliveryStreet2, setDeliveryStreet2] = useState('');
    const [deliveryCityState, setDeliveryCityState] = useState(deliveryCity);
    const [deliveryPlzInput, setDeliveryPlzInput] = useState(deliveryPlz);

    const [useSameAddress, setUseSameAddress] = useState(true);
    const [billingStreet1, setBillingStreet1] = useState('');
    const [billingStreet2, setBillingStreet2] = useState('');
    const [billingCity, setBillingCity] = useState('');
    const [billingPlz, setBillingPlz] = useState('');

    const [acceptPrivacy, setAcceptPrivacy] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!currentSubscription) {
            router.push('/subscription/address');
        }
    }, [currentSubscription, router]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!firstname.trim()) newErrors.firstname = 'First name is required';
        if (!lastname.trim()) newErrors.lastname = 'Last name is required';
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!isValidEmail(email)) newErrors.email = 'Invalid email format';
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        if (!deliveryStreet1.trim()) newErrors.deliveryStreet1 = 'Street is required';
        if (!deliveryCityState.trim()) newErrors.deliveryCity = 'City is required';
        if (!deliveryPlzInput || deliveryPlzInput.length !== 5) {
            newErrors.deliveryPlz = 'Valid 5-digit postal code required';
        }

        if (!useSameAddress) {
            if (!billingStreet1.trim()) newErrors.billingStreet1 = 'Billing street is required';
            if (!billingCity.trim()) newErrors.billingCity = 'Billing city is required';
            if (!billingPlz || billingPlz.length !== 5) {
                newErrors.billingPlz = 'Valid 5-digit postal code required';
            }
        }

        if (!acceptPrivacy) newErrors.privacy = 'You must accept the privacy policy';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (!currentSubscription) {
            alert('Subscription configuration missing. Please start from the beginning.');
            router.push('/subscription/address');
            return;
        }

        setIsSubmitting(true);
        setIsLoading(true);

        try {
            const existingCustomer = await readCustomer(email);
            if (existingCustomer.customer[0]) {
                setErrors({ email: 'This email is already registered' });
                setIsSubmitting(false);
                setIsLoading(false);
                return;
            }

            const newCustomer: NewCustomer = {
                firstname: firstname.trim(),
                lastname: lastname.trim(),
                email: email.trim(),
                password: hashPassword(password),
                phone: phone.trim() || '',
                companyname: companyname.trim() || '',
                deliveryAddress: {
                    street1: deliveryStreet1.trim(),
                    street2: deliveryStreet2.trim() || '',
                    city: deliveryCityState.trim(),
                    plz: deliveryPlzInput,
                },
                billingAddress: useSameAddress
                    ? {
                        street1: deliveryStreet1.trim(),
                        street2: deliveryStreet2.trim() || '',
                        city: deliveryCityState.trim(),
                        plz: deliveryPlzInput,
                    }
                    : {
                        street1: billingStreet1.trim(),
                        street2: billingStreet2.trim() || '',
                        city: billingCity.trim(),
                        plz: billingPlz,
                    },
            };

            const result = await saveCustomer(newCustomer);

            if (result.success[0]) {
                const savedCustomer = await readCustomer(email);
                const customerWithId = savedCustomer.customer[0];

                if (customerWithId) {
                    setCurrentUser(customerWithId);
                    router.push('/subscription/checkout');
                } else {
                    throw new Error('Failed to retrieve saved customer');
                }
            } else {
                setErrors({ general: 'Registration failed. Email may already be in use.' });
            }
        } catch (error) {
            console.error('Registration error:', error);
            setErrors({ general: 'An error occurred during registration. Please try again.' });
        } finally {
            setIsSubmitting(false);
            setIsLoading(false);
        }
    };

    const inputBase =
        'w-full rounded-lg border bg-white dark:bg-[#221810] px-4 py-3 text-base outline-none transition-all placeholder:text-text-secondary ' +
        'border-border-light dark:border-border-dark focus:border-primary focus:ring-1 focus:ring-primary ' +
        'text-text-main dark:text-white';

    const inputError = 'border-red-500 focus:border-red-500 focus:ring-red-500';

    const fieldClass = (field: string) => `${inputBase} ${errors[field] ? inputError : ''}`;

    const sectionTitleClass = 'text-text-main dark:text-white text-xl font-bold leading-tight';

    const hasSubscription = useMemo(() => Boolean(currentSubscription), [currentSubscription]);

    if (!hasSubscription) {
        return null;
    }

    return (
        <div className="relative flex min-h-screen flex-col bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-x-hidden">
            <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border-light dark:border-border-dark bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur px-6 py-4 md:px-10 lg:px-40">
                <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => router.push('/')}
                    role="button"
                    tabIndex={0}
                >
                    <div className="text-primary">
                        <span className="material-symbols-outlined text-3xl">newsmode</span>
                    </div>
                    <h2 className="text-xl font-bold leading-tight tracking-tight text-text-main dark:text-white">
                        The Daily Chronicle
                    </h2>
                </div>
            </header>

            <main className="flex-1 w-full max-w-[900px] mx-auto px-4 md:px-10 py-10">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-end">
                            <p className="text-text-main dark:text-white text-base font-semibold leading-normal">
                                Step 3 of 4: Registration
                            </p>
                            <p className="text-text-secondary text-sm font-medium leading-normal">75% completed</p>
                        </div>
                        <div className="h-2 w-full rounded-full bg-border-light dark:bg-border-dark overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '75%' }} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-text-main dark:text-white">
                            Create your account
                        </h1>
                        <p className="text-text-secondary text-lg">
                            Enter your details to finalize your subscription.
                        </p>
                    </div>

                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
                        <form onSubmit={handleSubmit}>
                            {errors.general && (
                                <div className="px-6 md:px-8 pt-6">
                                    <div className="rounded-lg border border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-200 p-4 text-sm">
                                        {errors.general}
                                    </div>
                                </div>
                            )}

                            <div className="p-6 md:p-8 flex flex-col gap-6 border-b border-border-light dark:border-border-dark">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                                        <span className="material-symbols-outlined text-2xl">person</span>
                                    </div>
                                    <h3 className={sectionTitleClass}>Account details</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-text-main dark:text-white">
                      First Name
                    </span>
                                        <input
                                            className={fieldClass('firstname')}
                                            value={firstname}
                                            onChange={(e) => setFirstname(e.target.value)}
                                            placeholder="Jane"
                                            type="text"
                                        />
                                        {errors.firstname && (
                                            <p className="text-xs text-red-600">{errors.firstname}</p>
                                        )}
                                    </label>

                                    <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-text-main dark:text-white">
                      Last Name
                    </span>
                                        <input
                                            className={fieldClass('lastname')}
                                            value={lastname}
                                            onChange={(e) => setLastname(e.target.value)}
                                            placeholder="Doe"
                                            type="text"
                                        />
                                        {errors.lastname && <p className="text-xs text-red-600">{errors.lastname}</p>}
                                    </label>
                                </div>

                                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-text-main dark:text-white">
                    Email Address
                  </span>
                                    <input
                                        className={fieldClass('email')}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="jane.doe@example.com"
                                        type="email"
                                    />
                                    {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                                </label>

                                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-text-main dark:text-white">
                    Password
                  </span>
                                    <input
                                        className={fieldClass('password')}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Minimum 6 characters"
                                        type="password"
                                    />
                                    <p className="text-xs text-text-secondary">
                                        Must be at least 6 characters.
                                    </p>
                                    {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                                </label>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-text-main dark:text-white">
                      Phone (Optional)
                    </span>
                                        <input
                                            className={inputBase}
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+49 123 456789"
                                            type="tel"
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-text-main dark:text-white">
                      Company (Optional)
                    </span>
                                        <input
                                            className={inputBase}
                                            value={companyname}
                                            onChange={(e) => setCompanyname(e.target.value)}
                                            placeholder="Company name"
                                            type="text"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 flex flex-col gap-6 border-b border-border-light dark:border-border-dark">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                                        <span className="material-symbols-outlined text-2xl">local_shipping</span>
                                    </div>
                                    <h3 className={sectionTitleClass}>Delivery address</h3>
                                </div>

                                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-text-main dark:text-white">
                    Street Address
                  </span>
                                    <input
                                        className={fieldClass('deliveryStreet1')}
                                        value={deliveryStreet1}
                                        onChange={(e) => setDeliveryStreet1(e.target.value)}
                                        placeholder="123 Main St"
                                        type="text"
                                    />
                                    {errors.deliveryStreet1 && (
                                        <p className="text-xs text-red-600">{errors.deliveryStreet1}</p>
                                    )}
                                </label>

                                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-text-main dark:text-white">
                    Apartment, suite, etc. (optional)
                  </span>
                                    <input
                                        className={inputBase}
                                        value={deliveryStreet2}
                                        onChange={(e) => setDeliveryStreet2(e.target.value)}
                                        placeholder=""
                                        type="text"
                                    />
                                </label>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-text-main dark:text-white">
                      Postal Code
                    </span>
                                        <input
                                            className={fieldClass('deliveryPlz')}
                                            value={deliveryPlzInput}
                                            onChange={(e) => setDeliveryPlzInput(e.target.value)}
                                            placeholder="72762"
                                            type="text"
                                        />
                                        {errors.deliveryPlz && <p className="text-xs text-red-600">{errors.deliveryPlz}</p>}
                                    </label>

                                    <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-text-main dark:text-white">
                      City
                    </span>
                                        <input
                                            className={fieldClass('deliveryCity')}
                                            value={deliveryCityState}
                                            onChange={(e) => setDeliveryCityState(e.target.value)}
                                            placeholder="Reutlingen"
                                            type="text"
                                        />
                                        {errors.deliveryCity && (
                                            <p className="text-xs text-red-600">{errors.deliveryCity}</p>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 flex flex-col gap-6">
                                <div className="flex items-center justify-between p-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light/60 dark:bg-background-dark/10">
                                    <div className="flex flex-col">
                    <span className="text-text-main dark:text-white text-base font-bold">
                      Billing Address
                    </span>
                                        <span className="text-text-secondary text-sm">Same as delivery address</span>
                                    </div>

                                    <label className="relative inline-flex items-center cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={useSameAddress}
                                            onChange={(e) => setUseSameAddress(e.target.checked)}
                                        />
                                        <span className="w-12 h-6 bg-gray-300 dark:bg-gray-700 rounded-full peer peer-checked:bg-primary transition-colors" />
                                        <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
                                    </label>
                                </div>

                                {!useSameAddress && (
                                    <div className="grid grid-cols-1 gap-6">
                                        <label className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-text-main dark:text-white">
                        Billing Street Address
                      </span>
                                            <input
                                                className={fieldClass('billingStreet1')}
                                                value={billingStreet1}
                                                onChange={(e) => setBillingStreet1(e.target.value)}
                                                placeholder="123 Main St"
                                                type="text"
                                            />
                                            {errors.billingStreet1 && (
                                                <p className="text-xs text-red-600">{errors.billingStreet1}</p>
                                            )}
                                        </label>

                                        <label className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-text-main dark:text-white">
                        Apartment, suite, etc. (optional)
                      </span>
                                            <input
                                                className={inputBase}
                                                value={billingStreet2}
                                                onChange={(e) => setBillingStreet2(e.target.value)}
                                                placeholder=""
                                                type="text"
                                            />
                                        </label>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-text-main dark:text-white">
                          Billing Postal Code
                        </span>
                                                <input
                                                    className={fieldClass('billingPlz')}
                                                    value={billingPlz}
                                                    onChange={(e) => setBillingPlz(e.target.value)}
                                                    placeholder="72762"
                                                    type="text"
                                                />
                                                {errors.billingPlz && (
                                                    <p className="text-xs text-red-600">{errors.billingPlz}</p>
                                                )}
                                            </label>

                                            <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-text-main dark:text-white">
                          Billing City
                        </span>
                                                <input
                                                    className={fieldClass('billingCity')}
                                                    value={billingCity}
                                                    onChange={(e) => setBillingCity(e.target.value)}
                                                    placeholder="Reutlingen"
                                                    type="text"
                                                />
                                                {errors.billingCity && (
                                                    <p className="text-xs text-red-600">{errors.billingCity}</p>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <input
                                        className="h-5 w-5 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary dark:bg-[#221810]"
                                        id="privacy"
                                        type="checkbox"
                                        checked={acceptPrivacy}
                                        onChange={(e) => setAcceptPrivacy(e.target.checked)}
                                    />
                                    <div className="text-sm leading-6">
                                        <label className="font-medium text-text-main dark:text-white" htmlFor="privacy">
                                            I accept the privacy policy
                                        </label>
                                        <p className="text-text-secondary">
                                            By creating an account, you agree to our Terms of Service and Privacy Policy.
                                        </p>
                                        {errors.privacy && <p className="text-xs text-red-600 mt-2">{errors.privacy}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 bg-background-light/60 dark:bg-background-dark/10 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row gap-4 justify-between items-center">
                                <button
                                    type="button"
                                    onClick={() => router.push('/subscription/configure')}
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto px-6 py-3 rounded-lg border border-border-light dark:border-border-dark text-text-main dark:text-white font-bold text-sm hover:bg-white/70 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                                >
                                    Back
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary hover:brightness-110 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    <span>{isSubmitting ? 'Creating account...' : 'Continue to checkout'}</span>
                                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <footer className="py-8 text-center text-text-secondary text-sm">
                © 2025 The Daily Chronicle. All rights reserved.
            </footer>
        </div>
    );
}
