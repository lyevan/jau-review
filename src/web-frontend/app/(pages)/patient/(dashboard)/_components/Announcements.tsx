"use client";
import { Megaphone, Loader2, Calendar, Clock } from "lucide-react";
import { useGetAnnouncements } from "@/app/_hooks/queries/useAnnouncements";

const Announcements = () => {
  const { data: announcements = [], isLoading } = useGetAnnouncements();

  // Filter only active announcements and get the latest 3
  const activeAnnouncements = announcements
    .filter((a) => a.status === "active")
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-teal-600 flex items-center gap-2">
          <Megaphone className="w-6 h-6" />
          Latest Updates
        </h2>
      </div>

      {activeAnnouncements.length > 0 ? (
        <>
          <div className="space-y-4">
            {activeAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="group relative overflow-hidden rounded-xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors flex-1">
                    {announcement.title}
                  </h3>
                  <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full shrink-0">
                    {announcement.announcementType}
                  </span>
                </div>

                <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                  {announcement.content}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {announcement.date && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        Event:{" "}
                        {new Date(announcement.date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-linear-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-100">
            <p className="text-sm text-slate-700 text-center">
              📢 Stay tuned for more important updates and clinic news!
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Megaphone className="w-16 h-16 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No announcements at the moment</p>
        </div>
      )}
    </div>
  );
};

export default Announcements;
