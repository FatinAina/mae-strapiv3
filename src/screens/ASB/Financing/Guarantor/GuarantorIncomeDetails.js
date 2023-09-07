import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Platform, TouchableOpacity, Image } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";

import { goBackHomeScreen } from "@screens/ASB/Financing/helpers/ASBHelpers";
import { removeCommas } from "@screens/PLSTP/PLSTPController";

import {
    ASB_GUARANTOR_CONSENT,
    ASB_GUARANTOR_VALIDATION_SUCCESS,
    ASB_STACK,
    ASB_GUARANTOR_FATCA_DECLARATION,
    ASB_GUARANTOR_UNABLE_TO_OFFER_YOU,
    ASB_GUARANTOR_INCOME_DETAILS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import {
    GUARANTOR_INCOME_DETAILS_NEXT_BUTTON_ENABLE,
    GUARANTOR_MONTHLY_GROSS_INCOME,
    GUARANTOR_TOTAL_MONTHLY_NON_BANK_COMMITMENTS,
} from "@redux/actions/ASBFinance/guarantorIncomeDetailsAction";
import { ASB_APPLICAION_DATA_STORE_NOTIFICATION } from "@redux/actions/ASBServices/asbApplicationDetailsAction";
import { ASB_UPDATE_FINANCING_DETAILS } from "@redux/actions/ASBServices/asbGuarantorPrePostQualAction";
import { asbUpdateCEP } from "@redux/services/ASBServices/asbApiUpdateCEP";
import { asbCheckEligibility } from "@redux/services/ASBServices/asbCheckEligibility";

import { MEDIUM_GREY, YELLOW, DISABLED } from "@constants/colors";
import { DT_RECOM, DT_ELG, DT_ACTUAL, AMBER, GREEN, DT_ACTUAL_RECOM } from "@constants/data";
import {
    AMOUNT_PLACEHOLDER,
    CURRENCY_CODE,
    MONTHLY_GROSS_INCOME,
    TOTAL_MONTHLY_NONBANK_COMMITMENTS,
    INCLUDIN_YOU_MONTHLY_COMMITMENTS,
    GUARANTOR,
    PLEASE_SHARE_WITH_US_INCOME_COMMITMENT_DETAILS,
    STEP,
    NEXT_ASB,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    LEAVE,
    CANCEL,
    APPLY_ASBFINANCINGGUARANTOR_INCOMEDETAILS,
    FINANCING_DETAILS_BELOW,
    CONGRATS_YOU_ARE_GUARANTOR,
    TOTAL_FINANING_AMOUNT,
    MONTHLY_PAYMENT,
    PROFIT_INTEREST,
    FIRST,
    SMALL_YEARS,
    TENURE,
    TAKAFUL_INSURANCE_FEE,
    MONTHLY_GROSS_INC,
    PLSTP_SUCCESS_ADDON,
    INTEREST_PROFIT_RATE,
    NO_OF_CERTIFICATE,
    ASNB_ACCOUNT,
    AMOUNT_NEED,
    TYPE_OF_FINANCING,
} from "@constants/strings";

import Assets from "@assets";

function GuarantorIncomeDetails({ route, navigation }) {
    const { currentSteps, totalSteps } = route?.params;

    // Hooks to access reducer data
    const asbGuarantorPrePostQualReducer = useSelector(
        (state) => state.asbServicesReducer.asbGuarantorPrePostQualReducer
    );

    const guarantorIncomeDetailsReducer = useSelector(
        (state) => state.asbFinanceReducer.guarantorIncomeDetailsReducer
    );
    const stpReferenceNumber = asbGuarantorPrePostQualReducer?.stpReferenceNo;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const {
        monthlyGrossInformation,
        totalMonthlyNonBNankingCommitments,
        incomeDetailsNextBottonEnable,
        monthlyloanInformationError,
        totalMonthlyNonBankingCommitmentsError,
    } = guarantorIncomeDetailsReducer;

    const [showPopup, setShowPopup] = useState(false);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);

    const { mainApplicantIDNumber, additionalDetails, mainApplicantName } =
        asbGuarantorPrePostQualReducer;

    const userData = {
        stpReferenceNo: mainApplicantIDNumber,
    };

    useEffect(() => {
        dispatch({
            type: GUARANTOR_INCOME_DETAILS_NEXT_BUTTON_ENABLE,
        });
    }, [monthlyGrossInformation, totalMonthlyNonBNankingCommitments]);

    function onGrassIncomeChange(value) {
        dispatch({ type: GUARANTOR_MONTHLY_GROSS_INCOME, monthlyGrossInformation: value });
    }

    function onTotalMonthNonBankChange(value) {
        dispatch({
            type: GUARANTOR_TOTAL_MONTHLY_NON_BANK_COMMITMENTS,
            totalMonthlyNonBNankingCommitments: value,
        });
    }

    function onTotalMonthInfoPress() {
        setShowPopup(true);
    }

    function onPopupClose() {
        setShowPopup(false);
    }

    function handleBack() {
        navigation.navigate(ASB_GUARANTOR_CONSENT, { userData });
    }
    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    function handleClose() {
        setShowPopupConfirm(true);
    }

    function handleLeaveBtn() {
        setShowPopupConfirm(false);
        updateApiCEP(() => {
            goBackHomeScreen(navigation);
        });
    }

    function eligibleDataStoreValidation(eligibilityCheckOutcome, result, overallValidationResult) {
        let eligibilityCheckOutcomeData;
        eligibilityCheckOutcome?.map((data) => {
            eligibilityCheckOutcomeData = data;
            if (data.dataType === DT_RECOM) {
                eligibilityCheckOutcomeData = data;
            }
        });

        const bodyList = [];
        bodyList.push({
            heading: TENURE,
            headingValue: `${eligibilityCheckOutcomeData?.tenure} years`,
            isVisible: eligibilityCheckOutcomeData?.tenure,
        });

        let yearCount = 0;
        const tireList = eligibilityCheckOutcomeData?.tierList;
        tireList?.map((data, index) => {
            yearCount += data?.year;

            if (tireList?.length > 1) {
                bodyList.push({
                    heading:
                        tireList?.length === 1
                            ? ""
                            : data?.tier === 1
                            ? `${FIRST}  ${data?.year} ${SMALL_YEARS}`
                            : index !== tireList?.length - 1
                            ? `${yearCount} ${SMALL_YEARS}`
                            : `${index + 3} - ${yearCount} ${SMALL_YEARS}`,
                    isMutiTierVisible: true,
                });
            }

            bodyList.push({
                heading: PROFIT_INTEREST,
                headingValue: `${numeral(data?.interestRate).format(",0.00")}%`,
                isVisible: data?.interestRate,
            });
            bodyList.push({
                heading: MONTHLY_PAYMENT,
                headingValue: `RM ${numeral(data?.installmentAmount).format(",0.00")}`,
                isVisible: data?.installmentAmount,
            });

            if (tireList?.length > 1) {
                bodyList.push({
                    divider: true,
                });
            }
        });

        bodyList.push({
            heading: TAKAFUL_INSURANCE_FEE,
            headingValue: `RM ${numeral(eligibilityCheckOutcomeData?.totalGrossPremium).format(
                ",0.00"
            )}`,
            isVisible: eligibilityCheckOutcomeData?.totalGrossPremium,
        });

        const dataStoreValidationData = {
            headingTitle: TOTAL_FINANING_AMOUNT,
            headingTitleValue: `RM ${numeral(eligibilityCheckOutcomeData?.loanAmount).format(
                ",0.00"
            )}`,
            bodyList,
            mainApplicantName,
            title: CONGRATS_YOU_ARE_GUARANTOR(mainApplicantName),
            subTitle: FINANCING_DETAILS_BELOW,
        };

        dispatch({
            type: ASB_APPLICAION_DATA_STORE_NOTIFICATION,
            dataStoreValidation: dataStoreValidationData,
        });

        return dataStoreValidationData;
    }

    function handleContinueButton() {
        if (incomeDetailsNextBottonEnable) {
            const data = {
                stpReferenceNo: stpReferenceNumber,
            };

            updateApiCEP(() => {
                dispatch(
                    asbCheckEligibility(data, (overallValidationResult, dataType, result) => {
                        const eligibilityCheckOutcome =
                            result?.wolocResponse?.msgBody?.eligibilityCheckOutcome;
                        const validationResult = eligibleDataStoreValidation(
                            eligibilityCheckOutcome,
                            result,
                            overallValidationResult
                        );
                        dispatch({
                            type: ASB_APPLICAION_DATA_STORE_NOTIFICATION,
                            dataStoreValidation: validationResult,
                        });

                        let eligibilityResult = {};
                        eligibilityCheckOutcome?.map((data) => {
                            if (data.dataType === DT_RECOM || data.dataType === DT_ELG) {
                                eligibilityResult = data;
                            }
                        });
                        if (
                            overallValidationResult === GREEN &&
                            (dataType === DT_ELG ||
                                dataType === DT_ACTUAL_RECOM ||
                                dataType === DT_ACTUAL)
                        ) {
                            prefillFinancingDetails(eligibilityResult);
                            navigation.navigate(ASB_STACK, {
                                screen: ASB_GUARANTOR_VALIDATION_SUCCESS,
                                params: {
                                    dataSendNotification: validationResult,
                                    eligibilityResult,
                                },
                            });
                        } else if (
                            overallValidationResult === AMBER &&
                            (dataType === DT_ACTUAL_RECOM ||
                                dataType === DT_ELG ||
                                dataType === DT_ACTUAL)
                        ) {
                            navigation.navigate(ASB_GUARANTOR_FATCA_DECLARATION, {
                                from: ASB_GUARANTOR_INCOME_DETAILS,
                                dataSendNotification: validationResult,
                                eligibilityResult,
                                overallValidationResult,
                                dataType,
                            });
                        } else {
                            navigation.navigate(ASB_GUARANTOR_UNABLE_TO_OFFER_YOU, {
                                onDoneTap: () => {
                                    goBackHomeScreen(navigation);
                                },
                            });
                        }
                    })
                );
            });
        }
    }

    const prefillFinancingDetails = (data) => {
        const financingDetailsList = [];
        financingDetailsList.push({
            displayKey: TYPE_OF_FINANCING,
            displayValue:
                additionalDetails?.stpTypeOfLoan === "I"
                    ? "Islamic Financing"
                    : "Conventional Financing",
        });

        if (data?.loanAmount) {
            financingDetailsList.push({
                displayKey: AMOUNT_NEED,
                displayValue: `RM ${numeral(data?.loanAmount).format(",0.00")}`,
            });
        }
        if (data?.stpAsbHolderNum) {
            financingDetailsList.push({
                displayKey: ASNB_ACCOUNT,
                displayValue: "Amanah Saham Bumiputera" + " " + data?.stpAsbHolderNum,
            });
        }

        if (additionalDetails?.stpCertificatesNum) {
            financingDetailsList.push({
                displayKey: NO_OF_CERTIFICATE,
                displayValue: additionalDetails?.stpCertificatesNum,
            });
        }

        if (data?.tenure) {
            financingDetailsList.push({
                displayKey: TENURE,
                displayValue: `${data?.tenure} Years`,
            });
        }

        if (data?.tierList && data?.tierList.length > 0 && data?.tierList[0]?.interestRate) {
            financingDetailsList.push({
                displayKey: INTEREST_PROFIT_RATE,
                displayValue: `${numeral(data?.tierList[0]?.interestRate).format(",0.00")}% p.a.`,
            });
        }

        if (additionalDetails?.stpMonthlyInstalment) {
            financingDetailsList.push({
                displayKey: MONTHLY_PAYMENT,
                displayValue: `RM ${numeral(additionalDetails?.stpMonthlyInstalment).format(
                    ",0.00"
                )}`,
            });
        }

        if (data?.totalGrossPremium) {
            financingDetailsList.push({
                displayKey: PLSTP_SUCCESS_ADDON,
                displayValue: `RM ${numeral(data?.totalGrossPremium).format(",0.00")}`,
            });
        }

        if (monthlyGrossInformation) {
            financingDetailsList.push({
                displayKey: MONTHLY_GROSS_INC,
                displayValue: `RM ${numeral(monthlyGrossInformation).format(",0.00")}`,
            });
        }

        financingDetailsList.push({
            displayKey: TOTAL_MONTHLY_NONBANK_COMMITMENTS,
            displayValue: totalMonthlyNonBNankingCommitments
                ? `RM ${numeral(totalMonthlyNonBNankingCommitments).format(",0.00")}`
                : "RM 0.00",
        });
        dispatch({ type: ASB_UPDATE_FINANCING_DETAILS, financingDetailsList });
    };

    function updateApiCEP(callback) {
        const body = {
            screenNo: "3",
            stpReferenceNo: stpReferenceNumber,
            monthlyGrossIncome: removeCommas(monthlyGrossInformation),
            monthlyNonBankCommitments: removeCommas(totalMonthlyNonBNankingCommitments),
        };

        dispatch(
            asbUpdateCEP(body, (data) => {
                if (data) {
                    if (callback) {
                        callback();
                    }
                }
            })
        );
    }

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={APPLY_ASBFINANCINGGUARANTOR_INCOMEDETAILS}
            >
                <ScreenLayout
                    paddingBottom={36}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                            headerCenterElement={
                                <Typo
                                    text={`${STEP} ${currentSteps} of ${totalSteps}`}
                                    fontWeight="300"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                style={styles.containerView}
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                                showsVerticalScrollIndicator={false}
                            >
                                <Typo lineHeight={20} text={GUARANTOR} textAlign="left" />

                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={28}
                                    text={PLEASE_SHARE_WITH_US_INCOME_COMMITMENT_DETAILS}
                                    textAlign="left"
                                />

                                {detailsView()}
                            </KeyboardAwareScrollView>
                        </ScrollView>
                        <FixedActionContainer>
                            <View style={styles.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={incomeDetailsNextBottonEnable ? 1 : 0.5}
                                    backgroundColor={
                                        incomeDetailsNextBottonEnable ? YELLOW : DISABLED
                                    }
                                    fullWidth
                                    componentCenter={
                                        <Typo lineHeight={18} fontWeight="600" text={NEXT_ASB} />
                                    }
                                    onPress={handleContinueButton}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
                <Popup
                    visible={showPopup}
                    onClose={onPopupClose}
                    title={TOTAL_MONTHLY_NONBANK_COMMITMENTS}
                    description={INCLUDIN_YOU_MONTHLY_COMMITMENTS}
                />
                <Popup
                    visible={showPopupConfirm}
                    onClose={onPopupCloseConfirm}
                    title={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE}
                    description={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC}
                    primaryAction={{
                        text: LEAVE,
                        onPress: handleLeaveBtn,
                    }}
                    secondaryAction={{
                        text: CANCEL,
                        onPress: onPopupCloseConfirm,
                    }}
                />
            </ScreenContainer>
        </React.Fragment>
    );

    function detailsView() {
        return (
            <React.Fragment>
                <SpaceFiller height={24} />
                <Typo lineHeight={18} textAlign="left" text={MONTHLY_GROSS_INCOME} />
                <TextInput
                    maxLength={9}
                    isValidate
                    isValid={monthlyloanInformationError === null}
                    errorMessage={monthlyloanInformationError}
                    keyboardType="number-pad"
                    value={monthlyGrossInformation}
                    placeholder={AMOUNT_PLACEHOLDER}
                    onChangeText={onGrassIncomeChange}
                    prefix={CURRENCY_CODE}
                />
                <SpaceFiller height={24} />

                <View style={styles.infoLabelContainerCls}>
                    <Typo
                        lineHeight={18}
                        textAlign="left"
                        text={TOTAL_MONTHLY_NONBANK_COMMITMENTS}
                    />
                    <TouchableOpacity onPress={onTotalMonthInfoPress}>
                        <Image style={styles.infoIcon} source={Assets.icInformation} />
                    </TouchableOpacity>
                </View>

                <TextInput
                    maxLength={9}
                    isValid={totalMonthlyNonBankingCommitmentsError === null}
                    errorMessage={totalMonthlyNonBankingCommitmentsError}
                    keyboardType="number-pad"
                    value={totalMonthlyNonBNankingCommitments}
                    placeholder={AMOUNT_PLACEHOLDER}
                    onChangeText={onTotalMonthNonBankChange}
                    prefix={CURRENCY_CODE}
                />
            </React.Fragment>
        );
    }
}
GuarantorIncomeDetails.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};
const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    containerView: {
        flex: 1,
        paddingHorizontal: 25,
        width: "100%",
    },

    infoIcon: {
        height: 16,
        marginLeft: 10,
        width: 16,
    },
    infoLabelContainerCls: {
        alignItems: "center",
        flexDirection: "row",
        paddingVertical: 2,
    },
});

export default GuarantorIncomeDetails;
