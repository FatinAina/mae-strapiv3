import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { View, Image, StyleSheet, ScrollView, Dimensions } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { goBackHomeScreen } from "@screens/ASB/Financing/helpers/ASBHelpers";

import { DASHBOARD } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { asbSendNotification } from "@redux/services/ASBServices/asbSendNotification";

import { YELLOW, MEDIUM_GREY } from "@constants/colors";
import { DT_RECOM } from "@constants/data";
import {
    FA_FORM_COMPLETE,
    FA_SCREEN_NAME,
    OKAY_GOT_IT,
    WE_RECEIVED_DOC,
    WE_RECEIVED_DOC_KINDLY_ALLOW_TO_PROCEED,
} from "@constants/strings";
import { ASB_SEND_NOTIFY_MAIN_APPLICANT_NOTIFICATION_URL } from "@constants/url";

import Assets from "@assets";

import { doneWithDataPush } from "../../../redux/reducers/ASBFinance/SingleApplicantbookingform";

const screenHeight = Dimensions.get("window").height;

const ReceivedDocumentScreen = ({ navigation, route }) => {
    const isGuarantor = route?.params?.isGuarantor ?? false;

    const dispatch = useDispatch();

    const asbGuarantorPrePostQualReducer = useSelector(
        (state) => state.asbServicesReducer.asbGuarantorPrePostQualReducer
    );
    const asbApplicationDetailsReducer = useSelector(
        (state) => state.asbServicesReducer.asbApplicationDetailsReducer
    );

    const mainApplicantEmail = asbGuarantorPrePostQualReducer?.additionalDetails?.stpEmail;
    const mainApplicantPhoneNumber =
        asbGuarantorPrePostQualReducer?.additionalDetails?.stpMobileContactNumber;
    const mainApplicantContactPrefix =
        asbGuarantorPrePostQualReducer?.additionalDetails?.stpMobileContactPrefix.replace(
            /^0+/,
            ""
        );
    const stpReferenceNumber = asbGuarantorPrePostQualReducer?.stpReferenceNo;

    useEffect(() => {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Apply_ASBFinancing_DocumentsReceived",
        });
        if (isGuarantor) {
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
            const body = {
                guarantorstpReferenceNo: stpReferenceNumber,
                mainApplicantEmail,
                mainApplicantMobileNumber: mainApplicantContactPrefix + mainApplicantPhoneNumber,
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
        dispatch(doneWithDataPush());
    }, []);

    function handleDone() {
        if (isGuarantor) {
            goBackHomeScreen(navigation);
        } else {
            navigation.navigate(DASHBOARD);
        }
    }
    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName="Apply_ASBFinancing_DocumentsReceived"
        >
            <ScreenLayout
                header={<HeaderLayout />}
                useSafeArea
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    <View style={styles.container}>
                        <View style={styles.statusPgImgBlockCls}>
                            <Image
                                resizeMode="contain"
                                style={styles.statusIcon}
                                source={Assets.icTickNew}
                                // icTickNew
                            />
                        </View>
                        <Typo
                            text={WE_RECEIVED_DOC}
                            fontSize={20}
                            lineHeight={28}
                            textAlign="left"
                            style={styles.title}
                        />

                        <Typo
                            text={WE_RECEIVED_DOC_KINDLY_ALLOW_TO_PROCEED}
                            lineHeight={20}
                            textAlign="left"
                            style={styles.subTitle}
                        />
                    </View>
                </ScrollView>
                <FixedActionContainer>
                    <View style={styles.bottomBtnContCls}>
                        <ActionButton
                            onPress={handleDone}
                            activeOpacity={0.5}
                            backgroundColor={YELLOW}
                            fullWidth
                            componentCenter={
                                <Typo lineHeight={18} fontWeight="600" text={OKAY_GOT_IT} />
                            }
                        />
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flex: 1,
        justifyContent: "space-around",
    },

    container: {
        alignItems: "flex-start",
        flex: 1,
        justifyContent: "flex-start",
        marginHorizontal: 24,
        paddingBottom: 24,
    },
    statusIcon: {
        height: 56,
        width: 56,
    },
    statusPgImgBlockCls: {
        marginBottom: 25,
        marginTop: (screenHeight * 5) / 100,
        width: "100%",
    },

    subTitle: {
        marginBottom: 40,
        width: "100%",
    },
    title: {
        marginBottom: 30,
    },
});

ReceivedDocumentScreen.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.any,
};

export default React.memo(ReceivedDocumentScreen);
