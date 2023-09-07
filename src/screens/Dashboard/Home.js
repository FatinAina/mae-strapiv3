import AsyncStorage from "@react-native-community/async-storage";
import { useFocusEffect, useScrollToTop } from "@react-navigation/native";
import { Viewport } from "@skele/components";
import PropTypes from "prop-types";
import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Animated, Image, Modal, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import IntroductionScreen from "@screens/OnBoarding/Introduction/IntroductionScreen";
import { getIsIntroductionHasShow } from "@screens/OnBoarding/Introduction/utility";

import { DASHBOARD_STACK, MANAGE_DASHBOARD } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FeaturedArticles from "@components/Dashboard/FeaturedArticles";
import FeaturedPromos from "@components/Dashboard/FeaturedPromos";
import MaybankHeartWidget from "@components/Dashboard/MaybankHeartWidget";
import Sama2LokalWidget from "@components/Dashboard/Sama2LokalWidget";
import SpendingSummary from "@components/Dashboard/SpendingSummary";
import SurveyWidget from "@components/Dashboard/SurveyWidget";
import TabungSummary from "@components/Dashboard/TabungSummary";
import BannerSwiper from "@components/Dashboard/new/BannerSwiper";
import QuickAction from "@components/Dashboard/new/QuickAction";
import TopSections from "@components/Dashboard/new/TopSections";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { logEvent } from "@services/analytics";
import { withApi } from "@services/api";

import { FADE_GREY, MEDIUM_GREY, SEPARATOR, TRANSPARENT, WHITE, YELLOW } from "@constants/colors";
import {
    FA_ACTION_NAME,
    FA_DASHBOARD,
    FA_LOGIN,
    FA_MANAGE_WIDGETS,
    FA_METHOD,
    FA_PASSWORD,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_SCREEN,
} from "@constants/strings";

import { getIsSSLHighlightDisabledFlag, massageWidgetData } from "@utils/dataModel/utility";
import useFestive, { fetchS3Config } from "@utils/useFestive";

import Images from "@assets";

import { defaultWidgets } from "./ManageDashboard";
import { defaultActions, defaultAllActions } from "./QuickActions/data";

function Separator({ noGutter }) {
    return (
        <View style={[styles.separator, noGutter && styles.separatorNoGutter]}>
            <SpaceFiller width="100%" height={1} backgroundColor={SEPARATOR} />
        </View>
    );
}

Separator.propTypes = {
    noGutter: PropTypes.bool,
};

function Footer({ navigation, isOnboard }) {
    function handleManageWidget() {
        if (!isOnboard) {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: FA_DASHBOARD,
                [FA_ACTION_NAME]: FA_MANAGE_WIDGETS,
            });

            navigation.navigate("Onboarding", {
                screen: "OnboardingStart",
            });
        } else {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: FA_DASHBOARD,
                [FA_ACTION_NAME]: FA_MANAGE_WIDGETS,
            });

            navigation.navigate(DASHBOARD_STACK, {
                screen: "Dashboard",
                params: { screen: MANAGE_DASHBOARD },
            });
        }
    }

    return (
        <View style={styles.footer}>
            <View style={styles.footerBg}>
                <Image source={Images.dashboardManage} style={styles.footerBgImg} />
            </View>

            <View>
                <Typo
                    fontSize={18}
                    fontWeight="600"
                    lineHeight={32}
                    text="Personalise Your Space"
                    style={styles.footerTitle}
                />
                <Typo
                    fontSize={14}
                    fontWeight="normal"
                    lineHeight={20}
                    text="Choose the widgets that you'd like to see and make this space feel more like you!"
                    style={styles.footerDescription}
                />
                <View style={styles.footerActionContainer}>
                    <ActionButton
                        backgroundColor={YELLOW}
                        borderRadius={20}
                        height={42}
                        componentCenter={
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text="Manage Widgets"
                            />
                        }
                        style={styles.footerAction}
                        onPress={handleManageWidget}
                    />
                </View>
            </View>
        </View>
    );
}

Footer.propTypes = {
    navigation: PropTypes.object,
    isOnboard: PropTypes.bool,
};

function StatusBarCover({ fadeValue }) {
    const safeAreaInsets = useSafeAreaInsets();

    return (
        <Animated.View
            style={[
                styles.statusBarCover,
                {
                    height: safeAreaInsets.top,
                    opacity: fadeValue(),
                },
            ]}
            testID="dashboard_status_bar"
        />
    );
}

