exports.subscribeUserToTopic = functions.https.onRequest(async (req, res) => {
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

    // Subscribe each token to the topic
    const subscribePromises = tokens.map(async (token) => {
      await admin.messaging().subscribeToTopic(token, topic);
    });

    await Promise.all(subscribePromises);

    // Update the user document with the new topic in subscribedTopics
    if (tokens.length > 0) {
      await admin.firestore().collection("users").doc(userId).update({
        subscribedTopics: admin.firestore.FieldValue.arrayUnion(topic),
      });
    }

    res.status(200).json({success: true});
  } catch (error) {
    console.error("Error subscribing user to topic:", error);
    res.status(500).json({success: false, error: "Internal Server Error"});
  }
});
