import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useSafeArea } from "react-native-safe-area-context";
import PDFView from "react-native-view-pdf";
import { WebView } from "react-native-webview";

import GenericImageButton from "@components/Buttons/GenericImageButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { GREY, TRANSPARENT, LIGHT_GREY } from "@constants/colors";
import { CXVOC, KEY_CEP_UNIT, CEP_SURVEY } from "@constants/data";

import TurboStorage from "@libs/TurboStorage";

import { getDigitalIdentityByType } from "@utils/dataModel/utility";

import assets from "@assets";

export default function SurveyScreen({ navigation, route }) {
    const [isReady, setReady] = useState(false);
    const webview = useRef(null);

    const [data, setData] = useState(null);
    const [cepToken, setcepToken] = useState(null);
    const getDataSurveyUser = useCallback(async () => {
        try {
            const storageData = TurboStorage.getItem(KEY_CEP_UNIT);
            if (storageData) {
                const cepUnit = JSON.parse(storageData);
                setData(cepUnit?.[CXVOC]);
            } else {
                navigation.goBack();
            }
        } catch {
            navigation.goBack();
        }
    }, []);
    const getSurveyToken = async () => {
        try {
            const surveyToken = await getDigitalIdentityByType(CEP_SURVEY);
            if (surveyToken) {
                setcepToken(surveyToken);
            }
        } catch (error) {
            navigation.goBack();
        }
    };
    useEffect(() => {
        getDataSurveyUser();
    }, [getDataSurveyUser]);
    useEffect(() => {
        getSurveyToken();
    }, []);

    const BrowserSurvey = ({ title, onCloseButtonPressed, source, ...props }) => {
        const safeArea = useSafeArea();
        const uri = source?.uri ?? "";
        const uriLength = uri.length;
        const isPDF = uriLength && uri.slice(uriLength - 4).toLowerCase() === ".pdf";

        return (
            <View style={styles.container}>
                <View style={[styles.header, { paddingTop: safeArea.top }]}>
                    <View style={styles.headerColumn}>
                        <GenericImageButton
                            width={45}
                            height={45}
                            radius={0}
                            image={assets.icClose}
                            onPress={onCloseButtonPressed}
                        />
                    </View>
                    <View style={styles.titleArea}>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            textAlign="center"
                            numberOfLines={1}
                            text={title}
                        />
                    </View>
                    <View style={styles.headerColumn} />
                </View>
                {isPDF ? (
                    <PDFView style={styles.pdfView} resource={uri} resourceType="url" />
                ) : (
                    <WebView style={styles.webview} source={source} {...props} />
                )}
            </View>
        );
    };
    BrowserSurvey.propTypes = {
        title: PropTypes.string,
        onCloseButtonPressed: PropTypes.func,
        source: PropTypes.object,
    };
    function renderLoading() {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator color={GREY} size="small" />
            </View>
        );
    }
    const handleClose = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    function handleLoadReady() {
        setReady(true);
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={TRANSPARENT}
            showLoaderModal={!isReady}
        >
            {data && (
                <View style={styles.container}>
                    <BrowserSurvey
                        ref={webview}
                        originWhitelist={["*"]}
                        source={{
                            uri: data?.bannerLink + "?paramToken=" + cepToken,
                        }}
                        title={data?.bannerText}
                        startInLoadingState
                        javaScriptEnabled
                        bounces={false}
                        allowUniversalAccessFromFileURLs
                        renderLoading={renderLoading}
                        mixedContentMode="always"
                        style={styles.webviewContainer}
                        onLoadEnd={handleLoadReady}
                        onCloseButtonPressed={handleClose}
                    />
                </View>
            )}
        </ScreenContainer>
    );
}

SurveyScreen.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: LIGHT_GREY,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        flex: 1,
    },
    header: {
        alignItems: "center",
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    headerColumn: {
        flex: 0.1,
    },
    pdfView: {
        flex: 1,
    },
    titleArea: {
        alignItems: "center",
        flex: 0.8,
        justifyContent: "center",
        paddingLeft: 12,
    },
    webview: {
        flex: 1,
        opacity: 0.99,
    },
});
