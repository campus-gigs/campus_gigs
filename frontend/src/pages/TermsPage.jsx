import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">Terms and Conditions</CardTitle>
                        <p className="text-muted-foreground">Last Updated: January 27, 2026</p>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none space-y-6">
                        <p>By accessing or using Campus Gigs, you agree to these Terms & Conditions. If you do not agree, do not use the app.</p>

                        <section>
                            <h3 className="text-xl font-semibold">1. About Campus Gigs</h3>
                            <p>Campus Gigs is a student job marketplace platform that connects:</p>
                            <ul className="list-disc pl-6">
                                <li>Students seeking part-time gigs, internships, or tasks</li>
                                <li>Individuals or organizations offering such opportunities</li>
                            </ul>
                            <p>We only act as an intermediary and do not guarantee jobs, payments, or outcomes.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold">2. Eligibility</h3>
                            <ul className="list-disc pl-6">
                                <li>You must be 18 years or older</li>
                                <li>You must provide accurate and complete information</li>
                                <li>Fake profiles, impersonation, or misuse will result in account termination</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold">3. User Responsibilities</h3>
                            <p>You agree to:</p>
                            <ul className="list-disc pl-6">
                                <li>Use the app for lawful purposes only</li>
                                <li>Not post fake, misleading, illegal, or abusive content</li>
                                <li>Not scam, harass, threaten, or exploit other users</li>
                                <li>Handle payments, work, and communication at your own risk</li>
                            </ul>
                            <p>You are fully responsible for your interactions on the platform.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold">4. Job Listings & Payments</h3>
                            <p>Campus Gigs does not verify every job post or employer. We are not responsible for:</p>
                            <ul className="list-disc pl-6">
                                <li>Non-payment</li>
                                <li>Partial payment</li>
                                <li>Work disputes</li>
                                <li>Fraud or scams</li>
                            </ul>
                            <p>All payments and work terms are strictly between users.</p>
                            <p className="font-semibold text-yellow-600 dark:text-yellow-400">👉 Always verify before accepting or offering a gig.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold">5. No Employment Relationship</h3>
                            <p>Campus Gigs is not an employer. We do not provide salaries, insurance, benefits, or guarantees. Any agreement formed is between users only.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold">6. Prohibited Activities</h3>
                            <p>You must NOT:</p>
                            <ul className="list-disc pl-6">
                                <li>Post illegal, adult, or harmful jobs</li>
                                <li>Collect personal data for misuse</li>
                                <li>Bypass platform security</li>
                                <li>Use bots, scrapers, or automation</li>
                                <li>Attempt to damage or hack the app</li>
                            </ul>
                            <p>Violation may lead to permanent ban and legal action.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold">7. Account Suspension & Termination</h3>
                            <p>We reserve the right to:</p>
                            <ul className="list-disc pl-6">
                                <li>Suspend or terminate accounts without notice</li>
                                <li>Remove any content violating these terms</li>
                                <li>Block access to protect users and the platform</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold">8. Limitation of Liability</h3>
                            <p>Campus Gigs is not liable for:</p>
                            <ul className="list-disc pl-6">
                                <li>Financial loss</li>
                                <li>Data loss</li>
                                <li>Job loss</li>
                                <li>Physical, emotional, or legal damages</li>
                                <li>Actions of other users</li>
                            </ul>
                            <p>Use the app at your own risk.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold">9. Data & Privacy</h3>
                            <p>We collect basic data to operate the platform. We do not sell personal data intentionally. Full details are covered under our Privacy Policy.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold">10. Changes to Terms</h3>
                            <p>We may update these Terms anytime. Continued use of the app means you accept the updated terms.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold">11. Governing Law</h3>
                            <p>These Terms are governed by the laws of India. Any disputes fall under Indian jurisdiction.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold">12. Contact</h3>
                            <p>For questions or issues:</p>
                            <p>📧 campusgigs2@gmail.com</p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TermsPage;
