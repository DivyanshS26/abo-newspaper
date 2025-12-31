
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/lib/context/AppContext";
import { getDistanceFromCompanyToDestinationPlz } from "@/lib/Api";

export default function DeliveryAddressPage() {
    const router = useRouter();
    const { setDeliveryPlz, setDeliveryCity, setIsLoading } = useAppContext();

    const [plz, setPlz] = useState("");
    const [city, setCity] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!plz || plz.length !== 5) {
            setError("Please enter a valid 5-digit postal code.");
            return;
        }
        if (!city.trim()) {
            setError("Please enter your city.");
            return;
        }

        try {
            setIsLoading(true);

            const result = await getDistanceFromCompanyToDestinationPlz(plz);
            const distanceData = result.distanceCalcObj[0];
            console.log("Distance calculated:", distanceData);

            setDeliveryPlz(plz);
            setDeliveryCity(city);

            router.push("/subscription/configure");
        } catch (err) {
            console.error("Distance check failed:", err);
            setError("Unable to verify delivery address. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const plzInvalid = !!error && plz.length !== 5;

    return (
        <div className="relative flex min-h-screen flex-col bg-background-light dark:bg-background-dark font-display text-[#181411] dark:text-white antialiased overflow-x-hidden">
            {/* Top Navigation (simplified: no burger, no sign-in, no avatar) */}
            <header className="flex items-center justify-center whitespace-nowrap border-b border-solid border-[#e6e0db] dark:border-[#3a2e26] bg-white dark:bg-[#1e1610] px-4 md:px-10 py-4 sticky top-0 z-50">
                <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">
            newspaper
          </span>
                    <h2 className="text-[#181411] dark:text-white text-xl font-bold leading-tight tracking-tight">
                        The Daily Chronicle
                    </h2>
                </div>
            </header>

            <main className="flex flex-1 flex-col items-center justify-start py-8 md:py-12 px-4 w-full">
                <div className="w-full max-w-[640px] flex flex-col gap-8">
                    {/* Progress Bar */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                            <p className="text-[#181411] dark:text-gray-200 text-sm font-semibold tracking-wide uppercase">
                                Step 1 of 4
                            </p>
                            <p className="text-[#897261] dark:text-gray-400 text-sm font-medium">
                                Delivery Details
                            </p>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#e6e0db] dark:bg-[#3a2e26] overflow-hidden">
                            <div
                                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                                style={{ width: "25%" }}
                            />
                        </div>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white dark:bg-[#2c221b] rounded-xl editorial-shadow border border-[#e6e0db] dark:border-[#3a2e26] overflow-hidden">
                        <div className="p-6 md:p-10 flex flex-col gap-8">
                            {/* Header Text */}
                            <div className="flex flex-col gap-3 text-center md:text-left">
                                <h1 className="text-[#181411] dark:text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight">
                                    Let&apos;s check availability in your area.
                                </h1>
                                <p className="text-[#5c4d44] dark:text-gray-300 text-lg font-normal leading-relaxed">
                                    Enter your delivery details to see which subscription plans are available for your home.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                {/* Postal Code */}
                                <div className="flex flex-col gap-2">
                                    <label
                                        className="text-[#181411] dark:text-white text-base font-semibold"
                                        htmlFor="postal-code"
                                    >
                                        Postal Code
                                    </label>

                                    <div className="relative">
                                        <input
                                            className="form-input w-full rounded-lg border border-[#e6e0db] dark:border-[#4a3e36] bg-white dark:bg-[#1e1610] h-14 px-4 text-lg text-[#181411] dark:text-white placeholder:text-[#897261] focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                                            id="postal-code"
                                            placeholder="12345"
                                            type="text"
                                            inputMode="numeric"
                                            value={plz}
                                            onChange={(e) => setPlz(e.target.value)}
                                        />
                                        {/* Removed “Use current location” control */}
                                    </div>

                                    {plzInvalid && (
                                        <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                            <span className="material-symbols-outlined text-sm">error</span>
                                            Please enter a valid 5-digit postal code.
                                        </p>
                                    )}
                                </div>

                                {/* City */}
                                <div className="flex flex-col gap-2">
                                    <label
                                        className="text-[#181411] dark:text-white text-base font-semibold"
                                        htmlFor="city"
                                    >
                                        City
                                    </label>

                                    <div className="relative group">
                                        <input
                                            className="form-input w-full rounded-lg border border-[#e6e0db] dark:border-[#4a3e36] bg-white dark:bg-[#1e1610] h-14 px-4 text-lg text-[#181411] dark:text-white placeholder:text-[#897261] focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                                            id="city"
                                            placeholder="e.g. Reutlingen"
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* General error */}
                                {!!error && !plzInvalid && (
                                    <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => router.push("/")}
                                        className="w-full md:w-auto px-6 py-3 rounded-lg text-[#5c4d44] dark:text-gray-300 font-semibold hover:bg-[#f4f2f0] dark:hover:bg-[#3a2e26] hover:text-[#181411] dark:hover:text-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined">arrow_back</span>
                                        Back
                                    </button>

                                    <button
                                        type="submit"
                                        className="w-full md:w-auto px-10 py-4 bg-primary hover:bg-[#d65d0f] rounded-lg text-white text-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                                    >
                                        Continue to Plans
                                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                                    </button>
                                </div>

                                {/* Trust Signal */}
                                <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#f4f2f0] dark:border-[#3a2e26] mt-2">
                  <span className="material-symbols-outlined text-[#897261] text-sm">
                    lock
                  </span>
                                    <p className="text-[#897261] text-xs md:text-sm font-medium">
                                        Your data is secure. Cancel anytime.
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Decorative bottom strip */}
                        <div className="h-2 w-full bg-[#f4f2f0] dark:bg-[#3a2e26] flex">
                            <div className="h-full w-12 bg-[#e6e0db] dark:bg-[#4a3e36]" />
                            <div className="h-full w-12 bg-transparent" />
                            <div className="h-full w-12 bg-[#e6e0db] dark:bg-[#4a3e36]" />
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-8 text-center">
                <p className="text-[#897261] text-sm">© 2025 The Daily Chronicle. All rights reserved.</p>
            </footer>
        </div>
    );
}
