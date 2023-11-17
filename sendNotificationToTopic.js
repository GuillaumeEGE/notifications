exports.sendNotificationToTopic = functions
    .https.onRequest(async (req, res) => {
      try {
        const topic = req.body.topic;
        const notificationTitle =
        req.body.notification_title || "Default Title";
        const notificationBody =
        req.body.notification_body || "Default Body";

        const message = {
          notification: {
            title: notificationTitle,
            body: notificationBody,
          },
          data: {
            body: notificationBody,
          },
          topic: topic,
        };

        // Send notification to the topic using the FCM API
        await admin.messaging().send(message);

        // Write the notification to the 'notifications' collection
        const notificationsCollection = admin.firestore()
            .collection("notifications");

        const newNotification = {
          notification_title: notificationTitle,
          notification_text: notificationBody,
          topic: topic,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        };

        await notificationsCollection.add(newNotification);

        res.status(200).json({success: true,
          message: "Notification sent successfully."});
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({success: false, error: "Internal Server Error"});
      }
    });
