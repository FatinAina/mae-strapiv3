import PropTypes from "prop-types";
import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { goBackHomeScreen } from "@screens/ASB/Financing/helpers/ASBHelpers";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import { InfoDetails } from "@components/FormComponents/InfoDetails";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { GUARANTOR_SUBMIT_OTP_REQUEST_BODY } from "@redux/actions/ASBFinance/asbGuarantorOTPAction";
import { GUARANTOR_EMPLOYMENT_DETAILS_CONFIRMATION_ACTION } from "@redux/actions/ASBFinance/guarantorEmploymentDetailsAction";
import { GUARANTOR_PERSONAL_DETAILS_CONFIRMATION_ACTION } from "@redux/actions/ASBFinance/guarantorPersonalInformationAction";
import { guarantorScoreParty } from "@redux/services/ASBServices/apiGuarantorScoreParty";
import { asbUpdateCEP } from "@redux/services/ASBServices/asbApiUpdateCEP";
import { asbCheckEligibility } from "@redux/services/ASBServices/asbCheckEligibility";

import { DT_ELG, DT_ACTUAL, AMBER, GREEN, DT_ACTUAL_RECOM, DT_NOTELG } from "@constants/data";
import {
    PLSTP_AGREE,
    GUARANTOR_CONFIRMATION_DESC,
    CONFIRMATION,
    ZEST_CASA_PERSONAL_DETAILS,
    ZEST_CASA_EMPLOYMENT_DETAILS,
    FINANCING_DETAILS,
    OFFER_UPDATED,
    OFFER_UPDATED_DESCRIPTION,
    OKAY,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    LEAVE,
    CANCEL,
    APPLY_ASBFINANCINGGUARANTOR_SUCCESSFUL_CONFIRMATION,
} from "@constants/strings";

