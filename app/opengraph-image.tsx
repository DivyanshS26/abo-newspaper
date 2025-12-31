import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'The Daily Chronicle - Quality Journalism';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    // We can fetch data here if needed (e.g., latest headline),
    // but for now, we'll use a static, branded design.

    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fdfbf7', // Paper-like off-white background
                    backgroundImage: 'radial-gradient(circle at 25px 25px, #e5e7eb 2%, transparent 0%), radial-gradient(circle at 75px 75px, #e5e7eb 2%, transparent 0%)',
                    backgroundSize: '100px 100px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px 80px',
                        border: '4px solid #1a1a1a',
                        backgroundColor: '#ffffff',
                        boxShadow: '10px 10px 0px rgba(0,0,0,0.1)',
                    }}
                >
                    {/* Logo / Brand Name */}
                    <div
                        style={{
                            fontSize: 64,
                            fontWeight: 900,
                            fontFamily: 'serif',
                            color: '#1a1a1a',
                            marginBottom: 20,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        The Daily Chronicle
                    </div>

                    {/* Tagline */}
                    <div
                        style={{
                            fontSize: 32,
                            color: '#4b5563',
                            textAlign: 'center',
                            fontFamily: 'sans-serif',
                            maxWidth: 800,
                        }}
                    >
                        Join 50,000+ readers. Quality journalism delivered to your door.
                    </div>

                    {/* Call to Action Button Visual */}
                    <div
                        style={{
                            marginTop: 40,
                            backgroundColor: '#dc2626', // Primary Red
                            color: 'white',
                            fontSize: 24,
                            fontWeight: 700,
                            padding: '12px 32px',
                            borderRadius: '8px',
                            fontFamily: 'sans-serif',
                        }}
                    >
                        Subscribe Now
                    </div>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        bottom: 40,
                        fontSize: 18,
                        color: '#9ca3af',
                        fontFamily: 'sans-serif',
                    }}
                >
                    dailychronicle.com
                </div>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
