import { redirect } from "next/navigation";
import { getSession } from "@/lib/supabase/auth";
import RegisterForm from "./components/RegisterForm";

export default async function RegisterPage() {
  const session = await getSession();
  
  if (session) {
    redirect("/profile");
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 sm:space-y-8 p-4 sm:p-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">CV AI Enhancer</h1>
          <p className="mt-2 text-muted-foreground">
            Create your account
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}