const GuarantorConfirmation = (props) => {
    const { navigation } = props;

    const asbGuarantorPrePostQualReducer = useSelector(
        (state) => state.asbServicesReducer.asbGuarantorPrePostQualReducer
    );
    const stpReferenceNumber = asbGuarantorPrePostQualReducer?.stpReferenceNo;
    const personalInformationReducer = useSelector(
        (state) => state.asbFinanceReducer.guarantorPersonalInformationReducer
    );
    const asbApplicationDetailsReducer = useSelector(
        (state) => state.asbServicesReducer.asbApplicationDetailsReducer
    );

    const {
        financingDetailsList,
        personDetailsList,
        employmentDetailList,
        customerRiskRatingValue,
    } = asbGuarantorPrePostQualReducer;
    const { dataStoreValidation } = asbApplicationDetailsReducer;

    const { additionalDetails } = asbGuarantorPrePostQualReducer;

    const { isStateChanged, isPostalCodeChanged, isAcceptedDeclaration } =
        personalInformationReducer;
    const [showPopupOffer, setShowPopupOffer] = useState(false);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    function onBackTap() {
        dispatch({
            type: GUARANTOR_PERSONAL_DETAILS_CONFIRMATION_ACTION,
            isFromConfirmationScreenForPersonalDetails: false,
        });

        dispatch({
            type: GUARANTOR_EMPLOYMENT_DETAILS_CONFIRMATION_ACTION,
            isFromConfirmationScreenForEmploymentDetails: false,
        });

        navigation.navigate(navigationConstant.ASB_ACCEPT_AS_GUARANTOR_DECLARATION);
    }

    function onCloseTap() {
        dispatch({
            type: GUARANTOR_PERSONAL_DETAILS_CONFIRMATION_ACTION,
            isFromConfirmationScreenForPersonalDetails: false,
        });

        dispatch({
            type: GUARANTOR_EMPLOYMENT_DETAILS_CONFIRMATION_ACTION,
            isFromConfirmationScreenForEmploymentDetails: false,
        });
        setShowPopupConfirm(true);
    }

    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    async function handleLeaveButton() {
        setShowPopupConfirm(false);

        const data = {
            stpReferenceNo: stpReferenceNumber,
        };

        dispatch(
            guarantorScoreParty(
                data,
                (
                    _,
                    customerRiskRatingCode,
                    customerRiskRatingValue,
                    manualRiskRatingCode,
                    manualRiskRatingValue,
                    assessmentId
                ) => {
                    updateApiCEP(
                        () => {
                            goBackHomeScreen(navigation);
                        },
                        customerRiskRatingCode,
                        customerRiskRatingValue,
                        manualRiskRatingCode,
                        manualRiskRatingValue,
                        assessmentId
                    );
                }
            )
        );
    }

    function onNextTap() {
        const data = {
            stpReferenceNo: stpReferenceNumber,
        };

        dispatch(
            guarantorScoreParty(
                data,
                (
                    _,
                    customerRiskRatingCode,
                    customerRiskRatingValue,
                    manualRiskRatingCode,
                    manualRiskRatingValue,
                    assessmentId
                ) => {
                    updateApiCEP(
                        () => {
                            const requestBody = {
                                stpId: stpReferenceNumber,
                                branchName: additionalDetails?.stpBranch,
                                siAccNo: additionalDetails?.stpAsbHolderNum,
                                consentToUsePDPA: isAcceptedDeclaration,
                                ethnic: additionalDetails?.stpRaceCode,
                                countryOfOnboarding: "",
                            };
                            dispatch({
                                type: GUARANTOR_SUBMIT_OTP_REQUEST_BODY,
                                requestBody,
                            });
                            if (isStateChanged || isPostalCodeChanged) {
                                setShowPopupOffer(true);
                            } else {
                                if (customerRiskRatingValue === "HIGH RISK") {
                                    navigation.navigate(
                                        navigationConstant.ASB_GUARANTOR_ADDITIONAL_DETAILS_INCOME
                                    );
                                } else {
                                    navigation.navigate(
                                        navigationConstant.ASB_GUARANTOR_CONFIRM_FINANCING_DETAILS,
                                        { dataSendNotification: dataStoreValidation }
                                    );
                                }
                            }
                        },
                        customerRiskRatingCode,
                        customerRiskRatingValue,
                        manualRiskRatingCode,
                        manualRiskRatingValue,
                        assessmentId
                    );
                }
            )
        );
    }

    function updateApiCEP(
        callback,
        customerRiskRatingCode,
        customerRiskRatingValue,
        manualRiskRatingCode,
        manualRiskRatingValue,
        assessmentId
    ) {
        const body = {
            screenNo: "9",
            stpReferenceNo: stpReferenceNumber,
            customerRiskRatingCode,
            customerRiskRatingValue,
            manualRiskRatingCode,
            manualRiskRatingValue,
            assessmentId,
        };
        dispatch(
            asbUpdateCEP(body, (data) => {
                if (data && callback) {
                    callback();
                }
            })
        );
    }

    function onPersonalDetailsEditDidTap() {
        dispatch({
            type: GUARANTOR_PERSONAL_DETAILS_CONFIRMATION_ACTION,
            isFromConfirmationScreenForPersonalDetails: true,
        });
        navigation.push(navigationConstant.ASB_GUARANTOR_PERSONAL_INFORMATION, {
            isEmployeeDataMissing: false,
        });
    }

    function onEmploymentDetailsEditDidTap() {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_DETAILS_CONFIRMATION_ACTION,
            isFromConfirmationScreenForEmploymentDetails: true,
        });
        navigation.push(navigationConstant.ASB_GUARANTOR_EMPLOYMENT_DETAILS, {
            currentSteps: 1,
            totalSteps: 2,
        });
    }

    function handleOkayButton() {
        setShowPopupOffer(false);

        const body = {
            stpReferenceNo: stpReferenceNumber,
            screenNo: "9",
        };

        dispatch(
            asbCheckEligibility(body, (overallValidationResult, dataType, result) => {
                if (
                    overallValidationResult === GREEN &&
                    (dataType === DT_ELG || dataType === DT_ACTUAL_RECOM || dataType === DT_ACTUAL)
                ) {
                    navigation.navigate(navigationConstant.ASB_GUARANTOR_VALIDATION_SUCCESS, {
                        dataSendNotification: dataStoreValidation,
                    });
                } else if (
                    overallValidationResult === AMBER &&
                    (dataType === DT_ACTUAL_RECOM || dataType === DT_ELG || dataType === DT_ACTUAL)
                ) {
                    navigation.navigate(navigationConstant.ASB_GUARANTOR_FATCA_DECLARATION);
                } else if (overallValidationResult === AMBER && dataType === DT_NOTELG) {
                    navigation.navigate(navigationConstant.ASB_GUARANTOR_UNABLE_TO_OFFER_YOU, {
                        onDoneTap: () => {
                            goBackHomeScreen(navigation);
                        },
                    });
                } else if (customerRiskRatingValue === "HIGH RISK") {
                    navigation.navigate(navigationConstant.ASB_GUARANTOR_ADDITIONAL_DETAILS_INCOME);
                } else {
                    navigation.navigate(
                        navigationConstant.ASB_GUARANTOR_CONFIRM_FINANCING_DETAILS,
                        { dataSendNotification: dataStoreValidation }
                    );
                }
            })
        );
    }

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName={APPLY_ASBFINANCINGGUARANTOR_SUCCESSFUL_CONFIRMATION}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={20}
                                    text={CONFIRMATION}
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={Style.contentContainer}>
                                    <Typo
                                        lineHeight={21}
                                        textAlign="left"
                                        text={GUARANTOR_CONFIRMATION_DESC}
                                    />
                                </View>
                                <SpaceFiller height={24} />
                                <InfoDetails
                                    title={FINANCING_DETAILS}
                                    info={financingDetailsList}
                                    buttonValue={FINANCING_DETAILS}
                                    hidden={true}
                                    styleLeft={Style.infoContentLeft}
                                    styleRight={Style.infoContentRight}
                                />
                                <InfoDetails
                                    title={ZEST_CASA_PERSONAL_DETAILS}
                                    info={personDetailsList}
                                    handlePress={onPersonalDetailsEditDidTap}
                                    buttonValue={ZEST_CASA_PERSONAL_DETAILS}
                                    styleLeft={Style.infoContentLeft}
                                    styleRight={Style.infoContentRight}
                                />
                                <InfoDetails
                                    title={ZEST_CASA_EMPLOYMENT_DETAILS}
                                    info={employmentDetailList}
                                    handlePress={onEmploymentDetailsEditDidTap}
                                    buttonValue={ZEST_CASA_EMPLOYMENT_DETAILS}
                                    styleLeft={Style.infoContentLeft}
                                    styleRight={Style.infoContentRight}
                                />
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    fullWidth
                                    componentCenter={
                                        <Typo lineHeight={18} fontWeight="600" text={PLSTP_AGREE} />
                                    }
                                    onPress={onNextTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
                <Popup
                    visible={showPopupConfirm}
                    onClose={onPopupCloseConfirm}
                    title={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE}
                    description={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC}
                    primaryAction={{
                        text: LEAVE,
                        onPress: handleLeaveButton,
                    }}
                    secondaryAction={{
                        text: CANCEL,
                        onPress: onPopupCloseConfirm,
                    }}
                />
                <Popup
                    visible={showPopupOffer}
                    onClose={handleOkayButton}
                    title={OFFER_UPDATED}
                    description={OFFER_UPDATED_DESCRIPTION}
                    primaryAction={{
                        text: OKAY,
                        onPress: handleOkayButton,
                    }}
                />
            </ScreenContainer>
        </React.Fragment>
    );
};

GuarantorConfirmation.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },
    infoContentLeft: {
        alignItems: "flex-start",
        width: "42%",
    },
    infoContentRight: {
        alignItems: "flex-end",
        width: "58%",
    },
});

export default GuarantorConfirmation;
