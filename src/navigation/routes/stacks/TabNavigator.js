import AsyncStorage from "@react-native-community/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigationState } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";

import CashbackCampaign from "@screens/Dashboard/Festives/CashbackCampaign";
import CampaignChancesEarnedScreen from "@screens/Gaming/SortToWin/Chances";
import MAEDashboardScreen from "@screens/MAE/ApplyDashboardTab";
import BackSoonScreen from "@screens/Maintenance/BackSoon";
import NoInternetScreen from "@screens/Maintenance/NoInternet";
import UnderMaintenanceScreen from "@screens/Maintenance/UnderMaintenance";
import { navigateCta } from "@screens/Notifications";
import ExternalPnsPromotionScreen from "@screens/Promotions/ExternalPnsPromotion";
import M2UDeactivatedScreen from "@screens/SecureSwitch/M2UDeactivatedScreen";
import BankingScreen from "@screens/TabNav/Banking";
import ExpensesScreen from "@screens/TabNav/Expenses";

import { M2U_DEACTIVATED_SCREEN } from "@navigation/navigationConstant";
import HomeStack from "@navigation/routes/stacks/HomeStack";

import TabBar from "@components/TabBar";

import { useModelController } from "@context";

import { requestUserRest } from "@services";
import { openDeeplink } from "@services/Deeplink";
import { updateFCM } from "@services/pushNotifications";

import { pushCloudLogs } from "@utils/cloudLog";
import { cacheConfig, getMasterConfig } from "@utils/useFestive";

import MoreStacks from "./MoreStacks";
import QrStacks from "./QrStack";

const Tabs = createBottomTabNavigator();
const Stack = createStackNavigator();

const styles = StyleSheet.create({
    animateWrapper: {
        flex: 1,
    },
});

const AnimatedWrapper = ({ index, prev, current, children }) => {
    let animation;

    if (current === index) {
        if (prev < index) {
            animation = "fadeInLeft";
        } else {
            animation = "fadeInRight";
        }
    }

    return (
        <Animatable.View
            animation={animation}
            duration={170}
            style={styles.animateWrapper}
            useNativeDriver
        >
            {children}
        </Animatable.View>
    );
};

AnimatedWrapper.propTypes = {
    index: PropTypes.number,
    prev: PropTypes.number,
    current: PropTypes.number,
    children: PropTypes.element,
};

// ref value doesn't been picked up inside the effect
// further troublshoot needed but this static variable
// could solve multi notification navigating when dashboard
// refreshed

let navigating = false;

