// app/subscription/address/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context/AppContext';
import { getDistanceFromCompanyToDestinationPlz } from '@/lib/Api';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

export default function DeliveryAddressPage() {
    const router = useRouter();
    const { setDeliveryPlz, setDeliveryCity, setIsLoading } = useAppContext();



    const [plz, setPlz] = useState('');
    const [city, setCity] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!plz || plz.length !== 5) {
            setError('Please enter a valid 5-digit postal code');
            return;
        }
        if (!city.trim()) {
            setError('Please enter your city');
            return;
        }

        try {
            setIsLoading(true);

            // Check distance using your API
            const result = await getDistanceFromCompanyToDestinationPlz(plz);
            const distanceData = result.distanceCalcObj[0];

            console.log('Distance calculated:', distanceData);

            // Save PLZ to context
            setDeliveryPlz(plz);
            setDeliveryCity(city);
            router.push('/subscription/configure');


        } catch (err) {
            console.error('Distance check failed:', err);
            setError('Unable to verify delivery address. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-paper">
            <div className="max-w-2xl w-full">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">
                        Delivery Address
                    </h1>
                    <p className="text-sm font-sans text-gray-700">
                        Step 1 of 4 • Enter your delivery location
                    </p>
                </div>

                <Card title="Where should we deliver?">
                    <form onSubmit={handleSubmit}>

                        {/* PLZ Input */}
                        <Input
                            label="Postal Code (PLZ)"
                            id="plz"
                            type="text"
                            value={plz}
                            onChange={setPlz}
                            placeholder="e.g. 72762"
                            required
                            error={error && plz.length !== 5 ? 'Must be 5 digits' : ''}
                        />

                        {/* City Input */}
                        <Input
                            label="City"
                            id="city"
                            type="text"
                            value={city}
                            onChange={setCity}
                            placeholder="e.g. Reutlingen"
                            required
                        />

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 mb-4 font-sans text-sm">
                                {error}
                            </div>
                        )}

                        {/* Info Box */}
                        <div className="bg-hover border-2 border-gold p-4 mb-6 font-sans text-sm">
                            <p className="font-bold mb-2">ℹ️ Delivery Information:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>We deliver to all regions in Germany</li>
                                <li>Pricing varies based on delivery distance</li>
                                <li>Local delivery available for nearby postal codes</li>
                            </ul>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/')}
                            >
                                ← Back
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                            >
                                Continue to Configuration →
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </main>
    );
}
