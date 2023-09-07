import PropTypes from "prop-types";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import DeviceInfo from "react-native-device-info";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import {
    DONATE_CONFIRMATION_SCREEN,
    ETHICAL_CARD_STACK,
    SECURE2U_COOLING,
    CARBON_OFFSET_STATUS_SCREEN,
} from "@navigation/navigationConstant";

import AccountDetailList from "@components/Others/AccountDetailList";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";
import TransferConfirmation from "@components/Transfers/TransferConfirmationScreenTemplate";

import { withModelContext } from "@context";

import { payBill } from "@services";

import { GREEN } from "@constants/colors";
import {
    BILL_PAYMENT_OTP,
    TWO_FA_TYPE_SECURE2U_PUSH,
    TWO_FA_TYPE_SECURE2U_PULL,
    TWO_FA_TYPE_TAC,
    TWO_FA_TYPE_S2U,
} from "@constants/fundConstants";
import {
    COMMON_ERROR_MSG,
    CONFIRMATION,
    DATE,
    FAILED,
    PAY_NOW,
    SECURE2U_IS_DOWN,
    TRANSFER_FROM,
    TRANSFER_TO,
    CARBON_OFFSET,
    AUTHORISATION_FAILED,
} from "@constants/strings";
import { PAY_BILL_API } from "@constants/url";

import { getDeviceRSAInformation } from "@utils/dataModel/utilityPartial.2";
import { formateRefnumber } from "@utils/dataModel/utilityPartial.4";
import { checks2UFlow } from "@utils/dataModel/utilityPartial.5";
import { formatCreditCardNo } from "@utils/dataModel/utilityPartial.6";

const TODAYS_DATE_CODE = "00000000";

