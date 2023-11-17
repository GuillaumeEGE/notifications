exports.subscribeTokenToTopics = functions.firestore
    .document("users/{userId}/my_fcm_tokens/{tokenID}")
    .onCreate(async (snapshot, context) => {
      try {
        const userId = context.params.userId;

        // Get the FCM token from the newly created document
        const fcmToken = snapshot.data().fcm_token;

        // Get the subscribedTopics array from the user's document
        const userDoc = await admin.firestore()
            .collection("users").doc(userId).get();
        const subscribedTopics = userDoc.data().subscribedTopics || [];

        // Subscribe the new token to each topic in subscribedTopics
        const subscribePromises = subscribedTopics.map(async (topic) => {
          await admin.messaging().subscribeToTopic(fcmToken, topic);
        });

        await Promise.all(subscribePromises);

        console
            .log(`Token ${fcmToken} subscribed to topics for user ${userId}`);

        return null;
      } catch (error) {
        console.error("Error subscribing token to topics:", error);
        return null;
      }
    });
