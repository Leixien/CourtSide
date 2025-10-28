/**
 * Home Page
 * Landing page with featured matches and call-to-action
 */

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Play, MessageCircle, Bell, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Watch. Chat. Connect.
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Experience sports like never before with live scores, real-time chat,
            and instant notifications for your favorite players.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/matches"
              className="bg-primary-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-600 transition flex items-center justify-center space-x-2"
            >
              <Play className="w-6 h-6" />
              <span>Watch Live Matches</span>
            </Link>
            <Link
              href="/register"
              className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition border-2 border-gray-200 dark:border-slate-700"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Play className="w-10 h-10 text-primary-500" />}
            title="Live Scores"
            description="Real-time updates with scores, stats, and play-by-play action"
          />
          <FeatureCard
            icon={<MessageCircle className="w-10 h-10 text-primary-500" />}
            title="Live Chat"
            description="Join thousands of fans discussing matches in real-time"
          />
          <FeatureCard
            icon={<Bell className="w-10 h-10 text-primary-500" />}
            title="Player Alerts"
            description="Get instant notifications when your favorite players make a play"
          />
          <FeatureCard
            icon={<Users className="w-10 h-10 text-primary-500" />}
            title="Fan Community"
            description="Connect with passionate fans from around the world"
          />
          <FeatureCard
            icon={
              <svg
                className="w-10 h-10 text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            }
            title="Mobile Ready"
            description="Optimized experience on all devices, anywhere you go"
          />
          <FeatureCard
            icon={
              <svg
                className="w-10 h-10 text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            title="100% Free"
            description="No subscriptions, no paywalls. Free forever for all users"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-500 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to join the action?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Create your free account and never miss a moment
          </p>
          <Link
            href="/register"
            className="bg-white text-primary-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 CourtSide. Built with Next.js and deployed on Vercel.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-lg transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
