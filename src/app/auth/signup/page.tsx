'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // Mock signup
      if (formData.name && formData.email && formData.password) {
        toast.success('Account created successfully');
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    'Real-time cost tracking',
    'Agent loop detection',
    'Multi-project budgets',
    'Slack & Email alerts',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1117] to-[#161b22] flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Features */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hidden md:block">
              <h2 className="text-3xl font-bold mb-6">Get Started Today</h2>
              <div className="space-y-4">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#00ff88]/20 flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-[#00ff88]" />
                    </div>
                    <span className="text-[#8b949e]">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
                <p className="text-sm text-[#6e7681] mb-2">Trusted by teams at:</p>
                <p className="text-[#8b949e]">Anthropic, OpenAI, DeepSeek...</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-[#161b22] border-[#30363d]">
              <CardHeader className="text-center">
                <div className="text-4xl font-bold text-[#00ff88] mb-4">LLM Guard</div>
                <CardTitle>Create Your Account</CardTitle>
                <p className="text-sm text-[#8b949e] mt-2">
                  Protect your LLM API spend in minutes
                </p>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-[#8b949e]">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-2 bg-[#0d1117] border-[#30363d]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-[#8b949e]">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-2 bg-[#0d1117] border-[#30363d]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-[#8b949e]">
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="mt-2 bg-[#0d1117] border-[#30363d]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-[#8b949e]">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="mt-2 bg-[#0d1117] border-[#30363d]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#00ff88] text-[#0d1117] font-bold"
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#30363d]" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#161b22] text-[#6e7681]">Or sign up with</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-[#30363d] text-[#8b949e]"
                >
                  Continue with GitHub
                </Button>

                <p className="text-center text-sm text-[#6e7681] mt-6">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-[#00ff88] hover:underline">
                    Sign in
                  </Link>
                </p>

                <p className="text-center text-xs text-[#6e7681] mt-4">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="underline hover:text-[#8b949e]">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="underline hover:text-[#8b949e]">
                    Privacy Policy
                  </a>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
