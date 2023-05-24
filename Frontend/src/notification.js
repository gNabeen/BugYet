export const sendNotification = async (token, notificationData) => {
    const notifToggles = JSON.parse(localStorage.getItem("notifToggles")) || {
        subdomainScanner: false,
        domainReachability: false,
        dnsScanner: false,
        portScanner: false,
        techScanner: false,
        profileEdit: false,
    };

    console.log("Sending notification:", notificationData);

    // Check if the feature is allowed to send notifications
    if (notifToggles[notificationData.feature]) {
        try {
            /* Sending a POST request to the server. */
            const response = await fetch("https://bugyet.repl.co/notification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    /* Sending the token to the server. */
                    Authorization: token,
                },
                body: JSON.stringify({
                    title: notificationData.title,
                    message: notificationData.message,
                }),
            });

            /* Checking if the response is ok. If it is not ok, it will throw an error. */
            if (!response.ok) {
                throw new Error(`Failed to send notification: ${response.statusText}`);
            }

            return response.json();
        } /* Catching the error and throwing a new error. */
        catch (error) {
            console.error(error);
            /* Throwing an error. */
            throw new Error("Failed to send notification");
        }
    } else {
        // Notification feature is not allowed, return a message without sending a notification
        console.log("Notification feature not allowed:", notificationData.feature);
        return { message: "Notification not sent, feature not allowed" };
    }
};