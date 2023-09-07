import { useFocusEffect } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import Conf from "react-native-config";
import DeviceInfo from "react-native-device-info";
import { WebView } from "react-native-webview";

import { PAYBILLS_MODULE, PAYBILLS_PAYEE_DETAILS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { getPayeeDetails } from "@services";

import { GREY, TRANSPARENT } from "@constants/colors";
import { COMMON_ERROR_MSG } from "@constants/strings";

import useFestive from "@utils/useFestive";

export default function TapTrackWin({ navigation, route }) {
    const [isReady, setReady] = useState(false);
    const webview = useRef(null);
    const { getModel } = useModelController();

    const {
        qrPay: { isEnabled: qrEnabled },
        misc: { campaignWebViewUrl },
        auth: { token },
    } = getModel(["auth", "qrPay", "misc", "user", "device"]);

    const webViewUrl = campaignWebViewUrl || Conf?.CAMPAIGN_WEBVIEW_URL;
    const baseUrl = `${webViewUrl}?token=${token}&appVersion=${DeviceInfo.getVersion()}`;

    const [uri, setUri] = useState(baseUrl);
    const { festiveAssets } = useFestive();

    function renderLoading() {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator color={GREY} size="small" />
            </View>
        );
    }
    const handleOnback = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    function handleLoadReady() {
        setReady(true);
    }

    useFocusEffect(
        useCallback(() => {
            if (route?.params?.isRefresh) {
                navigation.setParams({
                    isRefresh: false,
                });
            }
        }, [navigation, route?.params?.isRefresh])
    );

    useEffect(() => {
        if (route?.params?.isRefresh) {
            webview?.current?.reload && webview?.current?.reload();
        }
    }, [baseUrl, route?.params?.isRefresh]);

    const handleRedirection = useCallback(
        ({ stack = null, screen, params = {} }) => {
            if (stack) {
                navigation.push(stack, {
                    screen,
                    params,
                });
            } else if (screen) {
                navigation.push(screen, params);
            }
        },
        [navigation]
    );

    function applyRule(data) {
        // TODO: Error handling ;)
        // if(data === undefined) return data;
        if (typeof data === "string" || data instanceof String) {
            return data;
        }
        if (typeof data === "object" && !Array.isArray(data) && data !== null) {
            const key = Object.keys(data)[0];
            return data[key][qrEnabled];
        }
    }

    function createRequiredFieldObj(fieldLabel, fieldValue, fieldName) {
        const alternateLabel =
            fieldName === "bilAcct" ? "Bill Account Number" : "Bill Reference Number";
        return {
            fieldLabel,
            fieldValue: "",
            fieldName,
            alternateLabel,
        };
    }

    const handleGoToDonate = useCallback(async () => {
        try {
            const response = await getPayeeDetails(["AJD"]);
            console.log("[MaybankHeartWidget][getPayeeDetails] >> Success");
            const mbbHeartPayeeDetails = response?.data?.resultList[0] ?? [];
            console.log(
                "[MaybankHeartWidget][getPayeeDetails] >> mbbHeartPayeeDetails:",
                mbbHeartPayeeDetails
            );

            const requiredFieldArray = [];

            if (mbbHeartPayeeDetails.billAcctRequired === "0" && requiredFieldArray.length < 2) {
                requiredFieldArray.push(
                    createRequiredFieldObj(
                        mbbHeartPayeeDetails.bilAcctDispName,
                        mbbHeartPayeeDetails.acctId,
                        "bilAcct"
                    )
                );
            }

            if (mbbHeartPayeeDetails.billRefRequired === "0" && requiredFieldArray.length < 2) {
                requiredFieldArray.push(
                    createRequiredFieldObj(mbbHeartPayeeDetails.billRefDispName, "", "billRef")
                );
            }

            navigation.navigate(PAYBILLS_MODULE, {
                screen: PAYBILLS_PAYEE_DETAILS,
                params: {
                    billerInfo: {
                        ...mbbHeartPayeeDetails,
                        fullName: "MaybankHeart",
                        subName: "Maybank",
                    },
                    requiredFields: [...requiredFieldArray],
                    donationFlow: true,
                },
            });
        } catch (error) {
            console.log("[MaybankHeartWidget][getPayeeDetails] >> Exception:", error);
        }
    }, [navigation]);

    function handleOnEvent(event) {
        console.tron.log("CTA Button ", event?.nativeEvent?.data);

        // handle token error
        const data = event?.nativeEvent?.data;
        if (data === "donate") {
            handleGoToDonate();
        } else if (data === "mae_dashboard") {
            handleOnback();
        } else if (data && festiveAssets?.DeepLinking[data]) {
            const { stack, screen, params } = festiveAssets?.DeepLinking[data];
            handleRedirection({
                stack,
                screen: applyRule(screen),
                params,
            });
        } else {
            console.warn("Unhandled event:", data);
        }
    }

    function onError(syntheticEvent) {
        const { nativeEvent } = syntheticEvent;
        console.log("WebView error: ", nativeEvent);
        showErrorToast({
            message: COMMON_ERROR_MSG,
        });
        handleOnback();
    }

    function onHttpError(syntheticEvent) {
        const { nativeEvent } = syntheticEvent;
        console.log("WebView HTTP error: ", nativeEvent);
    }

    function onLoad(syntheticEvent) {
        const { nativeEvent } = syntheticEvent;
        setUri(nativeEvent.url);
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={TRANSPARENT}
                showLoaderModal={!isReady}
            >
                <>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        isGame
                        header={
                            <HeaderLayout
                                backgroundColor={TRANSPARENT}
                                headerLeftElement={
                                    <HeaderBackButton isWhite={false} onPress={handleOnback} />
                                }
                            />
                        }
                        contentContainerStyle={styles.gameContainer}
                    >
                        <WebView
                            ref={webview}
                            originWhitelist={["*"]}
                            source={{
                                uri,
                            }}
                            startInLoadingState
                            javaScriptEnabled
                            bounces={false}
                            allowUniversalAccessFromFileURLs
                            renderLoading={renderLoading}
                            mixedContentMode="always"
                            containerStyle={styles.webviewContainer}
                            onMessage={handleOnEvent}
                            onLoadEnd={handleLoadReady}
                            onError={onError}
                            onHttpError={onHttpError}
                            onLoad={onLoad}
                        />
                    </ScreenLayout>
                </>
            </ScreenContainer>
        </>
    );
}

TapTrackWin.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    gameContainer: { flex: 1 },
    loaderContainer: {
        ...StyleSheet.absoluteFill,
        alignItems: "center",
        justifyContent: "center",
    },
    webviewContainer: {
        flex: 1,
    },
});
