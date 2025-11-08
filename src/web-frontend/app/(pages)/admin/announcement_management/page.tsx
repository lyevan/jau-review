"use client";
import React, { useState } from "react";
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Calendar,
  User,
  Eye,
  AlertCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "@/app/_utils/toast";
import {
  useGetAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from "@/app/_hooks/queries/useAnnouncements";
import type {
  Announcement,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from "@/app/_services/announcement.service";

interface FormData {
  title: string;
  content: string;
  announcementType: "hours" | "closure" | "program" | "general";
  status: "active" | "inactive";
  date: string;
  startTime: string;
  endTime: string;
}

export default function AnnouncementManagement() {
  const { data: announcements = [], isLoading } = useGetAnnouncements();
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [search, setSearch] = useState("");
  const [viewDetails, setViewDetails] = useState<Announcement | null>(null);

  const initialFormState: FormData = {
    title: "",
    content: "",
    announcementType: "general",
    status: "active",
    date: "",
    startTime: "",
    endTime: "",
  };

  const [formData, setFormData] = useState<FormData>(initialFormState);

  const openModal = (announcement?: Announcement) => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
        announcementType: announcement.announcementType,
        status: announcement.status,
        date: announcement.date || "",
        startTime: announcement.startTime || "",
        endTime: announcement.endTime || "",
      });
      setEditingAnnouncement(announcement);
    } else {
      setFormData(initialFormState);
      setEditingAnnouncement(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingAnnouncement(null);
    setIsModalOpen(false);
    setFormData(initialFormState);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast.warning("Please fill in all required fields");
      return;
    }

    try {
      if (editingAnnouncement) {
        await updateMutation.mutateAsync({
          id: editingAnnouncement.id,
          data: {
            title: formData.title,
            content: formData.content,
            announcementType: formData.announcementType,
            status: formData.status,
            date: formData.date || null,
            startTime: formData.startTime || null,
            endTime: formData.endTime || null,
          },
        });
      } else {
        await createMutation.mutateAsync({
          title: formData.title,
          content: formData.content,
          announcementType: formData.announcementType,
          status: formData.status,
          date: formData.date || null,
          startTime: formData.startTime || null,
          endTime: formData.endTime || null,
        });
      }
      closeModal();
    } catch (error) {
      console.error("Error saving announcement:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Error deleting announcement:", error);
      }
    }
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(search.toLowerCase()) ||
      announcement.content.toLowerCase().includes(search.toLowerCase()) ||
      (announcement.createdBy?.firstName &&
        announcement.createdBy.firstName
          .toLowerCase()
          .includes(search.toLowerCase())) ||
      (announcement.createdBy?.lastName &&
        announcement.createdBy.lastName
          .toLowerCase()
          .includes(search.toLowerCase()));

    return matchesSearch;
  });

  const activeAnnouncements = announcements.filter(
    (a) => a.status === "active"
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-teal-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-teal-50 p-6 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 flex items-center gap-3">
              <Megaphone className="text-teal-600" size={36} />
              Announcement Management
            </h1>
            <p className="text-slate-600 text-lg">
              Create and manage hospital announcements
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus size={20} /> Create Announcement
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p className="text-slate-600 text-sm mb-1">Total Announcements</p>
            <p className="text-2xl font-bold text-slate-800">
              {announcements.length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p className="text-slate-600 text-sm mb-1">Active</p>
            <p className="text-2xl font-bold text-teal-600">
              {activeAnnouncements.length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p className="text-slate-600 text-sm mb-1">Inactive</p>
            <p className="text-2xl font-bold text-slate-400">
              {announcements.filter((a) => a.status === "inactive").length}
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search announcements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Announcements Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Content */}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-2 flex-1">
                    {announcement.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      announcement.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {announcement.status}
                  </span>
                </div>

                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
                  {announcement.announcementType}
                </span>

                <p className="text-sm text-slate-600 line-clamp-3">
                  {announcement.content}
                </p>

                <div className="flex flex-col gap-2 text-xs text-slate-500 pt-2 border-t">
                  {announcement.createdBy && (
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>
                        {announcement.createdBy.firstName}{" "}
                        {announcement.createdBy.lastName}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {announcement.date && (
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>
                        Event:{" "}
                        {new Date(announcement.date).toLocaleDateString()}
                        {announcement.startTime && ` ${announcement.startTime}`}
                        {announcement.endTime && ` - ${announcement.endTime}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setViewDetails(announcement)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-teal-50 text-teal-700 text-sm font-medium rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() => openModal(announcement)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
                    disabled={updateMutation.isPending}
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Megaphone size={64} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              No announcements found
            </h3>
            <p className="text-slate-500">
              Try adjusting your filters or create a new announcement
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                {editingAnnouncement ? (
                  <Edit className="text-teal-600" size={24} />
                ) : (
                  <Plus className="text-teal-600" size={24} />
                )}
                {editingAnnouncement
                  ? "Edit Announcement"
                  : "Create New Announcement"}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter announcement title"
                  className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Enter announcement content"
                  rows={5}
                  className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Announcement Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Announcement Type
                </label>
                <select
                  name="announcementType"
                  value={formData.announcementType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="hours">Operating Hours</option>
                  <option value="closure">Closure/Maintenance</option>
                  <option value="program">Health Program</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Event Date (optional)
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Start Time (optional)
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    End Time (optional)
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={closeModal}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {editingAnnouncement
                  ? "Update Announcement"
                  : "Create Announcement"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold text-slate-800">
                Announcement Details
              </h2>
              <button
                onClick={() => setViewDetails(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    viewDetails.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {viewDetails.status}
                </span>
                <span className="text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded-full font-medium">
                  {viewDetails.announcementType}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                {viewDetails.title}
              </h3>

              <p className="text-slate-700 mb-6 whitespace-pre-wrap">
                {viewDetails.content}
              </p>

              <div className="space-y-3 text-sm">
                {viewDetails.createdBy && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <User size={16} className="text-slate-400" />
                    <span>
                      <strong>Author:</strong> {viewDetails.createdBy.firstName}{" "}
                      {viewDetails.createdBy.lastName}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar size={16} className="text-slate-400" />
                  <span>
                    <strong>Created:</strong>{" "}
                    {new Date(viewDetails.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {viewDetails.date && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <AlertCircle size={16} className="text-slate-400" />
                    <span>
                      <strong>Event Date:</strong>{" "}
                      {new Date(viewDetails.date).toLocaleDateString()}
                      {viewDetails.startTime && ` at ${viewDetails.startTime}`}
                      {viewDetails.endTime && ` - ${viewDetails.endTime}`}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-200">
                <button
                  onClick={() => setViewDetails(null)}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
