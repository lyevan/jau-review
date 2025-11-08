"use client";

/* REACT */
import { useState } from "react";

/* COMPONENTS */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/Button";
import NoData from "@/app/_components/NoData";

const NotificationPageContainer = () => {
  const [notifications] = useState([]); // TODO: Replace with actual notifications data

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          Stay updated with your latest notifications
        </p>
      </div>

      {notifications.length === 0 ? (
        <NoData
          main_text="No notifications yet"
          sub_text="You will see your notifications here when you have any."
        />
      ) : (
        <div className="space-y-4">
          {notifications.map((notification: any) => (
            <Card key={notification.id}>
              <CardHeader>
                <CardTitle className="text-lg">{notification.title}</CardTitle>
                <CardDescription>{notification.message}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                  <Button variant="tertiary">Mark as Read</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationPageContainer;
