import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicyPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
                        <p className="text-muted-foreground">Last Updated: January 27, 2026</p>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none space-y-6">
                        <section>
                            <h3 className="text-xl font-semibold">1. Information We Collect</h3>
                            <p>We collect information you provide directly to us, including:</p>
                            <ul className="list-disc pl-6">
                                <li>Name and Email Address (for registration)</li>
                                <li>Profile Information (skills, bio)</li>
                                <li>Job Postings and Applications</li>
                                <li>Messages sent through our platform</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold">2. How We Use Your Information</h3>
                            <p>We use the information we collect to:</p>
                            <ul className="list-disc pl-6">
                                <li>Provide and maintain the Campus Gigs platform</li>
                                <li>Match students with potential gigs</li>
                                <li>Send notifications about jobs and messages</li>
                                <li>Prevent fraud and ensure safety</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold">3. Data Sharing</h3>
                            <p>We do not share your personal data with third parties except:</p>
                            <ul className="list-disc pl-6">
                                <li>With other users when you post a job or apply (e.g., viewing profiles)</li>
                                <li>When required by law</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold">4. Data Security</h3>
                            <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold">5. Contact Us</h3>
                            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                            <p>📧 campusgigs2@gmail.com</p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
