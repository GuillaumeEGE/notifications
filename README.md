# Notifications

### Principe de base :

- Pour envoyer des notifications à un utilisateur, on a besoin d’un jeton FCM généré par Firebase (1 jeton par utilisateur par appareil) .
    
    Du côté utilisateur, cela correspond à une pop-up : “Voulez-vous recevoir des notifications de l’appli”.
    
- FlutterFlow gère automatiquement les notifications pour certains cas : on peut déclencher une notification à un utilisateur dans une action.
    
    Pour la base de données, cela se traduit par une sous-collection de l'utilisateur : `fcm_tokens` et une collection `ff_user_push_notifications`. Elles sont créées automatiquement par FlutterFlow lorsqu'on choisit d'activer les notifications.
    

⇒ Pour pouvoir envoyer des notifications quand on veut, pas forcément via une action, j'ai un peu réfléchi pour trouver une solution. En effet, du côté de FlutterFlow, on n'a pas accès à ces collections directement. Je conseille donc d'ignorer ces collections "automatiques" et de créer une sous-collection de user `my_fcm_tokens` (et une collection `notifications`).

Mon but avec ce code c'est de faire abstraction de la partie jeton qui est un peu ardue à comprendre et pas évidente à gérer. Si on veut envoyer une notification, on envoie à un utilisateur ou à un groupe d'utilisateur et la partie Backend se charge de créer des jetons, mettre à jour les jetons dans les groupes ou quand l'utilisateur a plusieurs appareil, ou d'autres scénarios tordus…

Donc pas d'inquiétude si vous comprenez pas tout. Le code s'en charge. 

### 1. Génération du jeton :

- Comme on a activé les notifications dans FlutterFlow, cette partie est gérée automatiquement.
    - Pas encore fait pour IOS
- Dans les cas où on a un utilisateur avec plusieurs appareils, plusieurs jetons seront créés (principe à choisir : on envoie les notifs à tous les jetons ou uniquement au plus récent, pour l'instant j'envoie à tous les jetons (=appareils) de l'utilisateur.
- Dans le cas où l’utilisateur désinstalle l’application et la réinstalle, le jeton est alors révoqué. À sa connexion dans l’appli fraîchement réinstallée, un nouveau jeton va être généré (donc il y aura un jeton “mort” dans sa liste, je regarde comment gérer ça, mais ce n'est pas vraiment gênant, je pense que ça sera des cas qui ne se produiront pas souvent).

Une cloud fonction`copyFCMtoken`va récupérer ces jetons à chaque création et les copier dans notre sous-collection `my_fcm_tokens`.

### 2. Envoi de Notifications à un utilisateur :

- Envoi de Push-Notification
    - Utilisation de la cloudfunction`sendPushNotification()`.
        - Obligatoire : notification_text,notification_title, userRef
        - Facultatif : notificationImageUrl, initialPageName, parameterData,parameterName
    
    ![notif.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/33bb5366-4a24-4fc5-a749-cabdb67b1c99/e8c1731c-95ea-4127-bdcb-abebc30bbed5/notif.png)
    
- Visualiser la notification dans l’application :
    - Stocker la notification avec les champ utiles dans la base de données (collection notification ou sous collection de user notification).

### 3. Envoi à plusieurs utilisateurs avec un topic:

Créer un champ subscribedTopics dans user : liste de string

- Création/Inscription à un topic avec `subscribeUserToTopic(userId,topic)`.
    - Inscrit tous les jetons d’un utilisateur à un topic
- Désinscription avec `unsubscribeUserFromTopic(userId,topic)`.
    - Désinscrit tous les jetons d’un utilisateur à un topic
- Une cloudfunction `subscribeTokenToTopic`va réabonner automatiquement un nouveau jeton a tous les topics dont l’utilisateur est inscrit dans le cas ou l’utilisateur change de jeton.
- Envoi de Push-Notification
    - Utilisation de `sendNotificationToTopic` pour envoyer aux membres du topic.
        - Obligatoire : notification_text,notification_title, Topic
        - Facultatif : notificationImageUrl, initialPageName, parameterData, parameterName
- Visualiser la notification dans l’application :
    - Stocker la notification avec les champ utiles dans la base de données (collection notification ou sous collection de user notification).

Marc : 

Côté Database : 

- Créer l’objet notification, avec une subcollection message
- Faire l’UI avec ça

Côté code : 

- Pour cibler un utilisateur spécifique, créer une action messaging.getToken()
- Créer un AppState persited Bool  haveToken?
- Mettre cette action dans la HomePage, en vérifiant la valeur du AppState
- Au passage, stocker ce jeton dans firestore (dans une liste du user, si il a plusieurs devices)
