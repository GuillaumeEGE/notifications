exports.sendPushNotification = functions.https.onRequest(async (req, res) => {
  try {
    const {
      notificationTitle,
      notificationText,
      notificationImageUrl,
      userRef,
      initialPageName,
      parameterData,
      parameterName,
    } = req.body;
    console.log("Request Body:", req.body);
    if (!notificationTitle ||
      !notificationText || !userRef || !initialPageName) {
      res.status(400)
          .json({success: false, error: "Invalid request parameters"});
      return;
    }

    const userSnapshot = await admin.firestore()
        .collection("users").doc(userRef).collection("my_fcm_tokens").get();

    const tokens = [];
    userSnapshot.forEach((doc) => {
      const token = doc.data().fcm_token;
      if (token) {
        tokens.push(token);
      }
    });

    const sendNotificationPromises = tokens.map(async (token) => {
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
          initialPageName: initialPageName,
          // parameterData: JSON.stringify({paramTest: "yop"}),
          parameterData: JSON.stringify({[parameterName]: parameterData}),
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        },

        token: token,
      };

      if (notificationImageUrl) {
        message.notification.imageUrl = notificationImageUrl;
      }

      await admin.messaging().send(message);
    });

    await Promise.all(sendNotificationPromises);

    res.status(200)
        .json({success: true, message: "Notifications sent successfully."});
  } catch (error) {
    console.error("Error sending push notification:", error);
    res.status(500).json({success: false, error: "Internal Server Error"});
  }
});