StatusBarCover.propTypes = {
    fadeValue: PropTypes.func,
};

function RemapWidget({ widget, sslReady, ...props }) {
    switch (widget) {
        case "samaSamaLokalWidget":
            if (sslReady) {
                return <Sama2LokalWidget navigation={props.navigation} {...props} />;
            } else return null;
        case "surveyingWidget":
            return <SurveyWidget navigation={props.navigation} {...props} />;
        case "tabung":
            return <TabungSummary navigation={props.navigation} {...props} />;

        case "spending":
            return <SpendingSummary {...props} />;

        case "promotions":
            return <FeaturedPromos {...props} />;

        case "articles":
            return <FeaturedArticles {...props} />;

        default:
            return null;
    }
}

RemapWidget.propTypes = {
    sslReady: PropTypes.bool,
    widget: PropTypes.string,
    navigation: PropTypes.object,
    applePayEnable: PropTypes.bool,
    isOnboard: PropTypes.bool,
    eligibleDevice: PropTypes.bool,
    dashboardWidget: PropTypes.object,
};

function Home({ navigation, getModel, updateModel, api }) {
    const [isPullRefresh, setPullRefresh] = useState(false);
    const [isBalanceRefresh, setBalanceRefresh] = useState(false);
    const [isForceUpdate, setForceUpdate] = useState(0);
    const dashboardScrollRef = useRef();
    const [initialLoaded, setInitialLoaded] = useState(1);
    const [visibleIntroScreen, setVisibleIntroScreen] = useState(false);
    const {
        user: { isOnboard },
        auth: { isPostLogin },
        dashboard: { widgets, quickActions, refresh, isRendered },
        misc: {
            isDonationReady,
            isTapTasticReady,
            isTapTasticDonationReady,
            atmCashOutReady,
            propertyMetadata,
            isShowSecureSwitch,
            autoBillingEnable,
            tapTasticType
        },
        ssl: { sslReady, isSSLHighlightDisabled },
        atm: { isEnabled, isOnboarded, statusMsg, statusHeader },
        s2uIntrops: { mdipS2uEnable },
        myGroserReady,
    } = getModel([
        "user",
        "auth",
        "dashboard",
        "misc",
        "ssl",
        "atm",
        "myGroserReady",
        "s2uIntrops",
    ]);

    //first load we set "fadeIn" animation, after rendered we put as undefined (no animation)
    const screenAnimation = isRendered ? undefined : "fadeIn";
    const scrollY = new Animated.Value(0);

    const { festiveAssets } = useFestive();

    useScrollToTop(dashboardScrollRef);

    function fadeCover() {
        return scrollY.interpolate({
            inputRange: [0, 140, 280],
            outputRange: [0, 0.5, 1],
            extrapolate: "clamp",
        });
    }

    const updateWidgetsDashboard = useCallback(
        async (widgets) => {
            console.tron.log("updateWidgetsDashboard");
            updateModel({
                dashboard: {
                    widgets,
                },
            });
            AsyncStorage.setItem("dashboardWidgetsList", JSON.stringify(widgets));
        },
        [updateModel]
    );

    const updateWidgetsQuickActions = useCallback(
        async (quickActionsSource) => {
            const quickActions = quickActionsSource;

            AsyncStorage.setItem("dashboardQuickActions", JSON.stringify(quickActions)).then(() => {
                updateModel({
                    dashboard: {
                        quickActions,
                    },
                });
            });
        },
        [updateModel]
    );

    async function checkIntroductionScreen() {
        const isIntroductionHasShow = await getIsIntroductionHasShow();
        setVisibleIntroScreen(!isIntroductionHasShow);
    }

    function closeIntroScreen() {
        setVisibleIntroScreen(false);
    }

    function updateDashboardIsRendered() {
        //This is for unmountOnBlur, check on TabNavigator.js
        //for unmount the stack, for example
        //open notification inbox from home page, go to another tab
        //and click home tab again
        //will remove notification page
        updateModel({
            dashboard: {
                isRendered: true,
            },
        });
    }

    const prepareDashboard = useCallback(
        async (onBoard = isOnboard) => {
            console.log("prepareDashboard ", isTapTasticReady);
            // Prepare Quick Actions
            let quickActions;
            const storedQuickActions = JSON.parse(
                await AsyncStorage.getItem("dashboardQuickActions")
            );

            const festiveQuickAction = festiveAssets?.quickAction;
            const isEnableFestive = festiveQuickAction?.isEnabled;
            const dashboardQuickActions = storedQuickActions?.data;
            const dashboardQuickActionsLenght = dashboardQuickActions
                ? dashboardQuickActions.length
                : "";
            const newActions = isOnboard
                ? checkMissingQuickActions(dashboardQuickActions, isEnableFestive)
                : [];

            if (newActions && newActions.length < dashboardQuickActionsLenght) {
                //if have missing actions, will reset to defaultActions
                quickActions = {
                    data: defaultActions,
                    selectedCampaign: tapTasticType,
                };
            } else if (newActions && newActions.length === dashboardQuickActionsLenght) {
                //if no missing actions, will set same actions as storedQuickActions in async storage
                quickActions = storedQuickActions;
            } else {
                //for cases that user not onboard yet
                quickActions = {
                    data: defaultActions,
                    selectedCampaign: "default",
                };
            }
            updateWidgetsQuickActions(quickActions).then();

            // Prepare Dashboard Banner Widget
            const storedWidgets = await AsyncStorage.getItem("dashboardWidgetsList");
            updateWidgetsDashboard(massageWidgetData({ storedWidgets, defaultWidgets, sslReady }));
        },
        [sslReady, updateWidgetsDashboard, updateWidgetsQuickActions, festiveAssets]
    );

    //To check if there are missing actions in dashboard quick actions
    const checkMissingQuickActions = (dashboardQuickActions, festivePeriod) => {
        //Checking for e-greetings action
        const festiveAction = dashboardQuickActions.find((main) => main.id === "egreetings") ?? "";
        const viewAllAction = dashboardQuickActions.find((main) => main.id === "viewAll") ?? "";
        const newActions = defaultAllActions.filter((action) => {
            return dashboardQuickActions.find((main) => main.id === action.id);
        });
        //if festive period -> push festiveAction into new actions
        if (festivePeriod && festiveAction) {
            newActions.push(festiveAction);
        }
        if (viewAllAction) {
            newActions.push(viewAllAction);
        }
        return newActions;
    };

    const onRefresh = useCallback(
        (skipBalanceRefresh = false) => {
            setPullRefresh(true);
            if (!skipBalanceRefresh) {
                setBalanceRefresh(true);
            }
            setForceUpdate(isForceUpdate + 1);
            setInitialLoaded(initialLoaded + 1); //this one will compare with loaded flag at TabungSummary.js, SpendingSummary.js, FeaturesPromo.js and FeaturesArticle.js after trigger once the api cannot be trigger again until user refresh dashboard because when user refresh initialLoaded will added 1.

            updateModel({
                dashboard: {
                    refresh: false,
                },
            });

            setTimeout(() => {
                setPullRefresh(false);
                if (!skipBalanceRefresh) {
                    setBalanceRefresh(false);
                }
            }, 2000);
            // forceUpdate;
        },
        [isForceUpdate, updateModel]
    );

    useEffect(() => {
        //GA Events
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_DASHBOARD,
        });
        getIsSSLHighlightDisabledFlag({ updateModel, AsyncStorage });
        //please donot add dependency as getModel
    }, []);
    useEffect(() => {
        fetchS3Config(getModel);
    }, [tapTasticType]);

    //If onboarded and focused to the dashboard, checkIntroScreen
    useFocusEffect(
        useCallback(() => {
            if (isOnboard) {
                checkIntroductionScreen();
            }
        }, [isOnboard])
    );

    useEffect(() => {
        if (isOnboard) {
            logEvent(FA_LOGIN, {
                [FA_METHOD]: FA_PASSWORD,
            });
            prepareDashboard(isOnboard);
        }
    }, [isOnboard]);

    useEffect(() => {
        prepareDashboard(isOnboard);
    }, [prepareDashboard, isForceUpdate, isOnboard]);

    useEffect(() => {
        if (refresh) onRefresh(true);
    }, [refresh, onRefresh]);

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={WHITE}>
                <Animatable.View
                    animation={screenAnimation}
                    duration={800}
                    delay={500}
                    style={styles.dashboardWrapper}
                    useNativeDriver
                    onAnimationEnd={updateDashboardIsRendered}
                >
                    <StatusBarCover fadeValue={fadeCover} />
                    <Viewport.Tracker>
                        <ScrollView
                            ref={(ref) => (dashboardScrollRef.current = ref)}
                            onScroll={Animated.event(
                                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                                { useNativeDriver: false }
                            )}
                            scrollEventThrottle={20}
                            showsVerticalScrollIndicator={false}
                            style={styles.dashboardScroll}
                            contentContainerStyle={[styles.dashboardContainer]}
                            refreshControl={
                                <RefreshControl
                                    tintColor={FADE_GREY}
                                    refreshing={isPullRefresh}
                                    onRefresh={onRefresh}
                                />
                            }
                            testID="dashboard_scroll_view"
                        >
                            <TopSections
                                isBalanceRefresh={isBalanceRefresh}
                                isTapTasticReady={isTapTasticReady}
                            />
                            <QuickAction
                                quickActions={quickActions}
                                isOnboard={isOnboard}
                                navigation={navigation}
                                isCampaignOn={isTapTasticReady}
                                atmData={{
                                    featureEnabled: atmCashOutReady,
                                    userRegistered: isEnabled,
                                    userVerified: isOnboarded,
                                    statusMsg,
                                    statusHeader,
                                }}
                                propertyMetaData={propertyMetadata}
                                sslReady={sslReady}
                                sslIsHighlightDisabled={isSSLHighlightDisabled}
                                secureSwitchEnabled={isShowSecureSwitch}
                                myGroserAvailable={myGroserReady.code}
                                mdipS2uEnable={mdipS2uEnable}
                                tapTasticType={tapTasticType}
                                autoBillingEnable={autoBillingEnable}
                            />
                            <SpaceFiller height={52} />
                            <BannerSwiper />
                            <SpaceFiller height={36} />

                            <View style={styles.widgetsContainer}>
                                {widgets &&
                                    !!widgets.length &&
                                    widgets.map((widget, index) => (
                                        <Fragment key={index}>
                                            <RemapWidget
                                                key={widget.id}
                                                widget={widget.id}
                                                isOnboard={isOnboard}
                                                isPostLogin={isPostLogin}
                                                isRefresh={isForceUpdate}
                                                navigation={navigation}
                                                sslReady={sslReady}
                                                initialLoaded={initialLoaded}
                                            />
                                        </Fragment>
                                    ))}
                            </View>

                            {(isTapTasticDonationReady || isDonationReady) && (
                                <MaybankHeartWidget
                                    navigation={navigation}
                                    isOnboard={isOnboard}
                                    isPostLogin={isPostLogin}
                                    isRefresh={isForceUpdate}
                                    isTapTastic={isTapTasticReady}
                                />
                            )}
                            <Separator noGutter />

                            <Footer
                                isOnboard={isOnboard}
                                isPostLogin={isPostLogin}
                                navigation={navigation}
                            />
                        </ScrollView>
                    </Viewport.Tracker>
                    {/*</SafeAreaView> */}
                </Animatable.View>
            </ScreenContainer>
            <Modal
                visible={visibleIntroScreen}
                animated
                animationType="slide"
                hardwareAccelerated
                transparent
            >
                <IntroductionScreen onClose={closeIntroScreen} />
            </Modal>
        </>
    );
}

