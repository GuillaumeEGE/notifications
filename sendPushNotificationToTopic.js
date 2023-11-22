exports.sendPushNotificationToTopic =
functions.https.onRequest(async (req, res) => {
  try {
    const {
      notificationTitle,
      notificationText,
      notificationImageUrl,
      topicName,
      initialPageName,
      parameterData,
      parameterName,
    } = req.body;

    console.log("Request Body:", req.body);

    if (!notificationTitle || !notificationText || !topicName) {
      res.status(400)
          .json({success: false, error: "Invalid request parameters"});
      return;
    }

    const message = {
      notification: {
        title: notificationTitle,
        body: notificationText,
      },
      android: {
        notification: {},
      },
      apns: {
        payload: {
          aps: {},
        },
      },
      data: {
        // Check if initialPageName is empty before adding it to the payload
        ...(initialPageName && {initialPageName}),
        parameterData: JSON.stringify({[parameterName]: parameterData}),
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
      topic: topicName,
    };

    if (notificationImageUrl) {
      message.notification.imageUrl = notificationImageUrl;
    }

    await admin.messaging().send(message);

    res.status(200)
        .json({success: true, message: "Notifications sent successfully."});
  } catch (error) {
    console.error("Error sending push notification:", error);
    res.status(500).json({success: false, error: "Internal Server Error"});
  }
});
