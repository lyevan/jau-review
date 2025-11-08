"use client";
import React, { useState, useMemo } from "react";
import {
  User,
  UserPlus,
  Edit,
  Trash2,
  Search,
  Shield,
  Stethoscope,
  Users,
  Briefcase,
  X,
  Mail,
  Phone,
  Calendar,
  Loader2,
} from "lucide-react";
import { toast } from "@/app/_utils/toast";
import { useGetUsers } from "@/app/_hooks/queries/useUsers";
import {
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/app/_hooks/mutations/useUsers";
import { Access } from "@/app/_entities/enums/user.enum";

type UserRole = "admin" | "doctor" | "patient" | "staff";

// Backend user structure
interface BackendUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  contact_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  age?: number;
}

interface UserFormData {
  id?: number;
  username: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  contactNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  role: UserRole;
  // Doctor-specific fields
  specialization?: string;
  licenseNumber?: string;
  // Patient-specific fields
  civilStatus?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyContactRelationship?: string;
  // Staff-specific fields
  position?: string;
  department?: string;
}

export default function ModernUserManagement() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Helper to map role string to Access enum
  const roleToAccess = (role: UserRole): Access => {
    const map: Record<UserRole, Access> = {
      admin: Access.Admin,
      patient: Access.Patient,
      doctor: Access.Doctor,
      staff: Access.Staff,
    };
    return map[role];
  };

  const initialFormState: UserFormData = {
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    contactNumber: "",
    dateOfBirth: "",
    gender: "",
    role: "patient",
    // Doctor fields
    specialization: "",
    licenseNumber: "",
    // Patient fields
    civilStatus: "",
    address: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    emergencyContactRelationship: "",
    // Staff fields
    position: "",
    department: "",
  };

  const [formData, setFormData] = useState<UserFormData>(initialFormState);

  // Fetch users with filters - Node.js backend accepts role and search params
  const {
    data: rawUsers,
    isLoading,
    refetch,
  } = useGetUsers({
    access: roleFilter !== "all" ? roleToAccess(roleFilter) : null,
    sort_by_field: null,
    sort_by_order: null,
  } as any); // Using 'as any' because GetUserParams is for old Python backend
  const users = (rawUsers || []) as unknown as BackendUser[];

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const openModal = (user?: any) => {
    if (user) {
      setFormData({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        contactNumber: user.contact_number || "",
        dateOfBirth: user.date_of_birth || "",
        gender: user.gender || "",
        role: user.role,
      });
      setEditingUser(user);
    } else {
      setFormData(initialFormState);
      setEditingUser(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
    setFormData(initialFormState);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.firstName ||
      !formData.lastName
    ) {
      toast.warning("Validation Error", "Please fill in all required fields");
      return;
    }

    if (!editingUser && !formData.password) {
      toast.warning("Validation Error", "Password is required for new users");
      return;
    }

    // Validate role-specific required fields
    if (!editingUser) {
      if (formData.role === "doctor" && !formData.specialization) {
        toast.warning(
          "Validation Error",
          "Specialization is required for doctors"
        );
        return;
      }
      if (formData.role === "staff" && !formData.position) {
        toast.warning("Validation Error", "Position is required for staff");
        return;
      }
    }

    try {
      if (editingUser) {
        // For updates, use existing mutation
        await updateUser.mutateAsync({
          id: formData.id!,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          access: roleToAccess(formData.role),
        });
      } else {
        // Build profileData based on role
        let profileData = null;
        if (formData.role === "doctor") {
          profileData = {
            specialization: formData.specialization || null,
            licenseNumber: formData.licenseNumber || null,
          };
        } else if (formData.role === "patient") {
          profileData = {
            civilStatus: formData.civilStatus || null,
            address: formData.address || null,
            emergencyContactName: formData.emergencyContactName || null,
            emergencyContactNumber: formData.emergencyContactNumber || null,
            emergencyContactRelationship:
              formData.emergencyContactRelationship || null,
          };
        } else if (formData.role === "staff") {
          profileData = {
            position: formData.position || null,
            department: formData.department || null,
          };
        }

        // For new users, call the backend directly with all fields
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_API_URL + "/users",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: formData.username,
              email: formData.email,
              password: formData.password,
              firstName: formData.firstName,
              lastName: formData.lastName,
              contactNumber: formData.contactNumber || null,
              dateOfBirth: formData.dateOfBirth || null,
              gender: formData.gender || null,
              role: formData.role,
              profileData,
            }),
          }
        );

        const data = await response.json();

        if (!data.status) {
          throw new Error(data.error || "Failed to create user");
        }

        toast.success("Success", "User created successfully");
      }
      closeModal();
      refetch();
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast.error("Error", error.message || "Failed to save user");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser.mutateAsync(id);
        refetch();
      } catch (error: any) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Shield size={16} />;
      case "doctor":
        return <Stethoscope size={16} />;
      case "patient":
        return <User size={16} />;
      case "staff":
        return <Briefcase size={16} />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-200";
      case "doctor":
        return "bg-teal-100 text-teal-700 border-teal-200";
      case "patient":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "staff":
        return "bg-purple-100 text-purple-700 border-purple-200";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-teal-50 p-6 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 flex items-center gap-3">
              <Users className="text-teal-600" size={36} />
              User Management
            </h1>
            <p className="text-slate-600 text-lg">
              Manage system users and roles
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <UserPlus size={20} /> Add User
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-teal-600 mb-4" size={48} />
            <p className="text-slate-600 text-lg">Loading users...</p>
          </div>
        )}

        {/* Content - Only show when not loading */}
        {!isLoading && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <p className="text-slate-600 text-sm mb-1">Total Users</p>
                <p className="text-2xl font-bold text-slate-800">
                  {users.length}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <p className="text-slate-600 text-sm mb-1">Admins</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter((u) => u.role === "admin").length}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <p className="text-slate-600 text-sm mb-1">Doctors</p>
                <p className="text-2xl font-bold text-teal-600">
                  {users.filter((u) => u.role === "doctor").length}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <p className="text-slate-600 text-sm mb-1">Patients</p>
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter((u) => u.role === "patient").length}
                </p>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by name, email, or username..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="px-4 py-3 border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-w-[180px]"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                  <option value="patient">Patient</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Username
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Join Date
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center text-slate-400">
                              <User size={20} />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {user.first_name} {user.last_name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-slate-900 flex items-center gap-1">
                              <Mail size={14} className="text-slate-400" />
                              {user.email}
                            </p>
                            {user.contact_number && (
                              <p className="text-slate-600 flex items-center gap-1 mt-1">
                                <Phone size={14} className="text-slate-400" />
                                {user.contact_number}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-700">@{user.username}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(user.role)}`}
                          >
                            {getRoleIcon(user.role)}
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600 flex items-center gap-1">
                            <Calendar size={14} className="text-slate-400" />
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString()
                              : "-"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openModal(user)}
                              className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <Users
                            size={48}
                            className="mx-auto text-slate-300 mb-4"
                          />
                          <p className="text-slate-600 text-lg font-medium mb-1">
                            No users found
                          </p>
                          <p className="text-slate-500">
                            Try adjusting your search or filters
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                {editingUser ? (
                  <Edit className="text-teal-600" size={24} />
                ) : (
                  <UserPlus className="text-teal-600" size={24} />
                )}
                {editingUser ? "Edit User" : "Add New User"}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="johndoe"
                    className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@hospital.com"
                    className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="09123456789"
                    className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Role <span className="text-red-500">*</span>
                    {editingUser && (
                      <span className="ml-2 text-xs text-amber-600 font-normal">
                        (Cannot be changed - delete and recreate user to change
                        role)
                      </span>
                    )}
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={editingUser}
                    className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="patient">Patient</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Role-Specific Fields */}
              {!editingUser && (
                <>
                  {/* Doctor-Specific Fields */}
                  {formData.role === "doctor" && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Stethoscope size={20} className="text-teal-600" />
                        Doctor Information
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Specialization{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleChange}
                            placeholder="e.g., Cardiologist"
                            className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            License Number
                          </label>
                          <input
                            type="text"
                            name="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            placeholder="LIC-XXX-XXXX"
                            className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Patient-Specific Fields */}
                  {formData.role === "patient" && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <User size={20} className="text-blue-600" />
                        Patient Information
                      </h3>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Civil Status
                            </label>
                            <select
                              name="civilStatus"
                              value={formData.civilStatus}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            >
                              <option value="">Select status</option>
                              <option value="single">Single</option>
                              <option value="married">Married</option>
                              <option value="widowed">Widowed</option>
                              <option value="divorced">Divorced</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Address
                            </label>
                            <input
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              placeholder="Complete address"
                              className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Emergency Contact Name
                            </label>
                            <input
                              type="text"
                              name="emergencyContactName"
                              value={formData.emergencyContactName}
                              onChange={handleChange}
                              placeholder="Contact name"
                              className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Emergency Contact Number
                            </label>
                            <input
                              type="text"
                              name="emergencyContactNumber"
                              value={formData.emergencyContactNumber}
                              onChange={handleChange}
                              placeholder="09123456789"
                              className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Relationship
                            </label>
                            <input
                              type="text"
                              name="emergencyContactRelationship"
                              value={formData.emergencyContactRelationship}
                              onChange={handleChange}
                              placeholder="e.g., Spouse, Parent"
                              className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Staff-Specific Fields */}
                  {formData.role === "staff" && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Briefcase size={20} className="text-purple-600" />
                        Staff Information
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Position <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            placeholder="e.g., Nurse, Receptionist"
                            className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Department
                          </label>
                          <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            placeholder="e.g., Emergency, Pediatrics"
                            className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-sm"
              >
                {editingUser ? "Update User" : "Add User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
