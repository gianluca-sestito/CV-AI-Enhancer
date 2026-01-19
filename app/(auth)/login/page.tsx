import { redirect } from "next/navigation";
import { getSession } from "@/lib/supabase/auth";
import LoginForm from "./components/LoginForm";
import { Sparkles, TrendingUp, Award } from "lucide-react";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/profile");
  }

  return (
    <div className="flex min-h-screen">
      {/* Decorative Panel - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-mesh relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 lg:p-16 xl:p-20 text-white">
          <div className="animate-fade-in-up">
            <h2 className="text-5xl xl:text-6xl font-display font-bold mb-6">
              Craft Your<br />Professional Story
            </h2>
            <p className="text-xl opacity-90 max-w-md">
              AI-powered CV enhancement that amplifies your unique experience and maximizes your job matches.
            </p>
          </div>

          <div className="space-y-6 animate-fade-in-up stagger-2">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">AI-Tailored Content</h3>
                <p className="text-white/80">Automatically adapt your CV for each opportunity</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Match Score Analysis</h3>
                <p className="text-white/80">Know exactly how you align with job requirements</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Professional Polish</h3>
                <p className="text-white/80">Multiple themes and customization options</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-background">
        <main className="w-full max-w-md space-y-8 py-12 animate-fade-in-up stagger-1">
          <header className="text-center">
            <h1 className="text-4xl lg:text-5xl font-display font-bold mb-3">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-lg">
              Sign in to continue crafting your story
            </p>
          </header>
          <LoginForm />
        </main>
      </div>
    </div>
  );
}

