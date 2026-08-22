import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col selection:bg-blue-100 selection:text-blue-700">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
