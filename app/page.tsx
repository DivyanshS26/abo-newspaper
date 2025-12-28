// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden font-display text-[#181411] dark:text-white">
        <div className="layout-container flex h-full grow flex-col">
          {/* Top Navigation */}
          <div className="w-full border-b border-[#e6e0db] dark:border-[#3a2d25] bg-background-light dark:bg-background-dark sticky top-0 z-50">
            <div className="px-4 md:px-10 lg:px-40 flex justify-center py-0">
              <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                <header className="flex items-center justify-between whitespace-nowrap px-0 py-4">
                  <div className="flex items-center gap-4 text-[#181411] dark:text-white">
                    <div className="size-8 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-3xl">
                      newspaper
                    </span>
                    </div>
                    <h2 className="text-[#181411] dark:text-white text-xl font-serif font-black leading-tight tracking-[-0.015em]">
                      The Daily Chronicle
                    </h2>
                  </div>


                </header>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="@container">
                <div className="flex flex-col gap-10 py-10 @[480px]:gap-12 @[864px]:flex-row items-center border-b border-[#e6e0db] dark:border-[#3a2d25] pb-16">
                  <div className="flex flex-col gap-8 @[480px]:min-w-[400px] @[480px]:gap-8 flex-1">
                    <div className="flex flex-col gap-4 text-left">
                    <span className="uppercase tracking-widest text-xs font-bold text-primary">
                      Limited Time Offer
                    </span>

                      <h1 className="text-[#181411] dark:text-white text-4xl font-serif font-black leading-[1.1] tracking-[-0.02em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-[1.1]">
                        The Daily Chronicle:
                        <br />
                        Print Edition
                      </h1>

                      <h2 className="text-[#181411] dark:text-gray-300 text-lg font-normal leading-relaxed max-w-[500px] font-display">
                        Quality Journalism, Delivered. Wake up to world-class
                        reporting. Enjoy the ritual of reading with our
                        award-winning print edition.
                      </h2>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex -space-x-2">
                          <div
                              className="h-8 w-8 rounded-full bg-gray-300 border-2 border-background-light dark:border-background-dark bg-cover"
                              data-alt="Portrait of a reader"
                              style={{
                                backgroundImage:
                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBxpTWDNR4cmRbFKlZyeYKcY9WEQ_zoL-YzGVpPegyHQruRBuoUNouMCPo5u-LpAX4XfwWTzm-Ccz5k-lYl0NlyqGmZp4CTocX06mE9VEbIVkZ00iQv8XPcNFvCx-pH53-2ma1nADntrknxXnNwxh_Ifye4UTxGHT8qI0sQ6X7yHQxbH1Sk44opdF0obfYA4P1z2kGdN3C-e2DGZPa7_r9UPjAK8BwmDjRYp_RAfQ3PzLK6barVPB1T5D6-pJR8WMf6gtMFL8ZPScw")',
                              }}
                          />
                          <div
                              className="h-8 w-8 rounded-full bg-gray-300 border-2 border-background-light dark:border-background-dark bg-cover"
                              data-alt="Portrait of a reader"
                              style={{
                                backgroundImage:
                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB89VyG67ESdDnlOlT_UEqWjcKCmjIjtvgE4XU5l7AiyAewQo2rsBpDARoIkpc1E73Gtp2WBwMPbFqdTsUZQY2C-lozgITyQKv3wxjvVhjPIyTa43HdgI57BvPwfLXjBuzqbwIQTyH_1THUrbW1UUxcMYvouLE6_5R6LBMAcqm4zwflfRnUa1yS3f3elXgOrw-ddBe0s_Pri00OeVXiLcIPryybLYANGVZJK9G-Ba1b5Aogjshokev7VPTXxUgQu7Pmj26cJbqTe1s")',
                              }}
                          />
                          <div
                              className="h-8 w-8 rounded-full bg-gray-300 border-2 border-background-light dark:border-background-dark bg-cover"
                              data-alt="Portrait of a reader"
                              style={{
                                backgroundImage:
                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBqOkoH7jVvsoPZRPhbgx7Rf3Pq-vD3t65aa0JWeObGqOci7MwrpH_-3jcJhwBFZ0rkeJt_J5MHkzwTMtWDyVzIcTF79yhQ6vGZp9t0VRNx9SIZgDQzR3cj65-WB2TynuHEb2wPIaWb5sb1wnWO5hnGtvpDtiC0g4rGlNcawP0TImtU0OdULLdKvNsPHkF_7VJOA_Bcp2vp_z_aQ74BElXkkEbu7jUC6u15tuGg6hTObG4djZlCJLq02YUQdeUmMtDYZ5w1wl6flAA")',
                              }}
                          />
                        </div>
                        <span className="text-sm font-medium text-[#897261] dark:text-gray-400">
                        Trusted by 2 million readers daily
                      </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                      <Link
                          href="/subscription/address"
                          className="flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary hover:bg-[#d55e0d] transition-colors text-white text-base font-bold leading-normal tracking-[0.015em] shadow-md shadow-primary/20"
                      >
                        <span className="truncate">Start order</span>
                      </Link>


                    </div>
                  </div>

                  <div className="w-full flex-1 flex justify-center items-center">
                    <div className="relative w-full max-w-[500px] aspect-[4/3] rounded-xl overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500 ease-out border-4 border-white dark:border-[#3a2d25]">
                      <div
                          className="w-full h-full bg-center bg-no-repeat bg-cover"
                          data-alt="Folded newspaper on a wooden table with morning coffee"
                          style={{
                            backgroundImage:
                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDjW1rdd8CiTckiaJLrWUF9EiL6O_FGfW-5V7XWTEUTw3IDuJD9lsR64sKxKX_msJi8XrKu5PiAtwMIXd3ZW6OCd6xiriu1PFZXBL4A9s2qFa4ZK0QIaw0xYCxywQak7NNhYm5jmv20w_nkJhpyvGfclYCFdOyAsBwMCXBcPajyVs0OAJ544FQfrzqECx5FfmTbWRGvJU8a3st1bNH-GPsqIRSUTIp9-CIN1d99ocr6gvP7Y2p19h2dkvdRDQ9MK6Yk9aeRiO6u8lo")',
                          }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-5 bg-white dark:bg-[#1a120b]">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex flex-col gap-10 py-16 @container">
                <div className="flex flex-col gap-4 text-center items-center">
                  <h2 className="text-[#181411] dark:text-white tracking-tight text-3xl font-serif font-bold leading-tight max-w-[720px]">
                    Why subscribe to print?
                  </h2>
                  <p className="text-[#897261] dark:text-gray-400 text-lg font-normal leading-normal max-w-[720px]">
                    Experience the tangible benefits of our daily edition.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Feature 1 */}
                  <div className="flex flex-col gap-4 p-6 rounded-xl bg-background-light dark:bg-[#221810] border border-[#e6e0db] dark:border-[#3a2d25] hover:shadow-lg transition-shadow duration-300">
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <span className="material-symbols-outlined text-3xl">
                      local_shipping
                    </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-[#181411] dark:text-white text-xl font-bold font-serif leading-tight">
                        Daily Delivery
                      </h3>
                      <p className="text-[#897261] dark:text-gray-400 text-sm font-normal leading-relaxed">
                        Your newspaper delivered to your doorstep every morning by
                        6 AM, rain or shine.
                      </p>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex flex-col gap-4 p-6 rounded-xl bg-background-light dark:bg-[#221810] border border-[#e6e0db] dark:border-[#3a2d25] hover:shadow-lg transition-shadow duration-300">
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <span className="material-symbols-outlined text-3xl">
                      menu_book
                    </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-[#181411] dark:text-white text-xl font-bold font-serif leading-tight">
                        Weekend Magazine
                      </h3>
                      <p className="text-[#897261] dark:text-gray-400 text-sm font-normal leading-relaxed">
                        Exclusive lifestyle, culture, and arts content every
                        Saturday and Sunday in glossy format.
                      </p>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex flex-col gap-4 p-6 rounded-xl bg-background-light dark:bg-[#221810] border border-[#e6e0db] dark:border-[#3a2d25] hover:shadow-lg transition-shadow duration-300">
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <span className="material-symbols-outlined text-3xl">
                      devices
                    </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-[#181411] dark:text-white text-xl font-bold font-serif leading-tight">
                        Digital Access
                      </h3>
                      <p className="text-[#897261] dark:text-gray-400 text-sm font-normal leading-relaxed">
                        Unlimited access to our website and mobile app included
                        complimentary with your subscription.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="@container">
                <div className="flex flex-col justify-center items-center gap-8 py-20 border-t border-[#e6e0db] dark:border-[#3a2d25]">
                  <div className="flex flex-col gap-4 text-center items-center max-w-[600px]">
                  <span className="material-symbols-outlined text-5xl text-primary">
                    newsmode
                  </span>
                    <h2 className="text-[#181411] dark:text-white text-4xl font-serif font-black leading-tight tracking-tight">
                      Journalism that matters.
                    </h2>
                    <p className="text-[#181411] dark:text-gray-300 text-lg font-normal leading-normal">
                      Join the community of informed readers today. Plans start at
                      just{" "}
                      <span className="font-bold text-primary">$8.99/week</span>.
                      Cancel anytime.
                    </p>
                  </div>

                  <div className="flex w-full justify-center">
                    <Link
                        href="/subscription/newspaper/print-edition"
                        className="flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-8 bg-primary hover:bg-[#d55e0d] transition-all text-white text-lg font-bold leading-normal tracking-[0.015em] shadow-lg hover:shadow-primary/30 transform hover:-translate-y-0.5"
                    >
                      <span className="truncate">View subscription options</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="w-full bg-[#f4f2f0] dark:bg-[#1a120b] border-t border-[#e6e0db] dark:border-[#3a2d25]">
            <div className="px-4 md:px-10 lg:px-40 flex justify-center py-5">
              <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                <footer className="flex flex-col gap-8 px-5 py-10 text-center md:text-left">
                  <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
                    <div className="flex flex-col gap-2 items-center md:items-start">
                      <h3 className="text-lg font-serif font-bold text-[#181411] dark:text-white">
                        The Daily Chronicle
                      </h3>
                      <p className="text-sm text-[#897261] dark:text-gray-400">
                        Quality journalism since 1923.
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                      <a
                          className="text-[#5c4d41] dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
                          href="#"
                      >
                        Support
                      </a>
                      <a
                          className="text-[#5c4d41] dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
                          href="#"
                      >
                        Privacy Policy
                      </a>
                      <a
                          className="text-[#5c4d41] dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
                          href="#"
                      >
                        Terms of Service
                      </a>
                      <a
                          className="text-[#5c4d41] dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
                          href="#"
                      >
                        Careers
                      </a>
                    </div>
                  </div>

                  <div className="h-px w-full bg-[#e6e0db] dark:bg-[#3a2d25]" />

                  <p className="text-[#897261] dark:text-gray-500 text-sm font-normal text-center">
                    © 2023 The Daily Chronicle. All rights reserved.
                  </p>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
