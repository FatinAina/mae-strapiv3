import PropTypes from "prop-types";
import React, { useEffect, useCallback, useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";

import {
    STP_CARD_MODULE,
    EC_PERSONAL_DETAILS,
    MORE,
    APPLY_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { getConsent } from "@services";

import { STATUS_CODE_SUCCESS } from "@constants/api";
import { MEDIUM_GREY, BLACK, YELLOW, DISABLED, DISABLED_TEXT } from "@constants/colors";
import {
    STP_TNC,
    COMMON_ERROR_MSG,
    CREDIT_REF_TITLE,
    CREDIT_REF_DESC,
    CREDIT_TNC,
    PROCEED,
} from "@constants/strings";

function ECConsent({ route, navigation }) {
    const [isTncSelected, setIsTncSelected] = useState(false);
    const [isContinueDisabled, setContinueDisabled] = useState(true);

    useEffect(() => {
        init();
    }, []);

    const init = useCallback(() => {
        console.log("[ECConsent] >> [init]");
    }, [route, navigation]);

    // Used to check if all fields are filled in, then accordingly enable/disable "Proceed" btn
    useEffect(() => {
        setContinueDisabled(!isTncSelected);
    }, [isTncSelected]);

    const onBackPress = () => {
        console.log("[ECConsent] >> [onBackPress]");
        navigation.canGoBack() && navigation.goBack();
    };

    function onCloseTap() {
        console.log("[ECConsent] >> [onCloseTap]");
        navigation.navigate(route?.params?.entryStack || MORE, {
            screen: route?.params?.entryScreen || APPLY_SCREEN,
            params: route?.params?.entryParams,
        });
    }

    async function onContinue() {
        console.log("[ECConsent] >> [onContinue]");
        const navParams = route?.params ?? {};
        const mbosRefNo = navParams?.mbosRefNo ?? "";
        
        //Make api request
        const params = { mbosRefNo, channelType: "mae" };

        try {
            const httpResp = await getConsent(params);
            const result = httpResp?.result ?? {};
            const statusCode = result?.statusCode ?? null;
            const statusDesc = result?.statusDesc ?? COMMON_ERROR_MSG;
            const isSuccess = result?.isSuccess ?? false;

            if (statusCode === STATUS_CODE_SUCCESS) {
                if (isSuccess) {
                    // Navigate to EC Personal screen
                    navigation.navigate(STP_CARD_MODULE, {
                        screen: EC_PERSONAL_DETAILS,
                        params: {
                            ...route.params,
                        },
                    });
                } else {
                    // Navigate to ETB Flow
                    navigation.navigate("CardsIntro", {
                        ...route.params,
                    });
                }
            } else {
                // Show error message
                showErrorToast({ message: statusDesc });
            }
        } catch (error) {
            const errorMsg = error?.message || error?.result?.statusDesc || COMMON_ERROR_MSG;
            showErrorToast({ message: errorMsg });
            console.log("[ECConsent][onContinue] >> Exception: ", error);
        }
    }

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingBottom={0}
                    paddingHorizontal={0}
                    useSafeArea
                >
                    <View style={styles.container}>
                        <Typo lineHeight={18} text={CREDIT_REF_TITLE} textAlign="left" />
                        <Typo
                            lineHeight={20}
                            text={CREDIT_REF_DESC}
                            textAlign="left"
                            style={styles.fieldViewCls}
                            fontWeight="600"
                            fontSize={16}
                        />
                        <View style={styles.tncContainer}>
                            <Typo
                                lineHeight={18}
                                text={STP_TNC}
                                textAlign="left"
                                fontWeight="600"
                            />
                            <TouchableOpacity
                                style={styles.tncRow}
                                onPress={() => setIsTncSelected(!isTncSelected)}
                            >
                                <View>{isTncSelected ? <RadioChecked /> : <RadioUnchecked />}</View>
                                <Typo
                                    text={CREDIT_TNC}
                                    textAlign="left"
                                    lineHeight={20}
                                    style={styles.tncAgreeText}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <FixedActionContainer>
                        <ActionButton
                            disabled={isContinueDisabled}
                            activeOpacity={isContinueDisabled ? 1 : 0.5}
                            backgroundColor={isContinueDisabled ? DISABLED : YELLOW}
                            fullWidth
                            componentCenter={
                                <Typo
                                    color={isContinueDisabled ? DISABLED_TEXT : BLACK}
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={PROCEED}
                                />
                            }
                            onPress={onContinue}
                        />
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>
        </>
    );
}

ECConsent.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    fieldViewCls: {
        marginTop: 8,
    },
    tncContainer: {
        paddingHorizontal: 18,
        marginTop: 36,
    },
    tncAgreeText: {
        paddingLeft: 10,
    },
    tncRow: {
        marginVertical: 10,
        flexDirection: "row",
    },
});

export default ECConsent;
