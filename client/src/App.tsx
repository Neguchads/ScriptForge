import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppLayout from "./components/AppLayout";
import Home from "./pages/Home";
import LyricsGenerator from "./pages/LyricsGenerator";
import StyleGenerator from "./pages/StyleGenerator";
import FullSongCreator from "./pages/FullSongCreator";
import ImageGenerator from "./pages/ImageGenerator";
import AudioLab from "./pages/AudioLab";
import AIChat from "./pages/AIChat";
import Library from "./pages/Library";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Export from "./pages/Export";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/lyrics" component={LyricsGenerator} />
        <Route path="/style" component={StyleGenerator} />
        <Route path="/fullsong" component={FullSongCreator} />
        <Route path="/image" component={ImageGenerator} />
        <Route path="/audiolab" component={AudioLab} />
        <Route path="/chat" component={AIChat} />
        <Route path="/library" component={Library} />
        <Route path="/explore" component={Explore} />
        <Route path="/profile" component={Profile} />
        <Route path="/export" component={Export} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
