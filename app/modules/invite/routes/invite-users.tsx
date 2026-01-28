import { useState } from "react";
import type { Route } from "./+types/invite-users";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { authApi, type UserRole } from "~/lib/api";
import { UserPlus, CheckCircle2, Loader2 } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Invite Users | LeadtechCRM" },
    { name: "description", content: "Invite new users to LeadtechCRM" },
  ];
}

export default function InviteUsers() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<UserRole>("customer_service");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await authApi.inviteUser({
        email,
        password,
        firstName,
        lastName: lastName || undefined,
        role,
      });
      setSuccess(`Successfully invited ${response.user.email} as ${response.user.role}`);
      // Reset form
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setRole("customer_service");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-4 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Invite Users</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Invite new team members to join LeadtechCRM.
          </p>
        </div>

        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            New User Invitation
          </CardTitle>
          <CardDescription>
            Fill in the details below to invite a new user to the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@leadtech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={role}
                onValueChange={(value: UserRole) => setRole(value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="customer_service">Customer Service</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Admin users have full access including inviting other users.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Invitation...
                </>
              ) : (
                "Send Invitation"
              )}
            </Button>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
