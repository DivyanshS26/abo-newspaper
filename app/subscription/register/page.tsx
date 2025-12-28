// app/subscription/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context/AppContext';
import { saveCustomer, readCustomer } from '@/lib/Api';
import { isValidEmail, hashPassword } from '@/lib/utils';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import type { NewCustomer } from '@/lib/types';

export default function RegisterPage() {
    const router = useRouter();
    const { currentSubscription, deliveryPlz, deliveryCity, setCurrentUser, setIsLoading } = useAppContext();


    // Personal Info
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [companyname, setCompanyname] = useState('');

    // Delivery Address
    const [deliveryStreet1, setDeliveryStreet1] = useState('');
    const [deliveryStreet2, setDeliveryStreet2] = useState('');
    const [deliveryCityState, setDeliveryCityState] = useState(deliveryCity);
    const [deliveryPlzInput, setDeliveryPlzInput] = useState(deliveryPlz);

    // Billing Address
    const [useSameAddress, setUseSameAddress] = useState(true);
    const [billingStreet1, setBillingStreet1] = useState('');
    const [billingStreet2, setBillingStreet2] = useState('');
    const [billingCity, setBillingCity] = useState('');
    const [billingPlz, setBillingPlz] = useState('');

    // Privacy
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);

    // UI State
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Personal info validation
        if (!firstname.trim()) newErrors.firstname = 'First name is required';
        if (!lastname.trim()) newErrors.lastname = 'Last name is required';
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!isValidEmail(email)) newErrors.email = 'Invalid email format';
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        // Delivery address validation
        if (!deliveryStreet1.trim()) newErrors.deliveryStreet1 = 'Street is required';
        if (!deliveryCity.trim()) newErrors.deliveryCity = 'City is required';
        if (!deliveryPlzInput || deliveryPlzInput.length !== 5) {
            newErrors.deliveryPlz = 'Valid 5-digit postal code required';
        }

        // Billing address validation (if different)
        if (!useSameAddress) {
            if (!billingStreet1.trim()) newErrors.billingStreet1 = 'Billing street is required';
            if (!billingCity.trim()) newErrors.billingCity = 'Billing city is required';
            if (!billingPlz || billingPlz.length !== 5) {
                newErrors.billingPlz = 'Valid 5-digit postal code required';
            }
        }

        // Privacy acceptance
        if (!acceptPrivacy) newErrors.privacy = 'You must accept the privacy policy';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Check if we have subscription data
        if (!currentSubscription) {
            alert('Subscription configuration missing. Please start from the beginning.');
            router.push('/subscription/address');
            return;
        }

        setIsSubmitting(true);
        setIsLoading(true);

        try {
            // Check if email already exists
            const existingCustomer = await readCustomer(email);
            if (existingCustomer.customer[0]) {
                setErrors({ email: 'This email is already registered' });
                setIsSubmitting(false);
                setIsLoading(false);
                return;
            }

            // Prepare customer object
            const newCustomer: NewCustomer = {
                firstname: firstname.trim(),
                lastname: lastname.trim(),
                email: email.trim(),
                password: hashPassword(password), // Simple hash for demo
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

            // Save customer
            const result = await saveCustomer(newCustomer);

            if (result.success[0]) {
                // Customer saved successfully
                // Re-read to get the ID
                const savedCustomer = await readCustomer(email);
                const customerWithId = savedCustomer.customer[0];

                if (customerWithId) {
                    setCurrentUser(customerWithId);
                    // Navigate to checkout
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

    return (
        <main className="min-h-screen p-4 py-8">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">
                        Create Your Account
                    </h1>
                    <p className="text-sm font-sans text-gray-700">
                        Step 3 of 4 • Register to complete your subscription
                    </p>
                </div>

                <Card title="Customer Information">
                    <form onSubmit={handleSubmit}>

                        {/* General Error */}
                        {errors.general && (
                            <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 mb-6 font-sans text-sm">
                                {errors.general}
                            </div>
                        )}

                        {/* Personal Information */}
                        <div className="mb-6">
                            <h3 className="text-xl font-bold uppercase mb-4 pb-2 border-b-2 border-border">
                                Personal Details
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="First Name"
                                    id="firstname"
                                    value={firstname}
                                    onChange={setFirstname}
                                    placeholder="John"
                                    required
                                    error={errors.firstname}
                                />
                                <Input
                                    label="Last Name"
                                    id="lastname"
                                    value={lastname}
                                    onChange={setLastname}
                                    placeholder="Doe"
                                    required
                                    error={errors.lastname}
                                />
                            </div>

                            <Input
                                label="Email Address"
                                id="email"
                                type="email"
                                value={email}
                                onChange={setEmail}
                                placeholder="john.doe@example.com"
                                required
                                error={errors.email}
                            />

                            <Input
                                label="Password"
                                id="password"
                                type="password"
                                value={password}
                                onChange={setPassword}
                                placeholder="Minimum 6 characters"
                                required
                                error={errors.password}
                            />

                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Phone (Optional)"
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={setPhone}
                                    placeholder="+49 123 456789"
                                />
                                <Input
                                    label="Company (Optional)"
                                    id="company"
                                    value={companyname}
                                    onChange={setCompanyname}
                                    placeholder="Company name"
                                />
                            </div>
                        </div>

                        <div className="ornamental-divider"></div>

                        {/* Delivery Address */}
                        <div className="mb-6">
                            <h3 className="text-xl font-bold uppercase mb-4 pb-2 border-b-2 border-border">
                                Delivery Address
                            </h3>

                            <Input
                                label="Street & Number"
                                id="deliveryStreet1"
                                value={deliveryStreet1}
                                onChange={setDeliveryStreet1}
                                placeholder="Main Street 123"
                                required
                                error={errors.deliveryStreet1}
                            />

                            <Input
                                label="Additional Address Info (Optional)"
                                id="deliveryStreet2"
                                value={deliveryStreet2}
                                onChange={setDeliveryStreet2}
                                placeholder="Apartment 4B"
                            />

                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Postal Code"
                                    id="deliveryPlz"
                                    value={deliveryPlzInput}
                                    onChange={setDeliveryPlzInput}
                                    placeholder="72762"
                                    required
                                    error={errors.deliveryPlz}
                                />
                                <Input
                                    label="City"
                                    id="deliveryCity"
                                    value={deliveryCityState}
                                    onChange={setDeliveryCityState}
                                    placeholder="Reutlingen"
                                    required
                                    error={errors.deliveryCity}
                                />
                            </div>
                        </div>

                        <div className="ornamental-divider"></div>

                        {/* Billing Address Toggle */}
                        <div className="mb-6">
                            <h3 className="text-xl font-bold uppercase mb-4 pb-2 border-b-2 border-border">
                                Billing Address
                            </h3>

                            <div className="mb-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={useSameAddress}
                                        onChange={(e) => setUseSameAddress((e?.target as HTMLInputElement)?.checked ?? false)}
                                        className="w-5 h-5 border-2 border-border mr-3"
                                    />
                                    <span className="font-sans">Same as delivery address</span>
                                </label>
                            </div>

                            {!useSameAddress && (
                                <>
                                    <Input
                                        label="Billing Street & Number"
                                        id="billingStreet1"
                                        value={billingStreet1}
                                        onChange={setBillingStreet1}
                                        placeholder="Main Street 123"
                                        required
                                        error={errors.billingStreet1}
                                    />

                                    <Input
                                        label="Additional Info (Optional)"
                                        id="billingStreet2"
                                        value={billingStreet2}
                                        onChange={setBillingStreet2}
                                        placeholder="Apartment 4B"
                                    />

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <Input
                                            label="Postal Code"
                                            id="billingPlz"
                                            value={billingPlz}
                                            onChange={setBillingPlz}
                                            placeholder="72762"
                                            required
                                            error={errors.billingPlz}
                                        />
                                        <Input
                                            label="City"
                                            id="billingCity"
                                            value={billingCity}
                                            onChange={setBillingCity}
                                            placeholder="Reutlingen"
                                            required
                                            error={errors.billingCity}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="ornamental-divider"></div>

                        {/* Privacy Policy */}
                        <div className="mb-6">
                            <label className="flex items-start cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={acceptPrivacy}
                                    onChange={(e) => setAcceptPrivacy((e?.target as HTMLInputElement)?.checked ?? false)}
                                    className="w-5 h-5 border-2 border-border mr-3 mt-1"
                                />
                                <span className="font-sans text-sm">
                  I accept the <span className="text-gold font-bold">privacy policy</span> and
                  agree to receive the newspaper subscription.
                  <span className="text-red-600 ml-1">*</span>
                </span>
                            </label>
                            {errors.privacy && (
                                <p className="text-red-600 text-sm mt-2 font-sans">{errors.privacy}</p>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/subscription/configure')}
                                disabled={isSubmitting}
                            >
                                ← Back
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating Account...' : 'Continue to Checkout →'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </main>
    );
}
