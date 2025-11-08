"use client";

/* NEXT */
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

/* PLUGINS */
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, getSession } from "next-auth/react";
import { SubmitHandler, useForm } from "react-hook-form";

/* COMPONENTS */
import { Button } from "@/app/_components/ui/Button";
import { Input } from "@/app/_components/ui/Input";
import { Label } from "@/app/_components/ui/Label";

/* ICONS */
import { Eye, EyeOff, Loader2 } from "lucide-react";

/* SCHEMAS */
import { login_schema, LoginFormData } from "@/app/_schema/auth.schema";

/* ENTITIES */
import { AccountType } from "@/app/_entities/enums/auth.enum";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(login_schema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsLoading(true);
    const response = await signIn("credentials", {
      ...data,
      redirect: false,
    });

    if (response?.error) {
      setIsLoading(false);
      setError("password", {
        type: "custom",
        message: "Invalid Login Credentials.",
      });
      return;
    }

    if (response?.ok && !response?.error) {
      const session = await getSession();

      if (session?.user?.role) {
        if (
          session.user.role === AccountType.Admin ||
          session.user.role === AccountType.SuperAdmin
        ) {
          window.location.href = "/admin";
        } else if (session.user.role === AccountType.Patient) {
          window.location.href = "/";
        } else if (session.user.role === AccountType.Doctor) {
          window.location.href = "/doctor";
        } else if (session.user.role === AccountType.Staff) {
          window.location.href = "/staff";
        } else {
          window.location.href = response?.url ?? process.env.NEXTAUTH_URL!;
        }
      } else {
        window.location.href = response?.url ?? process.env.NEXTAUTH_URL!;
      }
    }
  };

  return (
    <div className="bg-white w-[415px] rounded-xl border p-12 flex flex-col gap-8 shadow-md">
      <Image
        alt="Clinic Logo"
        src="/jau_logo.png"
        width={280}
        height={50}
        className="h-auto w-[220px] mx-auto"
      />

      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-2xl font-bold text-gray-800">Login</h1>

        <div className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email_address" is_required>
              Email Address
            </Label>
            <Input
              id="email_address"
              placeholder="johndoe@gmail.com"
              {...register("email_address")}
              error={errors.email_address?.message}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" is_required>
              Password
            </Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              {...register("password")}
              RightIcon={
                showPassword ? (
                  <button type="button" onClick={() => setShowPassword(false)}>
                    <EyeOff className="w-5 h-5 text-gray-600" />
                  </button>
                ) : (
                  <button type="button" onClick={() => setShowPassword(true)}>
                    <Eye className="w-5 h-5 text-gray-600" />
                  </button>
                )
              }
              error={errors.password?.message}
            />
          </div>

          {/* Forgot Password */}
          <Link
            className="text-teal-700 text-sm hover:underline"
            href="/forgot-password"
          >
            Forgot Password?
          </Link>

          {/* Login Button */}
          <Button
            variant="default"
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </div>
      </form>

      {/* Register Redirect */}
      <p className="text-center text-gray-600 text-sm">
        Don’t have an account?{" "}
        <Link
          href="/register"
          className="text-teal-700 hover:underline font-medium"
        >
          Register
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
