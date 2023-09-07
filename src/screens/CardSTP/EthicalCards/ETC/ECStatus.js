import PropTypes from "prop-types";
import React, { useEffect, useCallback, useState } from "react";
import { View, StyleSheet, Dimensions, ScrollView } from "react-native";
import * as Animatable from "react-native-animatable";

import { MORE, APPLY_SCREEN } from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { MEDIUM_GREY, BLACK, YELLOW } from "@constants/colors";
import {
    CARD,
    DONE,
    REFERENCE_ID,
    DATE_AND_TIME,
    APPLICATION_APPROVED,
    APPLICATION_SUCCESSFUL,
    APPLICATION_REJECTED,
    NOTIFY_APPLICATION_STATUS,
    ETHICAL_CARD_CUSTOMER_CARE,
    CREDIT_CARD_NUM,
    CARD_WILL_BE_DELIVERED,
} from "@constants/strings";

import Assets from "@assets";

const screenHeight = Dimensions.get("window").height;
const imageHeight = Math.max((screenHeight * 40) / 100, 300);

const imgAnimFadeInUp = {
    0: {
        opacity: 0,
        translateY: 40,
    },
    1: {
        opacity: 1,
        translateY: 0,
    },
};

function ECStatus({ route, navigation }) {
    const [statusMsg, setStatusMsg] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("");
    const [details, setDetails] = useState([]);

    useEffect(() => {
        init();
    }, []);

    const init = useCallback(() => {
        console.log("[ECStatus] >> [init]");
        const navParams = route?.params ?? {};
        const status = navParams?.status ?? "NOT_EXECUTE";
        //const mbosRefNo = navParams?.mbosRefNo ?? "";
        const dateTime = navParams?.dateTime ?? "";
        const referenceNo = navParams?.referenceNo ?? "";
        const cardName = navParams?.cardName ?? "";
        const cardNumberList = navParams?.cardNumberList ?? "";

        const statusMessage =
            status === "APPROVED"
                ? APPLICATION_APPROVED
                : status === "APPROVE_IN_PRINCIPLE"
                ? APPLICATION_SUCCESSFUL
                : APPLICATION_REJECTED;
        setStatusMsg(statusMessage);

        const description =
            status === "APPROVED"
                ? CARD_WILL_BE_DELIVERED
                : status === "APPROVE_IN_PRINCIPLE"
                ? NOTIFY_APPLICATION_STATUS
                : ETHICAL_CARD_CUSTOMER_CARE;
        setDescription(description);

        const DETAILS = [
            {
                label: CARD,
                value: cardName,
            },
            ...(status === "APPROVED" && cardNumberList
                ? [
                      {
                          label: CREDIT_CARD_NUM,
                          value: cardNumberList,
                      },
                  ]
                : []),
            {
                label: REFERENCE_ID,
                value: referenceNo,
            },
            {
                label: DATE_AND_TIME,
                value: dateTime,
            },
        ];
        setDetails(DETAILS);
        setStatus(status);
    }, [route, navigation]);

    function onDonePress() {
        navigation.navigate(route?.params?.entryStack || MORE, {
            screen: route?.params?.entryScreen || APPLY_SCREEN,
            params: route?.params?.entryParams,
        });
    }

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    useSafeArea
                    neverForceInset={["top"]}
                    header={<View />}
                >
                    <ScrollView showsVerticalScrollIndicator={false} scrollEventThrottle={16}>
                        <View style={styles.imageContainer(imageHeight)}>
                            <Animatable.Image
                                animation={imgAnimFadeInUp}
                                delay={500}
                                duration={500}
                                source={
                                    status === "APPROVED"
                                        ? Assets.onboardingSuccessBg
                                        : status === "APPROVE_IN_PRINCIPLE"
                                        ? Assets.cardsStatusBg
                                        : Assets.illustrationEmptyState
                                }
                                style={styles.imageCls}
                                resizeMode="cover"
                                useNativeDriver
                            />
                        </View>

                        <View style={styles.horizontalMargin}>
                            <Typo lineHeight={18} textAlign="left" text={statusMsg} />
                            <View>
                                {/* Application approved/Application successful/Application rejected */}
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={20}
                                    style={styles.label}
                                    text={description}
                                    textAlign="left"
                                />
                            </View>
                            <View style={styles.fieldView}>
                                {details.map((item, index) => (
                                    <LabelValue
                                        label={item?.label}
                                        value={item?.value}
                                        key={index}
                                    />
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Bottom docked button container */}
                    <FixedActionContainer>
                        <View style={styles.bottomBtnContCls}>
                            <ActionButton
                                activeOpacity={0.5}
                                backgroundColor={YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typo
                                        text={DONE}
                                        fontWeight="600"
                                        lineHeight={18}
                                        color={BLACK}
                                    />
                                }
                                onPress={onDonePress}
                            />
                        </View>
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>
        </>
    );
}

ECStatus.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const LabelValue = ({ label, value }) => {
    return (
        <View style={styles.labelValueContainer}>
            <Typo text={label} fontSize={12} lineHeight={18} textAlign="left" />
            <Typo text={value} fontSize={12} lineHeight={18} fontWeight="600" textAlign="left" />
        </View>
    );
};

LabelValue.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
};

const styles = StyleSheet.create({
    horizontalMargin: {
        marginHorizontal: 24,
        marginTop: 15,
    },
    fieldView: {
        marginTop: 24,
    },
    imageContainer: (imageHeight) => ({
        alignItems: "center",
        height: imageHeight,
    }),
    imageCls: {
        height: "100%",
        width: "100%",
    },
    label: {
        paddingTop: 8,
    },
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    labelValueContainer: {
        paddingVertical: 10,
    },
});

export default ECStatus;
