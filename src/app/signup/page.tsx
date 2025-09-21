import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/ui';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              required
            />
            <Button className="w-full" type="submit">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-black hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
