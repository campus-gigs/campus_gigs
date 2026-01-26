import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

const SafetyTipsPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="w-8 h-8 text-primary" />
                            <CardTitle className="text-3xl font-bold">Safety Tips & Disclaimer</CardTitle>
                        </div>
                        <p className="text-muted-foreground">Stay safe while using Campus Gigs</p>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none space-y-8">

                        <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                            <h3 className="text-xl font-semibold text-destructive flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> Disclaimer
                            </h3>
                            <p className="mt-2 text-sm text-foreground/80">
                                Campus Gigs acts solely as a connector between students and opportunity providers. We do not vet every individual or organization.
                                <strong> We accept no liability for financial loss, safety incidents, or disputes arising from platform use.</strong> You are responsible for your own safety and due diligence.
                            </p>
                        </div>

                        <section>
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" /> Best Practices for Students
                            </h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Never pay to get a job:</strong> Legitimate employers will never ask you for money for "registration fees", "training kits", or "access".</li>
                                <li><strong>Meet in public places:</strong> If a gig requires meeting in person, always choose a safe, public location (like the campus library or cafeteria).</li>
                                <li><strong>Protect your personal info:</strong> Do not share sensitive documents (ID proof, bank details) until you have verified the employer's identity.</li>
                                <li><strong>Keep communication on platform:</strong> Try to use the built-in chat for initial discussions to keep a record.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-blue-500" /> Best Practices for Job Posters
                            </h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Be clear about requirements:</strong> State exactly what is needed and what the pay is.</li>
                                <li><strong>Respect privacy:</strong> Do not use applicant data for anything other than the hiring process.</li>
                                <li><strong>Pay fairly and on time:</strong> Build a good reputation by treating students fairly.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold">Reporting Suspicious Activity</h3>
                            <p>If you encounter a scam, harassment, or any suspicious activity, please report it immediately via the "Report" button on the job/profile or email us at:</p>
                            <p>📧 campusgigs2@gmail.com</p>
                        </section>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SafetyTipsPage;
