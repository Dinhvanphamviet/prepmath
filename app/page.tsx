import Header from "./_components/Header";
import Hero from "./_components/Hero";
import Features from "./_components/Features"; // Course Catalog
import ProgressDemo from "./_components/ProgressDemo";
import EnrollmentCTA from "./_components/EnrollmentCTA";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-background min-h-screen">
      <Header />
      <Hero />
      <ProgressDemo />
      <Features />
      {/* Testimonials removed as requested */}
      <EnrollmentCTA />

      {/* Simple Footer */}
      <footer className="py-8 text-center text-muted-foreground text-sm border-t border-border">
        © 2025 PrepMath. Thiết kế với 🤍 bởi Đinh Việt.
      </footer>
    </div >
  );
}