const CarbonOffsetConfirmation = ({ route, navigation, getModel, updateModel }) => {
    const [state, setState] = useState({
        showS2UModal: false,
        transactionResponseObject: {},
        tacParams: null,
        transferAPIParams: null,
        twoFAFlow: "",
        s2uValidateData: {},
        isDoneDisabled: false,
    });
    const { carbonOffsetPayeeCode } = getModel("ethicalDashboard");
    const params = route?.params;
    const formattedCardNo = formatCreditCardNo(params?.cardDetails?.cardNo);

    const transactionDetails = [
        {
            label: TRANSFER_TO,
            value: `Carbon Offset ${params?.projectName}`,
        },
        {
            label: TRANSFER_FROM,
            value: `${params?.cardDetails?.cardHolderName}\n${formattedCardNo}`,
        },
        {
            label: DATE,
            value: `${state.transactionResponseObject?.serverDate}`,
        },
    ];

    const handleConfirmation = async () => {
        setState({ ...state, isDoneDisabled: true });
        //check validation flow
        const { flow, secure2uValidateData } = await checks2UFlow(17, getModel, updateModel);

        if (!secure2uValidateData.s2u_enabled) {
            showInfoToast({ message: SECURE2U_IS_DOWN });
        }

        setState({ ...state, twoFAFlow: flow, s2uValidateData: secure2uValidateData });

        if (flow === SECURE2U_COOLING) {
            navigateToS2UCooling(navigation.navigate);
        } else if (flow === "S2UReg") {
            const redirect = {
                succStack: ETHICAL_CARD_STACK,
                succScreen: DONATE_CONFIRMATION_SCREEN,
            };
            navigateToS2UReg(navigation.navigate, route?.params, redirect);
        } else if (flow === TWO_FA_TYPE_S2U) {
            const params = getAPIParam(TWO_FA_TYPE_S2U);

            callTransferAPI(params);
        } else if (flow === TWO_FA_TYPE_TAC) {
            handleTACFlow();
        } else {
            const params = getAPIParam();

            callTransferAPI(params);
        }
    };

    const getAPIParam = (flow) => {
        console.log("[getAPIParam]", state.twoFAFlow);

        let twoFAType = "";

        const deviceInfo = getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);

        if (flow === TWO_FA_TYPE_S2U) {
            twoFAType =
                state.s2uValidateData?.pull === "N"
                    ? TWO_FA_TYPE_SECURE2U_PUSH
                    : TWO_FA_TYPE_SECURE2U_PULL;
        } else {
            twoFAType = TWO_FA_TYPE_TAC;
        }

        return {
            accountType: null,
            billAcctNo: params?.payeeDetails?.billerActNo ?? "",
            billRefNo: params?.payeeDetails?.billerRefNo ?? "",
            effectiveDateTime: TODAYS_DATE_CODE, //"00000000"
            fromAccount: params?.cardDetails?.cardNo,
            fromAcctCode: params?.cardDetails?.code,
            payeeCode: params?.payeeDetails?.payeeCode ?? carbonOffsetPayeeCode,
            tacrequired: "0",
            transactionType: BILL_PAYMENT_OTP,
            transferAmount: params.donationAmount,
            twoFAType,
            tac: "",
            startDate: "",
            endDate: "",
            payeeName: params?.payeeDetails?.payeeName,
            mobileSDKData: mobileSDK, // Required For RSA
            type: "OPEN",
            zakat: false,
            donation: false,
            zakatFitrah: false,
            zakatType: "",
        };
    };

    const callTransferAPI = async (params) => {
        try {
            const response = await payBill(params, PAY_BILL_API);

            const responseObject = response.data;

            if (responseObject?.statusCode === "0") {
                if (state.twoFAFlow === TWO_FA_TYPE_TAC || state.twoFAFlow === "NA") {
                    navigateStatusScreen(responseObject);
                } else {
                    handleS2uFlow(responseObject);
                }
            } else {
                onTACClose();
                navigateStatusScreen(responseObject);
            }
        } catch (error) {
            handleAPIError(error);
            setState({ ...state, isDoneDisabled: false });
        }
    };

    const callTransferAPITAC = async (params) => {
        return payBill(params, PAY_BILL_API);
    };

    const handleAPIError = (err) => {
        let errorObj = err?.error;
        errorObj = errorObj?.error ?? errorObj;
        if (err.status >= 500 && err.status < 600) {
            showErrorToast({ message: errorObj.message ?? COMMON_ERROR_MSG });
        } else if (err.status >= 400 && err.status < 500) {
            navigateStatusScreen({
                formattedTransactionRefNumber: errorObj?.formattedTransactionRefNumber ?? null,
                serverDate: errorObj?.serverDate ?? null,
                additionalStatusDescription: errorObj?.message ?? null,
                statusDescription: FAILED,
                statusCode: errorObj.statusCode,
            });
        }
    };

    const navigateStatusScreen = (response, s2uSignData = null) => {
        console.log("[navigateStatusScreen]", response);

        const statusDescription =
            response.statusCode === "0" ? response?.statusDescription.toLowerCase() : "Failed";

        const statusCode = s2uSignData?.s2uSignRespone?.status ?? "";

        const s2uStatusDesc =
            s2uSignData?.s2uSignRespone?.statusDescription?.toLowerCase() ?? "Failed";

        if (s2uSignData) {
            if (statusCode === "M201") {
                response.statusDescription = AUTHORISATION_FAILED;
            } else if (statusCode === "M408") {
                response.statusDescription = AUTHORISATION_FAILED;
                response.additionalStatusDescription = s2uStatusDesc;
                response.formattedTransactionRefNumber = formateRefnumber(
                    response?.transactionRefNumber
                );
            } else {
                response.statusDescription = `Payment ${s2uStatusDesc}`;
            }
        } else {
            response.statusDescription = `Payment ${statusDescription}`;
        }

        // effectiveDateType
        navigation.navigate(ETHICAL_CARD_STACK, {
            screen: CARBON_OFFSET_STATUS_SCREEN,
            params: {
                transferResponse: response,
                transferParams: {
                    ...route.params,
                    isToday: true,
                    effectiveDate: TODAYS_DATE_CODE,
                },
                s2uSignRespone: s2uSignData?.s2uSignRespone,
                isS2uFlow: s2uSignData !== null,
                projectName: params?.projectName,
            },
        });
    };

    //need to follow paybill s2u flow - to change
    const handleS2uFlow = async (response) => {
        console.log("[handleS2uFlow]");

        console.log(response);
        setState({ ...state, showS2UModal: true, transactionResponseObject: response });
    };

    const onS2uDone = async (response) => {
        // Close S2u popup
        onS2uClose();
        const customResponse = {
            ...state.transactionResponseObject,
            statusCode: response.transactionStatus ? "0" : "1",
            ...(response?.s2uSignRespone && {
                additionalStatusDescription: response.s2uSignRespone.additionalStatusDescription,
                formattedTransactionRefNumber:
                    response.s2uSignRespone.formattedTransactionRefNumber,
            }),
        };
        navigateStatusScreen(customResponse, response);
    };

    const onS2uClose = () => {
        setState({ ...state, showS2UModal: false, tacParams: null });
    };

    const handleTACFlow = async (isResend = false, showOTPCb = () => {}) => {
        const tacParams = {
            amount: params.donationAmount,
            fromAcctNo: params?.cardDetails?.cardNo,
            fundTransferType: "BILL_PAYMENT_OTP",
            accCode: params?.cardDetails?.code,
            toAcctNo: params?.payeeDetails?.billerActNo,
            payeeName: params?.projectName,
        };
        const transferParams = getAPIParam();
        setState({ ...state, transferAPIParams: transferParams, tacParams });
    };

    const onTACClose = () => {
        setState({ ...state, tacParams: null });
    };
    const onTACError = (err) => {
        console.log("TAC ERROR", err);
        setState({ ...state, isDoneDisabled: false });
        navigateStatusScreen(err);
    };

    const onTacSuccess = (response) => {
        onTACClose();
        navigateStatusScreen(response);
    };

    function navigateBack() {
        navigation.goBack();
    }

    return (
        <TransferConfirmation
            headTitle={CONFIRMATION}
            payLabel={PAY_NOW}
            amount={params.donationAmount}
            onEditAmount={() => {}}
            logoTitle={CARBON_OFFSET}
            logoSubtitle={params?.projectName}
            logoImg={{
                type: "url",
                source: params?.payeeDetails?.carbonOffsetPayeeLogo,
            }}
            subtitleTextAlign="center"
            onDonePress={handleConfirmation}
            accountListLabel=""
            isHideAccountList={true}
            isDoneDisabled={state.isDoneDisabled}
            onBackPress={navigateBack}
            onClosePress={navigateBack}
            extraData={{}}
            tacParams={state.tacParams}
            transferAPIParams={state.transferAPIParams}
            transferApi={callTransferAPITAC}
            onTacSuccess={onTacSuccess}
            onTacError={onTACError}
            onTacClose={onTACClose}
            transactionResponseObject={state.transactionResponseObject}
            isShowS2u={state.showS2UModal}
            onS2UDone={onS2uDone}
            onS2UClose={onS2uClose}
            s2uExtraParams={{
                metadata: {
                    txnType: "PAY_BILL",
                    donation: false,
                },
            }}
            transactionDetails={transactionDetails}
            isLoading={false}
            secure2uValidateData={state.s2uValidateData}
        >
            <Typo fontWeight="600" lineHeight={18} color={GREEN} style={styles.carbonAmountText}>
                <Text>{params.carbonOffsetAmount.toFixed(0)}</Text>
                <Text> Kg CO₂</Text>
            </Typo>
            <View style={styles.accountContainer}>
                <Typo
                    fontWeight="600"
                    lineHeight={18}
                    textAlign="left"
                    style={styles.accountTitle}
                    text={TRANSFER_FROM}
                />
                <AccountDetailList
                    item={{
                        type: "C",
                        number: params?.cardDetails?.cardNo,
                        name: params?.cardDetails?.cardHolderName,
                        value: params?.cardDetails?.outstandingBalance,
                        selected: true,
                    }}
                    index={0}
                    isSingle={true}
                    onPress={() => {}}
                />
            </View>
        </TransferConfirmation>
    );
};

const styles = StyleSheet.create({
    carbonAmountText: { marginTop: -30 },
    accountContainer: { marginHorizontal: 15, marginTop: 36 },
    accountTitle: { marginHorizontal: 19 },
});

CarbonOffsetConfirmation.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.object,
    updateModel: PropTypes.object,
    carbonAmount: PropTypes.number,
};

export default withModelContext(CarbonOffsetConfirmation);
