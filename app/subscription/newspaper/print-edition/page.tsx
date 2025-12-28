'use client';

import { useRouter } from 'next/navigation';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

export default function PrintEditionEntryPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-paper">
            <div className="max-w-3xl w-full">
                <div className="newspaper-header mb-8">
                    <h1 className="text-4xl font-bold uppercase tracking-wider">
                        Newspaper Subscription — Print Edition
                    </h1>
                    <p className="text-sm font-sans text-gray-700 mt-2">
                        Start your order by providing a delivery address.
                    </p>
                </div>

                <Card title="Order a print subscription">
                    <p className="font-sans text-sm text-gray-700 mb-6">
                        You will choose an edition, delivery method, and payment options, then confirm your order.
                    </p>

                    <Button variant="primary" onClick={() => router.push('/subscription/address')} fullWidth>
                        Start order →
                    </Button>
                </Card>
            </div>
        </main>
    );
}
