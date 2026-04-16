import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { toast } from 'sonner';

interface FormValues {
  email: string;
  password: string;
  confirmPassword?: string;
}

function SignInForm() {
  const { signIn } = useAuth();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    try {
      await signIn(data.email, data.password);
      toast.success('Signed in successfully!');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="you@example.com"
          {...register('email', { required: true })}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          type="password"
          placeholder="••••••"
          {...register('password', { required: true })}
        />
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
      >
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}

function SignUpForm() {
  const { signUp } = useAuth();
  const { register, handleSubmit, watch, formState: { isSubmitting, errors } } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    try {
      await signUp(data.email, data.password);
      toast.success('Account created! Welcome aboard!');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="you@example.com"
          {...register('email', { required: 'Email is required' })}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="Min. 6 characters"
          {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
        />
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="signup-confirm">Confirm Password</Label>
        <Input
          id="signup-confirm"
          type="password"
          placeholder="••••••"
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (val) => val === watch('password') || 'Passwords do not match',
          })}
        />
        {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
      >
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
}

export default function AuthScreen({ onClose }: { onClose?: () => void }) {
  const { playAsGuest } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl mb-6 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
      <Card className="w-full max-w-sm border-amber-300 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-amber-900">Welcome, Explorer!</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="signin" className="flex-1">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <SignInForm />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <button
        onClick={() => { playAsGuest(); onClose?.(); }}
        className="mt-4 text-sm text-amber-700 underline hover:text-amber-900"
      >
        Continue as Guest
      </button>
    </div>
  );
}
