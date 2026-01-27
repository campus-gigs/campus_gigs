import React from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const PrivacyPolicyPage = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            <ArrowLeft className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                            Back to Home
                        </span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary" />
                        <span className="font-bold text-lg font-display">Campus Gigs</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold font-display mb-2">Privacy Policy</h1>
                <p className="text-muted-foreground mb-8">Last Updated: January 2026</p>

                <div className="space-y-8 text-foreground/90 leading-relaxed">
                    <section className="bg-card p-8 rounded-2xl border shadow-sm">
                        <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-primary">A. Account Information</h3>
                            <p>
                                When you register, we collect your Name, University Email Address (.edu),
                                Password (hashed), and OPTIONAL Profile details (Bio, Phone Number, Profile Picture).
                            </p>

                            <h3 className="font-semibold text-lg text-primary">B. Usage Data</h3>
                            <p>
                                We collect data on the Gigs you post or apply for, chat messages sent via our platform
                                (for safety monitoring), and reviews you receive.
                            </p>
                        </div>
                    </section>

                    <section className="bg-card p-8 rounded-2xl border shadow-sm">
                        <h2 className="text-2xl font-bold mb-4">2. How We Use Your Data</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To verify your student status.</li>
                            <li>To match you with relevant Gigs and Workers.</li>
                            <li>To send important account notifications (Verification codes, Job alerts).</li>
                            <li>To enforce our Terms of Service (e.g., preventing spam).</li>
                        </ul>
                    </section>

                    <section className="bg-card p-8 rounded-2xl border shadow-sm">
                        <h2 className="text-2xl font-bold mb-4">3. Data Sharing & Security</h2>
                        <p className="mb-4">
                            We do <strong>not</strong> sell your personal data to third parties.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Public Profile:</strong> Your Name, Bio, and Rating are visible to other users
                                on the platform to facilitate trust. Your email is private until a Gig is accepted.
                            </li>
                            <li>
                                <strong>Security:</strong> We use industry-standard encryption (BCrypt) for passwords
                                and secure JWT tokens for session management.
                            </li>
                        </ul>
                    </section>

                    <section className="bg-card p-8 rounded-2xl border shadow-sm">
                        <h2 className="text-2xl font-bold mb-4">4. Your Rights</h2>
                        <p className="mb-4">You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Access the personal data we hold about you (via your Profile).</li>
                            <li>Request correction of inaccurate data.</li>
                            <li>Request deletion of your account (Contact Support or use the Delete option in Settings).</li>
                        </ul>
                    </section>

                    <div className="pt-8 text-center">
                        <p className="text-muted-foreground mb-4">Concerns about your privacy?</p>
                        <Button variant="outline" asChild>
                            <a href="mailto:privacy@campusgigs.site">Contact Privacy Officer</a>
                        </Button>
                    </div>
                </div>
            </main>

            <footer className="border-t py-12 bg-card mt-12">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Campus Gigs. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default PrivacyPolicyPage;
