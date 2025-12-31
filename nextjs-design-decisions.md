# Next.js Design Decisions: Newspaper Subscription Shop (ABO Shop)

**Version:** Phase 1  
**Context:** Digitalization of Print Subscriptions

---

## 1. Architectural & Design Decisions

We chose **Next.js 14+ with the App Router** for this project. You need a framework that supports modern e-commerce requirements like speed and SEO.

### Framework Selection
We use the `app/` directory structure. It gives you better layout nesting. This is critical for our subscription wizard where you need a persistent progress bar while the main content changes. The App Router also makes React Server Components (RSC) the default. This keeps your client bundle small because you only send JavaScript when you need interactivity.

### Styling Strategy
We use **Tailwind CSS**. It speeds up development by letting you write styles directly in your markup. You can see this in our `ConfigurePage` where we use utility classes for grid layouts and colors. Tailwind also makes Dark Mode easy. You just add `dark:` modifiers. It builds a tiny CSS file that only includes the styles you actually use.

### State Management
We use a hybrid approach combining Context API with persistent storage.
*   **Global State (Context API):** `useAppContext` manages critical session data (`currentUser`, `currentSubscription`, `selectedVersion`) across the wizard steps.
*   **Persistence Layer:** To prevent data loss on page refresh or navigation, we implemented a **synchronous storage pattern**:
    *   **Wrappers:** Custom setters (e.g., `setCurrentUser`) update both React state and `sessionStorage` simultaneously.
    *   **Lazy Initialization:** State initializes directly from `sessionStorage` on mount, ensuring data survives browser navigation.
*   **Local State:** Complex UI logic, such as toggling between "Daily" and "Weekend" options in `ConfigurePage`, remains local to keep the app responsive.

### Business Logic Separation
We separate business rules from UI code. You will find pricing and validation logic (like the "Berlin = Post Delivery" rule) in `lib/Api` and `Database.js`. This makes your React components cleaner. It also lets you test the rules without running the whole app.

---

## 2. Rendering Strategy

We use **Hybrid Rendering**. This gives you a fast initial load and a responsive interface.

### React Server Components (RSC)
We use these for the Root Layouts and Marketing Pages. The server renders the HTML shell and metadata. You get the content fast, and the browser downloads less code.

### Client Components
We use the `use client` directive for the Subscription Wizard steps. You need this for interactivity. The `ConfigurePage` has to calculate valid delivery methods in real-time based on your input. It also gives you immediate feedback when you select an option.

### Static Generation (SSG)
We pre-build pages that do not change often, like the Privacy Policy and Landing Page. This means they load instantly for every user.

---

## 3. Route Structure

We organized the routes to match the user journey.

### File Tree

app/  
├── layout.tsx # Root layout (Fonts, SEO Metadata) \
├── page.tsx # Landing Page (Marketing) \
├── subscription/ # Subscription Domain \
│ ├── layout.tsx # Wizard Layout (Progress Bar)\
│ ├── address/ # Step 1: Delivery Area Check\
│ │ └── page.tsx # (Client) Input PLZ -> Validate\
│ ├── configure/ # Step 2: Product Customization\
│ │ └── page.tsx # (Client) Select Edition, Frequency\
│ ├── register/ # Step 3: User Account Creation\
│ │ └── page.tsx # (Client) Personal Data\
│ ├── checkout/ # Step 4: Payment\
│ │ └── page.tsx # (Client) Process Checkout\
│ ├── confirmation/ # Step 5: Confirmation\
│ │ └── page.tsx # (Server) Summary & Submit\
└── api/ # Next.js Route Handlers

### Key Routing Decisions
*   **Safe Navigation:** In the `ConfigurePage`, we utilize a `setTimeout` of 0ms before routing (`router.push`). This pushes navigation to the end of the event loop, ensuring React state and `sessionStorage` fully commit before the next page loads.
*   **Route Guards:** The `CheckoutPage` implements a robust client-side guard. It checks for missing data (`currentUser` or `subscription`) and redirects to the start if necessary. This logic resides in a `useEffect` to avoid React "cannot update during render" errors.
*   **Layout Grouping:** The `subscription` folder shares a layout. This lets us show the checkout steps (Progress Bar) on every page in that section without repeating code.

---

## 4. SEO & Performance Plan

You need people to find the site and have a good experience when they do.

### Search Engine Optimization (SEO)
Even though the checkout flow is behind user interaction, search engines need to read your landing pages.
*   **Metadata API:** We use Next.js's Metadata API to set dynamic titles and descriptions in `layout.tsx`.
*   **Semantic HTML:** We use real tags like `<button>`, `<section>`, and `<h1>`. Search engines understand this structure better than a pile of `div`s.
*   **Structured Data:** We will add Product schema (JSON-LD) to the homepage. This helps Google show your pricing directly in search results.

### Performance Optimization
*   **Code Splitting:** Next.js splits the code automatically. You do not download the checkout logic until you actually go to the checkout.
*   **Image Optimization:** We use the `<Image />` component. It serves the right size image for your device (WebP format) and prevents the page from jumping around as it loads.
*   **Memoization:** We wrap heavy calculations in `useMemo`. This stops the app from freezing on slower phones when you type or click.
*   **Loading UI:** We show a loading skeleton while the app checks your address. You know something is happening, which reduces bounce rates.