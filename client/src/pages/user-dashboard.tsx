import { UserNavbar } from "@/components/ui/user-navbar";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, LogIn, UserPlus, Edit, Key } from "lucide-react";
import { Route, useLocation } from "wouter";
import Consulta from "./consulta";
import Entrenamiento from "./entrenamiento";
import Agente from "./agente";

function DashboardContent({ user }: { user: any }) {
  return (
    <>
      {/* Welcome Card */}
      <Card className="mb-8">
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-5">
              <h3 className="text-lg font-medium text-gray-900">Welcome back!</h3>
              <p className="text-sm text-gray-500">
                You're logged in as <span className="font-medium" data-testid="text-current-user">{user?.email}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Member since <span data-testid="text-join-date">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900" data-testid="text-account-email">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="text-sm text-gray-900">User</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm text-gray-900">
                  <Badge className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <LogIn className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-900">Logged in</span>
                <span className="text-gray-500 ml-auto">Just now</span>
              </div>
              <div className="flex items-center text-sm">
                <UserPlus className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-900">Account created</span>
                <span className="text-gray-500 ml-auto">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Actions */}
      <Card className="mt-8">
        <CardContent className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-update-profile"
            >
              <Edit className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
            <Button 
              variant="secondary"
              data-testid="button-change-password"
            >
              <Key className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default function UserDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <UserNavbar className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-gray-700" data-testid="text-user-email">{user?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  const { apiRequest } = await import("@/lib/queryClient");
                  await apiRequest("POST", "/api/auth/logout");
                  window.location.href = '/';
                } catch (error) {
                  console.error('Logout error:', error);
                  window.location.href = '/';
                }
              }}
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {location === "/dashboard" && <DashboardContent user={user} />}
        <Route path="/dashboard/consulta" component={Consulta} />
        <Route path="/dashboard/entrenamiento" component={Entrenamiento} />
        <Route path="/dashboard/agente" component={Agente} />
      </div>
    </div>
  );
}
