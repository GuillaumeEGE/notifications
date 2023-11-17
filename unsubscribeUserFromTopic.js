exports.unsubscribeUserFromTopic = functions
    .https.onRequest(async (req, res) => {
      try {
        const {userId, topic} = req.body;
        console.log("Received userId:", userId);
        console.log("Received topic:", topic);

        // Get all FCM tokens for the user with the provided userId
        const userSnapshot = await admin.firestore()
            .collection("users").doc(userId).collection("my_fcm_tokens").get();

        const tokens = [];
        userSnapshot.forEach((doc) => {
          const token = doc.data().fcm_token;
          tokens.push(token);
          console.log("Received token:", token);
        });

        // Unsubscribe each token from the topic
        const unsubscribePromises = tokens.map(async (token) => {
          await admin.messaging().unsubscribeFromTopic(token, topic);
        });

        await Promise.all(unsubscribePromises);

        // Update the user document to remove the topic from subscribedTopics
        if (tokens.length > 0) {
          await admin.firestore().collection("users").doc(userId).update({
            subscribedTopics: admin.firestore.FieldValue.arrayRemove(topic),
          });
        }

        res.status(200).json({success: true});
      } catch (error) {
        console.error("Error unsubscribing user from topic:", error);
        res.status(500).json({success: false, error: "Internal Server Error"});
      }
    });
