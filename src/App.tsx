import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LoaderPage from "@/pages/loader";
import LoginPage from "@/pages/login";
import Begin from "@/pages/signup/begin";
import IrisSignup from "@/pages/signup/signup";
import ProfileChoose from "@/pages/signup/profile_cchoose";
import ConnectApp from "@/pages/signup/connect_app";
import GoodbyePage from "@/pages/goodbye";
import HomePage from "@/pages/home";
import EmailsPage from "@/pages/emails";
import TasksPage from "@/pages/tasks";
import AnalysisPage from "@/pages/analysis";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/context/AuthContext";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return null;
  if (!token) return <Redirect to="/login" />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoaderPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/begin" component={Begin} />
      <Route path="/signup" component={IrisSignup} />
      <Route path="/profile-choose" component={ProfileChoose} />
      <Route path="/ConnectApp" component={ConnectApp} />
      <Route path="/goodbye" component={GoodbyePage} />
      <Route path="/HomePage" component={HomePage} />
      <Route path="/home">
        <ProtectedRoute>
          <AppLayout>
            <HomePage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/emails">
        <ProtectedRoute>
          <AppLayout>
            <EmailsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/tasks">
        <ProtectedRoute>
          <AppLayout>
            <TasksPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/analysis">
        <ProtectedRoute>
          <AppLayout>
            <AnalysisPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <WouterRouter hook={useHashLocation}>
            <AuthProvider>
              <Router />
            </AuthProvider>
          </WouterRouter>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
