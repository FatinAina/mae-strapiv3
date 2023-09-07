import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";
import * as Animatable from "react-native-animatable";
import { useSelector } from "react-redux";

import {
    ASB_GUARANTOR_APPROVEDFINANCEDETAILS,
    FATCADECLARATION,
    ON_BOARDING_M2U_USERNAME,
    ON_BOARDING_MODULE,
    SELECTACCOUNT,
} from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import Spring from "@components/Animations/Spring";
import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import InlineTypography from "@components/FormComponents/InlineTypography";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { invokeL3 } from "@services";

import { SEPARATOR, MEDIUM_GREY, WHITE, SWITCH_GREY, YELLOW } from "@constants/colors";
import { DT_RECOM } from "@constants/data";
import {
    TOTAL_FINANING_AMOUNT,
    PROFIT_INTEREST,
    MONTHLY_PAYMENT,
    TAKAFUL_INSURANCE_FEE,
    APPLY_FINANCING,
    ASB_GUARANTOR_AGREE_FINANCING,
    ASB_GUARANTOR_TOGETHER_FINANCING,
    TENURE,
    FINANCING_APPROVED_GA,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

function GuarantorApprovedFinanceDetails({ navigation, route }) {
    this.bannerAnimate = new Animated.Value(0);

    const [eligibilityData, setEligibilityData] = useState();
    const [userType, setUserType] = useState();
    const { getModel } = useModelController();

    const resumeReducer = useSelector((state) => state.resumeReducer);
    const resumeStpDetails = resumeReducer?.stpDetails;
    let count = 0;

    const eligibilityCheckOutcome = route?.params?.guarantorResumeData;
    const additionalDetails = JSON.parse(route?.params?.additionalDetails?.stpEligibilityResponse);
    const eligibilityDataResult = eligibilityCheckOutcome?.eligibilityCheckOutcome;
    useEffect(() => {
        init();
    }, []);
    const init = async () => {
        const userDetails = getModel("user");

        const { isOnboard } = userDetails;
        if (isOnboard) {
            const httpResp = await invokeL3(true);
            const result = httpResp.data;
            const { code } = result;

            if (code !== 0) return;
            let eligibilityResult = {};
            eligibilityDataResult.map((data) => {
                eligibilityResult = data;
                if (data.dataType === DT_RECOM) {
                    eligibilityResult = data;
                }
            });
            setEligibilityData(eligibilityResult);
            console.log("resumeReducer==>", resumeReducer);
            console.log("setUserType==>", additionalDetails?.overallValidationResult === "AMBER");
            setUserType(additionalDetails?.overallValidationResult === "AMBER");
        } else {
            navigation.navigate(ON_BOARDING_MODULE, {
                screen: ON_BOARDING_M2U_USERNAME,
                params: {
                    screenName: ASB_GUARANTOR_APPROVEDFINANCEDETAILS,
                },
            });
        }
    };
    const animateBanner = () => {
        return {
            opacity: this.bannerAnimate.interpolate({
                inputRange: [0, 120, 240],
                outputRange: [1, 0.8, 0],
            }),
            transform: [
                {
                    scale: this.bannerAnimate.interpolate({
                        inputRange: [-200, 0, 1],
                        outputRange: [1.4, 1, 1],
                    }),
                },
                {
                    translateY: this.bannerAnimate.interpolate({
                        inputRange: [-200, 0, 240],
                        outputRange: [0, 0, -100],
                    }),
                },
            ],
        };
    };

    function onContinue() {
        if (userType) {
            navigation.navigate(FATCADECLARATION, {
                stpDetails: resumeStpDetails,
                comingFrom: ASB_GUARANTOR_APPROVEDFINANCEDETAILS,
            });
        } else {
            navigation.navigate(SELECTACCOUNT, {
                stpDetails: resumeStpDetails,
                comingFrom: ASB_GUARANTOR_APPROVEDFINANCEDETAILS,
            });
        }
    }
    return (
        <ScreenContainer backgroundType="image" analyticScreenName={FINANCING_APPROVED_GA}>
            <Animated.View style={[styles.promotionImage, animateBanner()]}>
                <Animatable.Image
                    animation="fadeInUp"
                    delay={500}
                    duration={500}
                    source={Assets.eligibilitySuccess}
                    style={styles.backgroundImage}
                    useNativeDriver
                />
            </Animated.View>
            <ScreenLayout paddingHorizontal={0} paddingBottom={0} paddingTop={0} useSafeArea>
                <View style={styles.container}>
                    <Animated.ScrollView
                        scrollEventThrottle={16}
                        onScroll={Animated.event(
                            [
                                {
                                    nativeEvent: {
                                        contentOffset: { y: this.bannerAnimate },
                                    },
                                },
                            ],
                            { useNativeDriver: true }
                        )}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.mainContent}>
                            <View style={styles.contentArea}>
                                <Typo
                                    fontSize={16}
                                    lineHeight={25}
                                    fontWeight="600"
                                    textAlign="left"
                                    text={
                                        route?.params?.guarantorName + ASB_GUARANTOR_AGREE_FINANCING
                                    }
                                    style={styles.textAlign}
                                />
                                <Typo
                                    lineHeight={19}
                                    textAlign="left"
                                    text={ASB_GUARANTOR_TOGETHER_FINANCING}
                                    style={styles.textAlign}
                                />

                                <View style={styles.shadow}>
                                    <Spring style={styles.card} activeOpacity={0.9}>
                                        <View style={styles.cardHead}>
                                            <Typo
                                                lineHeight={19}
                                                textAlign="left"
                                                text={TOTAL_FINANING_AMOUNT}
                                            />
                                            <Typo
                                                fontSize={24}
                                                lineHeight={29}
                                                fontWeight="700"
                                                textAlign="left"
                                                text={
                                                    "RM " +
                                                    numeral(eligibilityData?.loanAmount).format(
                                                        ",0.00"
                                                    )
                                                }
                                                style={styles.cardHeadAmt}
                                            />
                                        </View>
                                        <View style={styles.cardBody}>
                                            {eligibilityData?.tierList?.map((data, index) => {
                                                count += data.year;
                                                return (
                                                    <View style={styles.recRow} key={index}>
                                                        {eligibilityData?.tierList?.length ===
                                                            1 && (
                                                            <InlineTypography
                                                                label={TENURE}
                                                                value={
                                                                    eligibilityData?.tierList
                                                                        ?.length === 1
                                                                        ? eligibilityData
                                                                              ?.tierList[0]?.year +
                                                                          " years"
                                                                        : ""
                                                                }
                                                                componentID="interestRate"
                                                                style={styles.tenureText}
                                                            />
                                                        )}

                                                        {eligibilityData?.tierList?.length > 1 && (
                                                            <View style={styles.cardBodyColL}>
                                                                <Typo
                                                                    lineHeight={18}
                                                                    fontWeight="600"
                                                                    textAlign="left"
                                                                    text={
                                                                        eligibilityData?.tierList
                                                                            ?.length === 1
                                                                            ? ""
                                                                            : data.tier === 1
                                                                            ? "First " +
                                                                              data.year +
                                                                              " years"
                                                                            : index !==
                                                                              eligibilityData
                                                                                  ?.tierList
                                                                                  ?.length -
                                                                                  1
                                                                            ? count + " years"
                                                                            : index +
                                                                              3 +
                                                                              "-" +
                                                                              count +
                                                                              " years"
                                                                    }
                                                                />
                                                            </View>
                                                        )}

                                                        <InlineTypography
                                                            label={PROFIT_INTEREST}
                                                            value={
                                                                !!data &&
                                                                data?.interestRate &&
                                                                `${numeral(
                                                                    data?.interestRate
                                                                ).format(",0.00")}%`
                                                            }
                                                            componentID="interestRate"
                                                            style={
                                                                eligibilityData?.tierList?.length >
                                                                1
                                                                    ? styles.detailsRowContainer
                                                                    : styles.profitRowContainer
                                                            }
                                                        />

                                                        {/* Monthly Payments */}
                                                        <InlineTypography
                                                            label={MONTHLY_PAYMENT}
                                                            value={
                                                                !!data &&
                                                                data?.installmentAmount &&
                                                                `RM ${numeral(
                                                                    data?.installmentAmount
                                                                ).format(",0.00")}`
                                                            }
                                                            infoBtn={false}
                                                            componentID="monthlyPayments"
                                                            style={styles.detailsRowContainer}
                                                        />
                                                    </View>
                                                );
                                            })}

                                            <InlineTypography
                                                label={TAKAFUL_INSURANCE_FEE}
                                                value={
                                                    eligibilityData?.totalGrossPremium &&
                                                    "RM " +
                                                        numeral(
                                                            eligibilityData?.totalGrossPremium
                                                        ).format(",0.00")
                                                }
                                                componentID="loanAmount"
                                                style={styles.detailsRowContainer}
                                            />
                                        </View>
                                    </Spring>
                                </View>
                            </View>

                            <FixedActionContainer>
                                <View style={styles.bottomBtnContCls}>
                                    <View style={styles.footer}>
                                        <ActionButton
                                            backgroundColor={YELLOW}
                                            fullWidth
                                            componentCenter={
                                                <Typo
                                                    lineHeight={18}
                                                    fontWeight="600"
                                                    text={APPLY_FINANCING}
                                                />
                                            }
                                            onPress={onContinue}
                                        />
                                        <SpaceFiller height={12} />
                                    </View>
                                </View>
                            </FixedActionContainer>
                        </View>
                    </Animated.ScrollView>
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
}

GuarantorApprovedFinanceDetails.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    backgroundImage: {
        position: "absolute",
        width: "100%",
    },
    boderBottom: {
        borderBottomColor: SWITCH_GREY,
        borderBottomWidth: 1,
        marginVertical: 25,
    },
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingTop: 12.5,
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
        width: "70%",
    },
    cardBodyColR: {
        width: "30%",
    },
    cardBodyRow: {
        flexDirection: "row",
        paddingVertical: 7,
    },
    cardHead: {
        alignItems: "center",
        borderBottomColor: SEPARATOR,
        borderBottomWidth: 1,
        flex: 1,
        justifyContent: "center",
        marginBottom: 20,
        paddingHorizontal: 16,
        paddingVertical: 25,
    },
    cardHeadAmt: {
        paddingTop: 5,
    },
    container: {
        flex: 1,
    },
    contentArea: {
        marginHorizontal: 25,
        paddingTop: 25,
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    infoIcon: {
        height: 16,
        marginLeft: 10,
        marginTop: 10,
        width: 16,
    },
    infoLabelContainerCls: {
        flexDirection: "row",
        paddingVertical: 2,
        width: "80%",
    },
    invertCardFooter: {
        flexDirection: "row",
        paddingBottom: 5,
    },
    invertCardFooterColOne: {
        alignItems: "baseline",
        justifyContent: "center",
        width: "50%",
    },
    label: {
        paddingBottom: 5,
        paddingTop: 10,
    },
    mainContent: {
        backgroundColor: MEDIUM_GREY,
        marginTop: 240,
    },
    menuList: {
        marginBottom: 30,
        marginTop: 20,
    },
    merchantBanner: { flex: 1, height: "100%", width: "100%" },
    promotionImage: {
        height: 240,
        position: "absolute",
        width: "100%",
    },
    shadow: {
        ...getShadow({}),
    },
    textAlign: {
        paddingBottom: 20,
    },
    textStyle: {
        textDecorationLine: "underline",
    },
    viewStyle: {
        marginBottom: 20,
    },
    recRow: {
        borderBottomColor: SEPARATOR,
        borderBottomWidth: 1,
        paddingVertical: 8,
    },
    detailsRowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
        width: "100%",
    },
    profitRowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    tenureText: {
        marginBottom: 10,
    },
});

export default GuarantorApprovedFinanceDetails;
