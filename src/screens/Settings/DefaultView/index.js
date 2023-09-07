import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import { successToastProp, showSuccessToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { logEvent } from "@services/analytics";

import { YELLOW, DISABLED, WHITE, DISABLED_TEXT, BLACK } from "@constants/colors";
import {
    DEFAULT_VIEW_HEADER,
    DEFAULT_VIEW_BANNER_DESC,
    DEFAULT_VIEW_BANNER_HEADER,
    ACCOUNT_VIEW,
    DASHBOARD_VIEW,
    DEFAULT_VIEW_SUCCESS_MESSAGE,
    DEFAULT_VIEW_SUCCESS_MESSAGE_ACC,
    FA_FIELD_INFORMATION,
    FA_FORM_COMPLETE,
    FA_SCREEN_NAME,
    FA_SETTINGS_DEFAULT_VIEW,
    FA_SETTINGS_DEFAULT_VIEW_SAVE,
    DEFAULT_VIEW_CLOUD_LOG,
} from "@constants/strings";

import { insertSeparators } from "@utils/array";
import { storeCloudLogs } from "@utils/cloudLog";
import {
    AVAILABLE_DASHBOARDS,
    getDefaultDashboard,
    setDefaultDashboard,
} from "@utils/dataModel/utilityDashboard";

import assets from "@assets";

const items = [
    {
        key: AVAILABLE_DASHBOARDS.HOME,
        source: assets.dashboardView,
        text: DASHBOARD_VIEW,
    },
    {
        key: AVAILABLE_DASHBOARDS.ACCOUNTS,
        source: assets.accountView,
        text: ACCOUNT_VIEW,
    },
];

function DefaultView({ navigation, route }) {
    const { getModel, updateModel } = useModelController();
    const [disableSave, setDisableSave] = useState(true);
    const [selectedView, setSelectedView] = useState(getDefaultDashboard(getModel));
    const isFromAccountsDashboard = route?.params?.from === "Accounts";

    useEffect(() => {
        const contextVal = getDefaultDashboard(getModel);
        setDisableSave(contextVal === selectedView);
    }, [selectedView]);

    function onBackButtonPressed() {
        navigation.goBack();
    }

    function onItemPressed(key) {
        setSelectedView(key);
    }

    async function saveDashboard() {
        const item = items.find((i) => i.key === selectedView);
        await setDefaultDashboard(updateModel, selectedView);
        showSuccessToast(
            successToastProp({
                message: isFromAccountsDashboard
                    ? DEFAULT_VIEW_SUCCESS_MESSAGE_ACC
                    : `${DEFAULT_VIEW_SUCCESS_MESSAGE} ${item?.text}.`,
            })
        );

        setDisableSave(true);

        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_SETTINGS_DEFAULT_VIEW,
            [FA_FIELD_INFORMATION]: FA_SETTINGS_DEFAULT_VIEW_SAVE.replace("Index", item?.text),
        });

        syncToCloud(item?.text);

        if (isFromAccountsDashboard) {
            navigation.goBack();
        }
    }

    const syncToCloud = (view) => {
        storeCloudLogs(getModel, {
            errorType: DEFAULT_VIEW_CLOUD_LOG,
            errorDetails: view,
        });
    };

    return (
        <ScreenContainer backgroundType="color" analyticScreenName={FA_SETTINGS_DEFAULT_VIEW}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                useSafeArea
                neverForceInset={["bottom"]}
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackButtonPressed} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text="Default View"
                            />
                        }
                    />
                }
            >
                <KeyboardAwareScrollView enabled behavior={Platform.OS === "ios" ? "padding" : ""}>
                    <Typo
                        fontSize={20}
                        fontWeight="400"
                        lineHeight={24}
                        text={DEFAULT_VIEW_HEADER}
                    />
                    <View style={style.optionContainer}>
                        {insertSeparators(
                            items.map((item) => {
                                return (
                                    <View style={style.imageStyle} key={item.key}>
                                        <TouchableOpacity onPress={() => onItemPressed(item.key)}>
                                            <Image source={item.source} />
                                        </TouchableOpacity>
                                        <Typo
                                            fontSize={12}
                                            lineHeight={18}
                                            fontWeight="500"
                                            text={item.text}
                                            style={style.radioLabel}
                                        />
                                        <View style={style.radioButtonStyle}>
                                            <CustomRadioButton
                                                isSelected={selectedView === item.key}
                                                onPress={() => onItemPressed(item.key)}
                                            />
                                        </View>
                                    </View>
                                );
                            }),
                            (index) => (
                                <SpaceFiller key={`${index}-space`} width={8} />
                            )
                        )}
                    </View>

                    <View style={style.bannerCard}>
                        <View style={style.bannerStyle}>
                            <Image source={assets.iconDefaultView} style={style.image} />
                            <View style={style.contentStyle}>
                                <Typo
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={DEFAULT_VIEW_BANNER_HEADER}
                                />
                                <Typo
                                    fontSize={12}
                                    lineHeight={15}
                                    fontWeight="400"
                                    textAlign="left"
                                    style={style.bannerDescription}
                                    text={DEFAULT_VIEW_BANNER_DESC}
                                />
                            </View>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
                <View style={style.actionContainer}>
                    <ActionButton
                        fullWidth
                        disabled={disableSave}
                        onPress={saveDashboard}
                        borderRadius={25}
                        backgroundColor={disableSave ? DISABLED : YELLOW}
                        componentCenter={
                            <Typo
                                lineHeight={18}
                                fontWeight="600"
                                text="Save Changes"
                                color={disableSave ? DISABLED_TEXT : BLACK}
                            />
                        }
                    />
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const CustomRadioButton = ({ isSelected, onPress }) => {
    return (
        <TouchableOpacity style={style.customRadioContainer} onPress={onPress}>
            {isSelected && <View style={style.customRadioSelected}></View>}
        </TouchableOpacity>
    );
};

const style = StyleSheet.create({
    actionContainer: {
        padding: 24,
    },
    optionContainer: {
        paddingVertical: 40,
        flexDirection: "row",
        justifyContent: "space-evenly",
        backgroundColor: WHITE,
        marginTop: 20,
        marginHorizontal: 24,
        borderRadius: 7,
    },
    imageStyle: {
        justifyContent: "space-around",
    },
    radioLabel: { paddingTop: 18, paddingBottom: 8 },
    radioButtonStyle: {
        alignItems: "center",
    },
    bannerCard: {
        backgroundColor: WHITE,
        margin: 24,
        padding: 16,
        borderRadius: 7,
    },
    bannerDescription: {
        paddingTop: 6,
    },
    image: {
        width: 50,
        height: 50,
    },
    bannerStyle: {
        flexDirection: "row",
        alignItems: "center",
    },
    contentStyle: {
        flex: 1,
        flexDirection: "column",
        alignItems: "flex-start",
        paddingLeft: 4,
    },
    customRadioContainer: {
        borderColor: BLACK,
        borderRadius: 10,
        borderWidth: 1,
        height: 20,
        width: 20,
        padding: 2,
    },
    customRadioSelected: {
        backgroundColor: YELLOW,
        borderRadius: 10,
        flex: 1,
    },
});

DefaultView.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

CustomRadioButton.propTypes = {
    onPress: PropTypes.func,
    isSelected: PropTypes.bool,
};

export default withModelContext(DefaultView);
