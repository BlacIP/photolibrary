'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('auth/login', { email, password });
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 flex items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 md:grid-cols-2 items-center">
        <Card className="shadow-xl border border-border/80">
          <CardContent className="p-8">
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Studio Manager</p>
                <h1 className="text-2xl font-bold leading-tight">Welcome back</h1>
                <p className="text-sm text-muted-foreground">
                  Sign in to manage client galleries, uploads, and settings.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm text-muted-foreground underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                Having trouble? <a className="underline underline-offset-4" href="mailto:hello@yourstudio.com">Contact support</a>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="relative hidden overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-primary/10 via-primary/5 to-background md:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.06),transparent_30%)]" />
          <div className="relative h-full px-8 py-10 flex flex-col justify-between text-foreground">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Photo Library</p>
              <h2 className="text-3xl font-semibold leading-tight">
                Curate, deliver, and manage every client gallery in one place.
              </h2>
              <p className="text-sm text-muted-foreground">
                Upload sets, generate share links, and keep clients in the loop. Built for studios who want speed and polish.
              </p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Seamless uploads to Cloudinary
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Client-safe sharing and access control
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Real-time storage insights
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