Home.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    api: PropTypes.object,
};

export const styles = StyleSheet.create({
    dashboardContainer: {
        backgroundColor: TRANSPARENT,
        paddingBottom: 0,
    },
    dashboardScroll: {
        backgroundColor: TRANSPARENT,
        flex: 1,
    },
    dashboardWrapper: {
        flex: 1,
        position: "relative",
    },
    footer: {
        paddingBottom: 350,
        paddingHorizontal: 62,
        paddingTop: 34,
        position: "relative",
        backgroundColor: MEDIUM_GREY,
    },
    footerAction: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    footerActionContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    footerBg: {
        bottom: 0,
        height: 436,
        left: 0,
        position: "absolute",
        right: 0,
    },
    footerBgImg: {
        height: 436,
        width: "100%",
    },
    footerDescription: {
        marginBottom: 16,
    },
    footerTitle: {
        marginBottom: 8,
    },
    separator: {
        backgroundColor: MEDIUM_GREY,
        paddingBottom: 24,
        paddingHorizontal: 24,
    },
    separatorNoGutter: {
        paddingVertical: 0,
    },
    statusBarCover: {
        backgroundColor: MEDIUM_GREY,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
        width: "100%",
        zIndex: 77,
    },
    widgetsContainer: {
        backgroundColor: MEDIUM_GREY,
        paddingVertical: 24,
    },
});

export default React.memo(withApi(withModelContext(Home)));
