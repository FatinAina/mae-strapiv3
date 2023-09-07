import numeral from "numeral";
import PropTypes from "prop-types";
import React from "react";
import { Dimensions, StyleSheet, View, ScrollView, Platform } from "react-native";
import * as Animatable from "react-native-animatable";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { ASB_GUARANTOR_FATCA_DECLARATION } from "@navigation/navigationConstant";

import Spring from "@components/Animations/Spring";
import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { asbUpdateCEP } from "@redux/services/ASBServices/asbApiUpdateCEP";

import { MEDIUM_GREY, SEPARATOR, WHITE } from "@constants/colors";
import { NEXT, APPLY_ASBFINANCINGGUARANTOR_SUCCESSFUL } from "@constants/strings";

import { getShadow } from "@utils/dataModel/utilityPartial.2";

import Assets from "@assets";

const GaurantorValidationSuccess = ({ route, navigation }) => {
    const title = route?.params?.dataSendNotification?.title;
    const subTitle = route?.params?.dataSendNotification?.subTitle;
    const headingTitle = route?.params?.dataSendNotification?.headingTitle;
    const headingTitleValue = route?.params?.dataSendNotification?.headingTitleValue;
    const bodyList = route?.params?.dataSendNotification?.bodyList;
    const asbGuarantorPrePostQualReducer = useSelector(
        (state) => state.asbServicesReducer.asbGuarantorPrePostQualReducer
    );
    const stpReferenceNumber = asbGuarantorPrePostQualReducer?.stpReferenceNo;

    const animateFadeInUp = {
        0: {
            opacity: 0,
            translateY: 10,
        },
        1: {
            opacity: 1,
            translateY: 0,
        },
    };

    const windowHeight = Dimensions.get("window").height;
    // Get 10% of entire window's height
    const partialWindowHeight = Math.round(windowHeight * 0.42);
    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    function onDoneTap() {
        updateApiCEP(() => {
            navigation.navigate(ASB_GUARANTOR_FATCA_DECLARATION);
        });
    }

    function updateApiCEP(callback) {
        const data = {
            stpReferenceNo: stpReferenceNumber,
            screenNo: "2",
        };
        dispatch(
            asbUpdateCEP(data, (data) => {
                if (data && callback) {
                    callback();
                }
            })
        );
    }

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName={APPLY_ASBFINANCINGGUARANTOR_SUCCESSFUL}
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
            >
                <React.Fragment>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <KeyboardAwareScrollView
                            behavior={Platform.OS === "ios" ? "padding" : ""}
                            enabled
                        >
                            <Animatable.Image
                                animation={animateFadeInUp}
                                delay={500}
                                duration={500}
                                source={Assets.eligibilitySuccess}
                                style={styles.backgroundImage}
                                useNativeDriver
                            />

                            <SpaceFiller height={partialWindowHeight} />
                            <View style={styles.containerView}>
                                <View style={styles.formContainer}>
                                    <View>
                                        {title && (
                                            <Typo
                                                fontWeight="600"
                                                lineHeight={23}
                                                textAlign="left"
                                                text={title}
                                            />
                                        )}
                                        {subTitle && <SpaceFiller height={4} />}
                                        {subTitle && (
                                            <Typo
                                                fontWeight="300"
                                                lineHeight={24}
                                                textAlign="left"
                                                text={subTitle}
                                            />
                                        )}

                                        <SpaceFiller height={12} />

                                        {buildGuarantorValidationForm()}
                                    </View>
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
                    </ScrollView>
                    {buildActionButton()}
                </React.Fragment>
            </ScreenContainer>
        </React.Fragment>
    );

    function buildGuarantorValidationForm() {
        return (
            <View>
                <View style={styles.container}>
                    <View style={styles.mainContent}>
                        <View style={styles.shadow}>
                            <Spring style={styles.card} activeOpacity={0.9}>
                                <View style={styles.cardBody}>
                                    <SpaceFiller height={24} />
                                    <View style={styles.formContainerCard}>
                                        <View>
                                            <Typo
                                                lineHeight={18}
                                                textAlign="center"
                                                text={headingTitle}
                                            />
                                            <SpaceFiller height={4} />
                                            <Typo
                                                fontSize={24}
                                                lineHeight={29}
                                                fontWeight="700"
                                                textAlign="center"
                                                text={
                                                    "RM " +
                                                    numeral(headingTitleValue).format(",0.00")
                                                }
                                            />
                                        </View>
                                    </View>
                                    <SpaceFiller height={8} />
                                    <View style={styles.recRow} />
                                    <SpaceFiller height={14} />
                                    {bodyList?.map((data, index) => {
                                        return (
                                            <View key={index}>
                                                {data?.isVisible &&
                                                    (!data?.isMutiTierVisible ||
                                                        !data?.divider) && (
                                                        <View style={styles.cardBodyRow}>
                                                            <View style={styles.cardBodyColL}>
                                                                <Typo
                                                                    lineHeight={18}
                                                                    textAlign="left"
                                                                    text={data.heading}
                                                                />
                                                            </View>
                                                            <View style={styles.cardBodyColR}>
                                                                <Typo
                                                                    lineHeight={18}
                                                                    fontWeight="600"
                                                                    textAlign="right"
                                                                    text={data.headingValue}
                                                                />
                                                            </View>
                                                        </View>
                                                    )}
                                                {data?.isMutiTierVisible && (
                                                    <View style={styles.cardBodyRow}>
                                                        <View style={styles.cardBodyColL}>
                                                            <Typo
                                                                lineHeight={18}
                                                                fontWeight="600"
                                                                textAlign="left"
                                                                text={data.heading}
                                                            />
                                                        </View>
                                                    </View>
                                                )}

                                                {data?.divider && (
                                                    <View>
                                                        <View style={styles.recRow} />
                                                        <SpaceFiller height={8} />
                                                    </View>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            </Spring>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    function buildActionButton() {
        return (
            <FixedActionContainer>
                <View style={styles.bottomBtnContCls}>
                    <View style={styles.footer}>
                        <ActionButton
                            fullWidth
                            componentCenter={<Typo lineHeight={18} fontWeight="600" text={NEXT} />}
                            onPress={onDoneTap}
                        />
                    </View>
                </View>
            </FixedActionContainer>
        );
    }
};

export const successPropTypes = (GaurantorValidationSuccess.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
});

const styles = StyleSheet.create({
    backgroundImage: {
        position: "absolute",
        width: "100%",
    },

    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    card: {
        backgroundColor: WHITE,
        borderRadius: 10,
        justifyContent: "center",
        marginBottom: 16,
        overflow: "hidden",
        paddingBottom: 25,
        paddingVertical: 0,
        width: "100%",
    },

    cardBody: {
        paddingHorizontal: 16,
    },
    cardBodyColL: {
        width: "65%",
    },
    cardBodyColR: {
        width: "35%",
    },
    cardBodyRow: {
        flexDirection: "row",
        paddingVertical: 10,
    },
    container: {
        flex: 1,
    },
    containerView: {
        flex: 1,
        paddingHorizontal: 25,
        width: "100%",
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    formContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        marginBottom: 40,
    },
    formContainerCard: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    mainContent: {
        backgroundColor: MEDIUM_GREY,
    },
    recRow: {
        borderBottomColor: SEPARATOR,
        borderBottomWidth: 1,
        paddingVertical: 8,
    },
    shadow: {
        ...getShadow({}),
    },
});

export default GaurantorValidationSuccess;
