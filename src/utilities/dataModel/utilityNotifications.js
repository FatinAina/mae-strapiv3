import AsyncStorage from "@react-native-community/async-storage";

export async function isNotificationOpened(initialNotification, isPureHuwaei = false) {
    const notificationId = isPureHuwaei
        ? initialNotification?._push_msgid || initialNotification?.notification?.id
        : initialNotification?.messageId || initialNotification?.notification?.id;

    const lastNotificationId = await AsyncStorage.getItem("lastOpenedNotificationId");
    const isOpened = lastNotificationId ? notificationId === lastNotificationId : false;

    if (!isOpened && notificationId) {
        await AsyncStorage.setItem("lastOpenedNotificationId", notificationId);
    }

    return isOpened;
}
