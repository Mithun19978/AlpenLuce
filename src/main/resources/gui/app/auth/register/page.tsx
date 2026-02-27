'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { userApi } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    gender: '1',
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await userApi.register({
        username: form.username,
        email: form.email,
        mobileNumber: form.mobileNumber,
        password: form.password,
        gender: parseInt(form.gender, 10),
      });
      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => router.push('/auth/login'), 1500);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">Join AlpenLuce</p>
          <h1 className="text-3xl font-black">Create Account</h1>
          <p className="text-white/40 text-sm mt-2">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-gold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 px-4 py-3 bg-gold/10 border border-gold/30 rounded-lg text-gold text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              value={form.username}
              onChange={set('username')}
              placeholder="your_username"
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Mobile Number"
              type="tel"
              value={form.mobileNumber}
              onChange={set('mobileNumber')}
              placeholder="+1 555 000 0000"
              required
            />

            {/* Gender */}
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Gender</label>
              <select
                value={form.gender}
                onChange={set('gender')}
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
              >
                <option value="1">Male</option>
                <option value="2">Female</option>
                <option value="3">Other</option>
              </select>
            </div>

            <div className="relative">
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="Min 8 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-9 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Input
              label="Confirm Password"
              type={showPw ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              placeholder="Repeat password"
              required
            />

            <Button type="submit" variant="gold" className="w-full mt-2" loading={loading}>
              Create Account
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
