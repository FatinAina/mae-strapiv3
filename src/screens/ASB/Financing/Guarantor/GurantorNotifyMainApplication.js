import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView, Platform, Image } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import ScreenLayout from "@layouts/ScreenLayout";

import Spring from "@components/Animations/Spring";
import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { asbSendNotification } from "@redux/services/ASBServices/asbSendNotification";

import { MEDIUM_GREY, SEPARATOR, WHITE } from "@constants/colors";
import { DT_RECOM } from "@constants/data";
import {
    DONE,
    FA_FORM_COMPLETE,
    FA_SCREEN_NAME,
    FA_TRANSACTION_ID,
    FA_VIEW_SCREEN,
    RECIPIENT_ID,
    YOU_MAY_VIEW,
    GREAT_NEWS,
} from "@constants/strings";
import { ASB_SEND_NOTIFY_MAIN_APPLICANT_NOTIFICATION_URL } from "@constants/url";

import { getShadow } from "@utils/dataModel/utilityPartial.2";

import Assets from "@assets";

const GurantorNotifyMainApplication = ({ route, navigation }) => {
    const asbApplicationDetailsReducer = useSelector(
        (state) => state.asbServicesReducer.asbApplicationDetailsReducer
    );
    const { dataStoreValidation } = asbApplicationDetailsReducer;
    const onDoneTap = route?.params?.dataSendNotification?.onDoneTap;
    const headingTitle = dataStoreValidation?.headingTitle;
    const headingTitleValue = dataStoreValidation?.headingTitleValue;
    const bodyList = dataStoreValidation?.bodyList;
    const analyticScreenName = route?.params?.dataSendNotification?.analyticScreenName;
    const needFormAnalytics = route?.params?.dataSendNotification?.needFormAnalytics;
    const referenceId = route?.params?.dataSendNotification?.referenceId;
    const mainApplicantName = route?.params?.dataSendNotification?.mainApplicantName;
    const dispatch = useDispatch();

    const asbGuarantorPrePostQualReducer = useSelector(
        (state) => state.asbServicesReducer.asbGuarantorPrePostQualReducer
    );
    const personalInformationReducer = useSelector(
        (state) => state.asbFinanceReducer.guarantorPersonalInformationReducer
    );

    const { mainApplicantEmail, mainApplicantPhoneNumber } = personalInformationReducer;
    const stpReferenceNumber = asbGuarantorPrePostQualReducer?.stpReferenceNo;

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        const getCheckEligiblityValue = JSON.parse(
            asbApplicationDetailsReducer?.data?.stpEligibilityResponse
        );
        let eligibilityCheckOutcomeData;
        getCheckEligiblityValue?.eligibilityCheckOutcome?.map((data) => {
            eligibilityCheckOutcomeData = data;
            if (data.dataType === DT_RECOM) {
                eligibilityCheckOutcomeData = data;
            }
        });
        if (route?.params?.triggered) {
            const body = {
                guarantorstpReferenceNo: stpReferenceNumber,
                mainApplicantEmail,
                mainApplicantMobileNumber: mainApplicantPhoneNumber,
                loanAmount: numeral(eligibilityCheckOutcomeData?.loanAmount).format(",0.00"),
                loanTenure: eligibilityCheckOutcomeData?.minTenure,
                monthlyPayment: `${numeral(
                    eligibilityCheckOutcomeData?.tierList[0]?.installmentAmount
                ).format(",0.00")}`,
                profitRate: `${numeral(
                    eligibilityCheckOutcomeData?.tierList[0]?.interestRate
                ).format(",0.00")}`,
                takaful: numeral(eligibilityCheckOutcomeData?.totalGrossPremium).format(",0.00"),
                applicantName: asbGuarantorPrePostQualReducer?.additionalDetails?.stpCustomerName,
            };
            dispatch(
                asbSendNotification(body, null, ASB_SEND_NOTIFY_MAIN_APPLICANT_NOTIFICATION_URL)
            );
        }
    };

    useEffect(() => {
        if (analyticScreenName) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: analyticScreenName,
            });
            if (needFormAnalytics) {
                if (referenceId) {
                    logEvent(FA_FORM_COMPLETE, {
                        [FA_SCREEN_NAME]: analyticScreenName,
                        [FA_TRANSACTION_ID]: referenceId,
                    });
                } else {
                    logEvent(FA_FORM_COMPLETE, {
                        [FA_SCREEN_NAME]: analyticScreenName,
                    });
                }
            }
        }
    }, [analyticScreenName, needFormAnalytics, referenceId]);

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color">
                <ScreenLayout paddingHorizontal={0} paddingBottom={0} paddingTop={0} useSafeArea>
                    {successLayout()}
                    {buildActionButton()}
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );

    function successLayout() {
        return (
            <React.Fragment>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <KeyboardAwareScrollView
                        behavior={Platform.OS === "ios" ? "padding" : ""}
                        enabled
                    >
                        <View style={styles.formContainer}>
                            <View style={styles.contentContainer}>
                                <View>
                                    <Image source={Assets.icTickNew} style={styles.successImage} />
                                    <SpaceFiller height={28} />
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={24}
                                        textAlign="left"
                                        text={GREAT_NEWS(mainApplicantName)}
                                    />
                                    <SpaceFiller height={12} />

                                    <Typo
                                        fontWeight="300"
                                        lineHeight={21}
                                        textAlign="left"
                                        text={YOU_MAY_VIEW}
                                    />

                                    <SpaceFiller height={36} />

                                    {buildGuarantorValidationForm()}
                                </View>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>
            </React.Fragment>
        );
    }

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
                                                text={headingTitleValue}
                                            />
                                        </View>
                                    </View>
                                    <SpaceFiller height={14} />
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
                                    <SpaceFiller height={14} />
                                    <View style={styles.recRow} />
                                    <SpaceFiller height={14} />

                                    {referenceId && (
                                        <View style={styles.cardBodyRow}>
                                            <View style={styles.cardBodyColLRef}>
                                                <Typo
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    text={RECIPIENT_ID}
                                                />
                                            </View>
                                            <View style={styles.cardBodyColRRef}>
                                                <Typo
                                                    lineHeight={18}
                                                    fontWeight="600"
                                                    textAlign="right"
                                                    text={referenceId}
                                                />
                                            </View>
                                        </View>
                                    )}
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
                            componentCenter={<Typo lineHeight={18} fontWeight="600" text={DONE} />}
                            onPress={onDoneTap}
                        />
                    </View>
                </View>
            </FixedActionContainer>
        );
    }
};

export const successPropTypes = (GurantorNotifyMainApplication.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
});

const styles = StyleSheet.create({
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

    cardBodyColLRef: {
        width: "45%",
    },
    cardBodyColRRef: {
        width: "55%",
    },
    cardBodyRow: {
        flexDirection: "row",
        paddingVertical: 10,
    },
    container: {
        flex: 1,
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    formContainer: {
        marginBottom: 40,
        marginTop: 40,
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
    successImage: {
        height: 56,
        width: 56,
    },
    contentContainer: {
        marginHorizontal: 24,
    },
});

export default GurantorNotifyMainApplication;
