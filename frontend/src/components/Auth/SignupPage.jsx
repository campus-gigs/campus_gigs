import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { authAPI } from '../../utils/api';
import { toast } from 'sonner';

const SignupPage = () => {
  const [step, setStep] = useState('signup'); // 'signup' or 'otp'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize from navigation state (e.g. redirected from login)
  React.useEffect(() => {
    if (location.state?.step) {
      setStep(location.state.step);
    }
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!agreeTerms) {
      toast.error('You must agree to the Terms & Conditions');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.register(name, email, password);
      toast.success('OTP sent to your email!');
      setStep('otp');
    } catch (error) {
      const msg = error.response?.data?.msg || 'Registration failed';
      toast.error(msg);

      if (msg === "User already exists") {
        toast.message("Account exists but unverified?", {
          description: "Click here to verify your email.",
          action: {
            label: "Verify OTP",
            onClick: () => {
              // Trigger Resend OTP then switch to OTP step
              authAPI.resendOtp(email).then(() => toast.success('New OTP sent!'));
              setStep('otp');
            }
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.verifyOtp(email, otp);
      localStorage.setItem('token', response.data.token);
      toast.success('Email verified! Welcome!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold font-display">Campus Gigs</span>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">
              {step === 'signup' ? 'Create an account' : 'Verify Email'}
            </CardTitle>
            <CardDescription>
              {step === 'signup'
                ? 'Join Campus Gigs to find or post jobs'
                : `Enter the OTP sent to ${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'signup' ? (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className="pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">College Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@vitstudent.ac.in"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className="pl-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="items-top flex space-x-2 my-4">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                    >
                      I agree to the <Link to="/terms" className="text-primary hover:underline" target="_blank">Terms</Link>, <Link to="/privacy" className="text-primary hover:underline" target="_blank">Privacy</Link>, and <Link to="/safety" className="text-primary hover:underline" target="_blank">Safety Tips</Link>.
                    </label>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Continue'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    className="text-center text-2xl tracking-widest"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify Email'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('signup')}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Change details?
                  </button>
                  <div className="mt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          setLoading(true);
                          await authAPI.resendOtp(email);
                          toast.success('OTP resent!');
                        } catch (err) {
                          toast.error('Failed to resend OTP');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>

            <div className="mt-2 text-center text-xs">
              <button
                type="button"
                onClick={() => setStep('otp')}
                className="text-muted-foreground hover:text-primary underline"
              >
                Account exists but unverified? Click here
              </button>
            </div>
          </CardContent>
        </Card>

        {step === 'signup' && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            Only VIT college emails (@vit.ac.in, @vitstudent.ac.in) are allowed
          </p>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
