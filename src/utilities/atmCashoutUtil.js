import AsyncStorage from "@react-native-community/async-storage";
import Config from "react-native-config";

import { PROMO_DETAILS, PROMOS_MODULE, DASHBOARD } from "@navigation/navigationConstant";

export const handleGoToATMCashOutArticle = (navigation, onGoBack = null) => {
    const itemDetails = {
        id: Config.ATMCASHOUT_ARTICLE_ID,
        callPage: DASHBOARD,
        index: 0,
        ...(onGoBack && { onGoBack }), // Only include onGoBack if it is provided
    };

    navigation.navigate(PROMOS_MODULE, {
        screen: PROMO_DETAILS,
        params: {
            itemDetails,
        },
    });
};

const key = "preferredListKey";

export const setItemInStorage = async (list) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(list));
    } catch (error) {
        console.log(error);
    }
};

export const getItemFromStorage = async () => {
    try {
        return await AsyncStorage.getItem(key);
    } catch (error) {
        console.log(error);
        return [];
    }
};

export const removeItemFromStorage = async () => {
    try {
        return await AsyncStorage.removeItem(key);
    } catch (error) {
        console.log(error);
        return [];
    }
};
