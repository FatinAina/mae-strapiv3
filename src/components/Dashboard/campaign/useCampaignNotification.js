import { RNRemoteMessage } from "@hmscore/react-native-hms-push";
import AsyncStorage from "@react-native-community/async-storage";
import moment from "moment";
import { useCallback } from "react";

import { createLocalNotification } from "@services/pushNotifications";

import { DATE_FORMAT } from "@constants/strings";

import { isPureHuawei } from "@utils/checkHMSAvailability";
import { getServerDate } from "@utils/dataModel/utilityPartial.4";

const useCampaignNotification = () => {
    const INIT_DATE_LAUNCH_PN_CAMPAIGN = "initialDateLaunchPNCampaign";

    const getDateInitPushNotifLaunch = () => {
        return AsyncStorage.getItem(INIT_DATE_LAUNCH_PN_CAMPAIGN);
    };

    const saveDateInitPushNotifLaunch = async (date) => {
        if (date) {
            await AsyncStorage.setItem(INIT_DATE_LAUNCH_PN_CAMPAIGN, date);
        }
    };

    const isPushNotificationNeeded = useCallback(async (currentServerDate) => {
        let isMoreThanEqualOneWeek;
        const lastDatePNShow = await getDateInitPushNotifLaunch();
        if (lastDatePNShow) {
            moment.updateLocale("en", {
                week: {
                    dow: 1, // Set Monday as the first day of the week
                },
            });
            const currentDate = moment(currentServerDate).startOf("week").format(DATE_FORMAT);
            const initialDate = moment(lastDatePNShow).startOf("week").format(DATE_FORMAT);
            moment.updateLocale("en", {
                week: {
                    dow: 0, // Set Sunday as the first day of the week
                },
            });
            isMoreThanEqualOneWeek = currentDate !== initialDate;
        } else {
            isMoreThanEqualOneWeek = true;
        }
        return isMoreThanEqualOneWeek;
    }, []);

    const pushNotificationPrediction = () => {
        const week = moment().week();
        return week % 2 === 0 ? "Even" : "Odd";
    };

    const showPreLoginPushNotification = useCallback(
        async (data) => {
            const { title, desc } = data;
            const notification = {
                msgId: "1",
                soundName: "default",
                notif_title: title,
                template_id: "0",
                type: "Campaign",
                module: "GAME",
                hasAnimation: "true",
            };
            const huaweiPayload = new RNRemoteMessage({
                ChannelId: null,
                Sound: "default",
                data: JSON.stringify(notification),
            });
            const payload = isPureHuawei ? huaweiPayload : notification;
            const initServerDate = await getServerDate();
            const showPushNotification = await isPushNotificationNeeded(initServerDate);
            if (showPushNotification) {
                createLocalNotification(title, desc, payload).then(async () => {
                    await saveDateInitPushNotifLaunch(initServerDate);
                });
            }
        },
        [isPushNotificationNeeded]
    );

    return {
        showPreLoginPushNotification,
        pushNotificationPrediction,
    };
};

export default useCampaignNotification;
