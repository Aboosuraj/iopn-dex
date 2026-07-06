export function requestNotificationPermission() {
      if (typeof window === "undefined") return;

        if ("Notification" in window) {
            Notification.requestPermission();
              }
              }

              export function sendNotification(title: string, body: string) {
                if (typeof window === "undefined") return;

                  if ("Notification" in window && Notification.permission === "granted") {
                      new Notification(title, {
                            body,
                                  icon: "/icon.png",
                                      });
                                        }
                                        }