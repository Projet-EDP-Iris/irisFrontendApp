import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import HomePage from "@/pages/home";
import EmailsPage from "@/pages/emails";
import TasksPage from "@/pages/tasks";
import AnalysisPage from "@/pages/analysis";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeProvider } from "@/components/ThemeProvider";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/home">
        <AppLayout>
          <HomePage />
        </AppLayout>
      </Route>
      <Route path="/emails">
        <AppLayout>
          <EmailsPage />
        </AppLayout>
      </Route>
      <Route path="/tasks">
        <AppLayout>
          <TasksPage />
        </AppLayout>
      </Route>
      <Route path="/analysis">
        <AppLayout>
          <AnalysisPage />
        </AppLayout>
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
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
