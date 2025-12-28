// app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import Button from './components/common/Button';
import Card from './components/common/Card';

export default function Home() {
  const router = useRouter();

  return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Newspaper Header */}
          <div className="newspaper-header mb-8">
            <h1 className="text-5xl font-bold text-ink mb-2">
              THE DAILY CHRONICLE
            </h1>
            <p className="text-sm uppercase tracking-widest text-gold">
              Est. 1885 • Premium News Delivered Daily
            </p>
          </div>

          {/* Main Content Card */}
          <Card className="text-center">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-4 uppercase">
                Subscribe to Print Edition
              </h2>
              <p className="text-lg leading-relaxed font-sans mb-4">
                Experience the tradition of morning newspaper delivery.
                Choose from our premium print editions with local news coverage.
              </p>
              <div className="ornamental-divider"></div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-8 text-left">
              <div className="border-2 border-border p-4">
                <h3 className="font-bold text-lg mb-2 uppercase">Daily Delivery</h3>
                <p className="text-sm font-sans">Fresh news at your doorstep every morning</p>
              </div>
              <div className="border-2 border-border p-4">
                <h3 className="font-bold text-lg mb-2 uppercase">Local Editions</h3>
                <p className="text-sm font-sans">Choose your preferred regional coverage</p>
              </div>
              <div className="border-2 border-border p-4">
                <h3 className="font-bold text-lg mb-2 uppercase">Flexible Plans</h3>
                <p className="text-sm font-sans">Monthly or annual subscription options</p>
              </div>
            </div>

            {/* CTA Button */}
            <Button
                variant="primary"
                onClick={() => router.push('/subscription/newspaper/print-edition')}
                className="text-xl py-4"
            >
              Order Subscription Now
            </Button>

            <p className="text-xs mt-4 font-sans text-gray-600">
              Starting from €8.99/month • Cancel anytime
            </p>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-sm font-sans text-gray-600">
            <p>Questions? Contact us at subscriptions@dailychronicle.com</p>
          </div>
        </div>
      </main>
  );
}