function TabNavigator({ navigation }) {
    const [currentTab, setCurrentTab] = useState(0);
    const [prevTab, setPrevTab] = useState(0);
    const tabRoute = useNavigationState((state) => state.routes[0]);
    const currentIndex = tabRoute?.state?.index ?? 0;
    const { getModel, updateModel } = useModelController();
    const [hasDeeplink, setDeeplink] = useState(false);
    const {
        ui: { notificationControllerNavigation, isS2UAuth },
        user: { isOnboard },
        auth: { fcmToken, isSessionExpired },
        permissions: { notifications: notificationsPermissions },
        deeplink: { url: deeplinkUrl, params: deeplinkParams },
        pushNotification: { ctaData },
        misc: { isPromotionsEnabled, cacheConfigData },
        device: { deviceId },
    } = getModel([
        "deeplink",
        "user",
        "ui",
        "pushNotification",
        "auth",
        "permissions",
        "misc",
        "device",
    ]);

    function tabBar(props) {
        return <TabBar {...props} />;
    }
    useEffect(() => {
        getMasterConfig(updateModel);
        //Push the logs to AWS Cloud
        pushCloudLogs({ getModel });
    }, []);

    useEffect(() => {
        if (cacheConfigData?.length > 0) {
            cacheConfig(cacheConfigData);
        }
    }, [cacheConfigData]);

    //Marketing Push notification routing after token load
    const manageCtaData = useCallback(() => {
        navigateCta(ctaData?.data, navigation);

        updateModel({
            pushNotification: {
                ctaData: {},
            },
        });
    }, [ctaData, updateModel, navigation]);

    const manageNotificationNav = useCallback(() => {
        const { stack, screen, params } = notificationControllerNavigation;

        if (params?.params?.screen === "Notifications") {
            // make sure we just navigate to avoid double screen
            navigation.navigate(stack, {
                screen,
                params,
            });
        } else {
            // the rest is fine for double screen
            navigation.push(stack, {
                screen,
                params,
            });
        }

        updateModel(
            {
                ui: {
                    notificationControllerNavigation: null,
                },
            },
            () => {
                navigating = false;
            }
        );
    }, [navigation, notificationControllerNavigation, updateModel]);

    const getProfile = useCallback(async () => {
        try {
            const response = await requestUserRest(false);

            if (response && response?.data?.result) {
                const {
                    fullName,
                    phone: mobileNumber,
                    imageBase64,
                    username,
                    email,
                    userId,
                    birthDate,
                } = response.data.result;

                updateModel({
                    user: {
                        fullName,
                        mobileNumber,
                        email,
                        birthDate,
                        username,
                        m2uUserId: userId,
                        mayaUserId: userId,
                        profileImage: imageBase64 ? `data:jpeg;base64,${imageBase64}` : null,
                    },
                });

                // see if we need to re-register PNS
                if (notificationsPermissions && mobileNumber) {
                    // checkAndRegisterPushNotification(
                    //     mobileNumber,
                    //     deviceId,
                    //     fcmToken,
                    //     isPromotionsEnabled ? "A" : "T"
                    // );
                    const isOtaEnabled = await AsyncStorage.getItem("isOtaEnabled");
                    //Update S2U and PNS
                    const updateFCMResult = await updateFCM(
                        mobileNumber,
                        deviceId,
                        fcmToken,
                        isPromotionsEnabled ? "A" : "T",
                        isOtaEnabled
                    );
                    console.log("updateFCMResult ::: ", updateFCMResult);
                }
            }
        } catch (error) {
            // can't get the user details
        }
    }, [updateModel, notificationsPermissions, deviceId, isPromotionsEnabled, fcmToken]);

    useEffect(() => {
        if (currentTab !== currentIndex) {
            setPrevTab(currentTab);
            setCurrentTab(currentIndex);
        }
    }, [currentTab, currentIndex]);

    useEffect(() => {
        if (
            notificationControllerNavigation?.stack &&
            !navigating &&
            (!isSessionExpired || (isS2UAuth && isSessionExpired))
        ) {
            navigating = true;
            manageNotificationNav();
        }
    }, [manageNotificationNav, notificationControllerNavigation, isSessionExpired, isS2UAuth]);

    useEffect(() => {
        if (ctaData?.isData && !isSessionExpired) {
            manageCtaData();
        }
    }, [manageCtaData, ctaData, isSessionExpired]);

    useEffect(() => {
        setDeeplink(isOnboard && deeplinkUrl && deeplinkParams);
    }, [isOnboard]);
    
    useEffect(() => {
        if (hasDeeplink && !isSessionExpired) {
            openDeeplink({ updateModel, getModel, navigation });
        }
    }, [deeplinkUrl, deeplinkParams, isOnboard, hasDeeplink, isSessionExpired]);

    useEffect(() => {
        if (isOnboard) {
            getProfile();
        }
    }, [isOnboard, getProfile]);

    return (
        <Tabs.Navigator tabBar={tabBar}>
            <Tabs.Screen
                name="Dashboard"
                options={{
                    title: "Home",
                    // unmountOnBlur: isRendered,
                }}
            >
                {(props) => (
                    <AnimatedWrapper index={0} prev={prevTab} current={currentTab}>
                        <HomeStack {...props} />
                    </AnimatedWrapper>
                )}
            </Tabs.Screen>
            <Tabs.Screen
                name="Maybank2u"
                options={{
                    title: "Accounts",
                    unmountOnBlur: true,
                }}
            >
                {(props) => (
                    <AnimatedWrapper index={1} prev={prevTab} current={currentTab}>
                        <BankingScreen {...props} />
                    </AnimatedWrapper>
                )}
            </Tabs.Screen>
            <Tabs.Screen
                name="Expenses"
                options={{
                    title: "Expenses",
                    unmountOnBlur: true, // they want it to be refreshed/reset every time
                }}
            >
                {(props) => (
                    <AnimatedWrapper index={2} prev={prevTab} current={currentTab}>
                        <ExpensesScreen {...props} />
                    </AnimatedWrapper>
                )}
            </Tabs.Screen>

            <Tabs.Screen
                name="More"
                options={{
                    title: "Apply",
                    unmountOnBlur: true, // so we get the menu animation all the time
                }}
            >
                {(props) => (
                    <AnimatedWrapper index={3} prev={prevTab} current={currentTab}>
                        <MoreStacks {...props} />
                    </AnimatedWrapper>
                )}
            </Tabs.Screen>
        </Tabs.Navigator>
    );
}

TabNavigator.propTypes = {
    navigation: PropTypes.object,
};

function TabRootStack() {
    return (
        <Stack.Navigator
            initialRouteName="Tab"
            mode="modal"
            headerMode="none"
            screenOptions={{
                gestureEnabled: false,
            }}
        >
            <Stack.Screen name="Tab" component={TabNavigator} />
            <Stack.Screen name="QrStack" component={QrStacks} />
            <Stack.Screen
                name="UnderMaintenance"
                component={UnderMaintenanceScreen}
                options={{
                    animationEnabled: false,
                }}
            />
            <Stack.Screen
                name="NoInternet"
                component={NoInternetScreen}
                options={{
                    animationEnabled: false,
                }}
            />
            <Stack.Screen
                name="BackSoon"
                component={BackSoonScreen}
                options={{
                    animationEnabled: false,
                }}
            />
            <Stack.Screen
                name={M2U_DEACTIVATED_SCREEN}
                component={M2UDeactivatedScreen}
                options={{
                    animationEnabled: false,
                }}
            />
            <Stack.Screen name="ExternalPnsPromotion" component={ExternalPnsPromotionScreen} />
            <Stack.Screen name="CashbackCampaign" component={CashbackCampaign} />
            <Stack.Screen name="CampaignChancesEarned" component={CampaignChancesEarnedScreen} />

            <Stack.Screen name="ApplyScreen" component={MAEDashboardScreen} />
        </Stack.Navigator>
    );
}

export default TabRootStack;
