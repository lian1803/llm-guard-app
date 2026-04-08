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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock login
      if (email && password) {
        toast.success('Login successful');
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1117] to-[#161b22] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader className="text-center">
            <div className="text-4xl font-bold text-[#00ff88] mb-4">LLM Guard</div>
            <CardTitle>Sign In to Your Account</CardTitle>
            <p className="text-sm text-[#8b949e] mt-2">
              Welcome back! Please enter your details.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-[#8b949e]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2 bg-[#0d1117] border-[#30363d]"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#00ff88] text-[#0d1117] font-bold"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#30363d]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#161b22] text-[#6e7681]">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-[#30363d] text-[#8b949e]"
            >
              Continue with GitHub
            </Button>

            <p className="text-center text-sm text-[#6e7681] mt-6">
              Do not have an account?{' '}
              <Link href="/auth/signup" className="text-[#00ff88] hover:underline">
                Sign up
              </Link>
            </p>

            <p className="text-center text-xs text-[#6e7681] mt-4">
              By signing in, you agree to our{' '}
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
  );
}
