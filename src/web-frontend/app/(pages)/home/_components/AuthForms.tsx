"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AccountType } from "@/app/_entities/enums/auth.enum";

export default function AuthForms() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email_address: "",
    password: "",
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    full_name: "",
    email: "",
    password: "",
    contact_number: "",
    address: "",
    date_of_birth: "",
    gender: "",
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const response = await signIn("credentials", {
      ...loginData,
      redirect: false,
    });

    if (response?.error) {
      setLoading(false);
      setError("Invalid Login Credentials.");
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
          window.location.href = "/appointment";
        } else if (session.user.role === AccountType.Doctor) {
          window.location.href = "/doctor";
        } else if (session.user.role === AccountType.Staff) {
          window.location.href = "/staff";
        }
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000/api";
      const res = await fetch(`${backendUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      const data = await res.json();

      if (!res.ok || !data.status) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(true);
      setTimeout(() => {
        setIsLogin(true);
        setSuccess(false);
        setRegisterData({
          full_name: "",
          email: "",
          password: "",
          contact_number: "",
          address: "",
          date_of_birth: "",
          gender: "",
        });
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => {
            setIsLogin(true);
            setError("");
            setSuccess(false);
          }}
          className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
            isLogin
              ? "bg-white text-teal-700 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Login
        </button>
        <button
          onClick={() => {
            setIsLogin(false);
            setError("");
            setSuccess(false);
          }}
          className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
            !isLogin
              ? "bg-white text-teal-700 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Register
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          Registration successful! Please login.
        </div>
      )}

      {isLogin ? (
        // LOGIN FORM
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={loginData.email_address}
              onChange={(e) =>
                setLoginData({ ...loginData, email_address: e.target.value })
              }
              placeholder="johndoe@gmail.com"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                placeholder="********"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-teal-600 text-white py-2.5 rounded-lg font-semibold transition flex items-center justify-center ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-teal-700"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>

          <p className="text-center text-sm text-gray-600">
            <a
              href="/forgot-password"
              className="text-teal-600 hover:underline"
            >
              Forgot Password?
            </a>
          </p>
        </form>
      ) : (
        // REGISTER FORM
        <form
          onSubmit={handleRegisterSubmit}
          className="space-y-3 max-h-[500px] overflow-y-auto pr-2"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={registerData.full_name}
              onChange={(e) =>
                setRegisterData({ ...registerData, full_name: e.target.value })
              }
              placeholder="Full Name"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
              placeholder="Email Address"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
                placeholder="Password (min. 6 characters)"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <input
              type="text"
              value={registerData.contact_number}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  contact_number: e.target.value,
                })
              }
              placeholder="Contact Number (Optional)"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={registerData.address}
              onChange={(e) =>
                setRegisterData({ ...registerData, address: e.target.value })
              }
              placeholder="Address (Optional)"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={registerData.date_of_birth}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  date_of_birth: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              value={registerData.gender}
              onChange={(e) =>
                setRegisterData({ ...registerData, gender: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select Gender (Optional)</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-teal-600 text-white py-2.5 rounded-lg font-semibold transition flex items-center justify-center ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-teal-700"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
