import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Briefcase, Shield, Zap, MessageCircle, Moon, Sun, Menu, X } from 'lucide-react';

const LandingPage = () => {
    const [isDark, setIsDark] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Check system preference or saved theme
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        if (newIsDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col text-foreground transition-colors duration-300">
            {/* Header */}
            <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold font-display">Campus Gigs</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={toggleTheme}>
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </Button>
                        <div className="h-6 w-px bg-border mx-2" />
                        <Link to="/login">
                            <Button variant="ghost">Sign In</Button>
                        </Link>
                        <Link to="/signup">
                            <Button>Get Started</Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex items-center gap-2 md:hidden">
                        <Button variant="ghost" size="icon" onClick={toggleTheme}>
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-b bg-background p-4 space-y-4 animate-in slide-in-from-top-2">
                        <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                            <Button variant="ghost" className="w-full justify-start">Sign In</Button>
                        </Link>
                        <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block">
                            <Button className="w-full">Get Started</Button>
                        </Link>
                    </div>
                )}
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-20 lg:py-32 px-4 text-center bg-gradient-to-b from-primary/5 to-background">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight font-display">
                            Find Gigs on Campus <span className="text-primary">Instantly</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            The safe, verified marketplace for students. Get tasks done or earn extra cash between classes.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                            <Link to="/signup">
                                <Button size="lg" className="h-12 px-8 text-lg rounded-full w-full sm:w-auto">
                                    Start Earning
                                </Button>
                            </Link>
                            <Link to="/signup">
                                <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full w-full sm:w-auto">
                                    Post a Job
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-20 px-4 bg-muted/30">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">Why Students Love Us</h2>
                            <p className="text-muted-foreground">Built for the unique needs of campus life.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/50 hover:border-primary/50 transition-colors">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Verified Students</h3>
                                <p className="text-muted-foreground">Only students with valid .edu emails can join. Safe, trusted interactions.</p>
                            </div>
                            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/50 hover:border-primary/50 transition-colors">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Fast & Secure</h3>
                                <p className="text-muted-foreground">Post a job in seconds. Get paid directly upon completion.</p>
                            </div>
                            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/50 hover:border-primary/50 transition-colors">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                                    <MessageCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Direct Chat</h3>
                                <p className="text-muted-foreground">Negotiate details and share updates instantly with built-in messaging.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it Works */}
                <section className="py-20 px-4">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold">How it Works</h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                                    <div>
                                        <h3 className="text-lg font-bold">Post a Gig</h3>
                                        <p className="text-muted-foreground">Describe what you need done and set your budget.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                                    <div>
                                        <h3 className="text-lg font-bold">Get Offers</h3>
                                        <p className="text-muted-foreground">Qualified students on campus apply to help you.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                                    <div>
                                        <h3 className="text-lg font-bold">Done & Paid</h3>
                                        <p className="text-muted-foreground">Review the work, release payment, and leave a clear rating.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-muted rounded-3xl p-8 h-96 flex items-center justify-center text-muted-foreground relative overflow-hidden group">
                            {/* Decorative generic UI representation */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
                            <div className="relative bg-card p-6 rounded-xl shadow-lg w-64 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                    <div className="h-2 w-20 bg-gray-200 rounded" />
                                </div>
                                <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                                <div className="h-4 w-3/4 bg-gray-200 rounded mb-4" />
                                <div className="flex justify-between items-center mt-4">
                                    <div className="h-8 w-20 bg-primary/20 rounded" />
                                    <div className="h-8 w-8 bg-primary rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t py-12 bg-muted/20">
                <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground text-sm">
                    <div className="flex justify-center gap-6 mb-8">
                        <Link to="/terms" className="hover:text-primary">Terms</Link>
                        <Link to="/privacy" className="hover:text-primary">Privacy</Link>
                        <Link to="/safety" className="hover:text-primary">Safety</Link>
                    </div>
                    <p>&copy; {new Date().getFullYear()} Campus Gigs. Built for students, by a student.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
