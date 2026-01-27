import React from 'react';
import { ArrowLeft, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const TermsPage = () => {
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
                        <Scale className="w-5 h-5 text-primary" />
                        <span className="font-bold text-lg font-display">Campus Gigs</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold font-display mb-2">Terms of Service</h1>
                <p className="text-muted-foreground mb-8">Last Updated: January 2026</p>

                <div className="space-y-8 text-foreground/90 leading-relaxed">
                    <section className="bg-card p-8 rounded-2xl border shadow-sm">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">1</span>
                            Acceptance of Terms
                        </h2>
                        <p className="mb-4">
                            By accessing or using Campus Gigs ("the Platform"), you agree to be bound by these Terms of Service.
                            The Platform is exclusively for verifiable students of accredited universities.
                        </p>
                        <p>
                            If you do not agree to these terms, you may not access or use the Platform.
                        </p>
                    </section>

                    <section className="bg-card p-8 rounded-2xl border shadow-sm">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">2</span>
                            User Eligibility
                        </h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>You must be at least 18 years old.</li>
                            <li>You must possess a valid <strong>.edu</strong> email address from a recognized institution.</li>
                            <li>You typically maintain "Student" status. Alumni may use the platform at the discretion of administrators.</li>
                            <li>One account per person only.</li>
                        </ul>
                    </section>

                    <section className="bg-card p-8 rounded-2xl border shadow-sm">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">3</span>
                            Job Posting & Content
                        </h2>
                        <p className="mb-4">Users may post "Gigs" or tasks for other students. Content must NOT include:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Academic dishonesty (e.g., writing essays for others, cheating on exams).</li>
                            <li>Illegal activities or goods (drugs, weapons, etc.).</li>
                            <li>Hate speech, harassment, or adult content.</li>
                            <li>Spam or multi-level marketing schemes.</li>
                        </ul>
                        <p className="mt-4 text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                            <strong>Note:</strong> We strictly prohibit "Academic Cheating" services. Any user found soliciting or providing coursework completion will be permanently banned.
                        </p>
                    </section>

                    <section className="bg-card p-8 rounded-2xl border shadow-sm">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">4</span>
                            Payments & Safety
                        </h2>
                        <p className="mb-4">
                            Campus Gigs connects users but does not currently process payments directly.
                            Payments are settled offline or via third-party apps (Venmo, UPI, Zelle) between users.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Verification:</strong> Always verify the task completion before sending money.</li>
                            <li><strong>Meeting:</strong> For physical tasks, meet in public, safe locations on campus.</li>
                            <li><strong>Liability:</strong> Campus Gigs is not liable for any disputes, financial loss, or interactions between users. Use the platform at your own risk.</li>
                        </ul>
                    </section>

                    <section className="bg-card p-8 rounded-2xl border shadow-sm">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">5</span>
                            Termination
                        </h2>
                        <p>
                            We reserve the right to suspend or terminate your account at our sole discretion, without notice,
                            for conduct that we believe violates these Terms or is harmful to other users, us, or third parties,
                            or for any other reason.
                        </p>
                    </section>

                    <div className="pt-8 text-center">
                        <p className="text-muted-foreground mb-4">Questions about these terms?</p>
                        <Button variant="outline" asChild>
                            <a href="mailto:support@campusgigs.site">Contact Support</a>
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

export default TermsPage;
