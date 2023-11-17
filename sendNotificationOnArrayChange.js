const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendNotificationOnArrayChange = functions.firestore
    .document("users/{userId}")
    .onUpdate(async (change, context) => {
      try {
        console.log("Function triggered:", context.params.userId);

        const previousData = change.before.data();
        const newData = change.after.data();

        // Check if the addSomethingForNotif array changed
        const previousArray = previousData.addSomethingForNotif || [];
        const newArray = newData.addSomethingForNotif || [];

        if (previousArray.length < newArray.length) {
          console.log("New item added to the array, sending notifications...");

          // Get all FCM tokens from the 'fcm_tok' subcollection
          const fcmTokenSnapshot = await admin
              .firestore()
              .collection("users")
              .doc(context.params.userId)
              .collection("fcm_tok")
              .get();

          const tokens = fcmTokenSnapshot
              .docs.map((doc) => doc.data().fcm_token);

          // Construct the message payload
          const payload = {
            notification: {
              title: "New Notification",
              body: "A new item has been added to the array!",
            },
            data: {
              body: "A new item has been added to the array!",
            },
          };

          // Send notifications to all tokens using the FCM API
          const responses = await Promise.all(
              tokens.map((token) =>
                admin.messaging().send({
                  token: token,
                  ...payload,
                }),
              ),
          );
