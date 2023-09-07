/* eslint-disable react/jsx-no-bind */
import { isEmpty } from "lodash";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { Alert, TouchableOpacity, StyleSheet } from "react-native";

import {
    ACCOUNT_DETAILS_SCREEN,
    ADD_PREFERRED_AMOUNT,
    ALLOW_PDF_PERMISSION,
    ATM_CASHOUT_STACK,
    BANKINGV2_MODULE,
    TAB_NAVIGATOR,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { checkAtmOnboarding } from "@services";

import { BLUE } from "@constants/colors";
import {
    ATM_REF_ID,
    RECEIPT_NOTE,
    SAVED_PREFERRED_AMOUNT,
    SHARE_RECEIPT,
} from "@constants/strings";

import { getFormatedAccountNumber } from "@utils/dataModel/utility";
import { navigateToUserDashboard } from "@utils/dataModel/utilityDashboard";
import { updateWalletBalance } from "@utils/dataModel/utilityWallet";
import { errorMessageMap } from "@utils/errorMap";
import { ErrorLogger } from "@utils/logs";

const ShareReceipt = ({ navigation, route, getModel, updateModel }) => {
    const [state, setState] = useState({
        preferredAmountList: route.params?.preferredAmountList,
        showLoader: false,
        hasFavourite: route.params?.isPreferred ?? false,
    });

    const parsetoInt = (val, isFloat) => {
        return isFloat
            ? parseFloat(val.replace(",", ""))
            : parseInt(val.replace(",", "").replace(".00", ""));
    };

    const displayAmount = (amount) => {
        return parseFloat(amount).toFixed(2);
    };

    const getAmountList = async () => {
        setState((prevState) => ({ ...prevState, showLoader: true }));
        try {
            const { favAmountList, transactionDetails } = route.params;
            console.info("[ShareReceipt] >> [getAmountList] favAmountList: ", favAmountList);
            console.info(
                "[ShareReceipt] >> [getAmountList] preferredAmountList: ",
                state.preferredAmountList
            );
            const showFavButton =
                favAmountList &&
                (favAmountList.indexOf(transactionDetails?.amount) >= 0 ||
                    favAmountList.length === 3);
            console.info(
                "[ShareReceipt] >> [getAmountList] showFavButton: ",
                showFavButton ?? false
            );
            setState((prevState) => ({ ...prevState, hasFavourite: showFavButton ?? false }));

            const response = await checkAtmOnboarding(true);
            if (response?.status === 200) {
                const { result } = response?.data;
                const preferredList =
                    result?.preferred_amount &&
                    result?.preferred_amount !== {} &&
                    result?.preferred_amount !== "{}"
                        ? JSON.parse(result?.preferred_amount)
                        : [];
                console.info("PreferredAmount >> checkAtmOnboarding ", response?.data);
                if (!isEmpty(preferredList)) {
                    const newArr = preferredList;
                    const listOfAmount = newArr.sort((a, b) => {
                        return b.id - a.id;
                    });

                    console.info("preferredListt: ", preferredList);
                    if (preferredList.length > 0 && preferredList.length < 3) {
                        const alreadyFav = preferredList.filter((arr) => {
                            return (
                                parsetoInt(arr?.amount) ===
                                route?.params?.transactionDetails?.amount
                            );
                        });
                        console.info("alreadyFav: ", alreadyFav);
                        setState((prevState) => ({
                            ...prevState,
                            hasFavourite: alreadyFav?.length === 1,
                            preferredAmountList: listOfAmount,
                            showLoader: false,
                        }));
                    } else {
                        setState((prevState) => ({
                            ...prevState,
                            hasFavourite: preferredList === [] ? false : true,
                            showLoader: false,
                        }));
                    }
                } else {
                    setState((prevState) => ({
                        ...prevState,
                        hasFavourite: false,
                        showLoader: false,
                    }));
                }
            }
        } catch (e) {
            console.info("getAmountList: ", e);
            setState((prevState) => ({
                ...prevState,
                hasFavourite: true,
            }));
        } finally {
            setState((prevState) => ({
                ...prevState,
                hasFavourite: false,
            }));
        }
    };

    const onAcknowledgementModalDismissed = () => {
        if (route.params?.routeFrom === ACCOUNT_DETAILS_SCREEN) {
            navigation.navigate(TAB_NAVIGATOR, {
                screen: BANKINGV2_MODULE,
                params: {
                    screen: ACCOUNT_DETAILS_SCREEN,
                    params: { ...route.params },
                },
            });
        } else {
            navigateToUserDashboard(this.props.navigation, this.props.getModel, { refresh: true });
        }
    };

    const onShareReceiptButtonPressed = async () => {
        setState((prevState) => ({
            ...prevState,
            showLoader: true,
        }));

        try {
            const {
                transactionDetails: { refId, serverDate, accountNo, amount, atmLocation },
                goalTitle,
            } = route?.params || {};

            const displayAmountValue = displayAmount(amount);

            const file = await CustomPdfGenerator.generateReceipt(
                true,
                goalTitle,
                true,
                RECEIPT_NOTE,
                atmLocation
                    ? [
                          {
                              label: ATM_REF_ID,
                              value: refId,
                              showRightText: true,
                              rightTextType: "text",
                              rightStatusType: "",
                              rightText: serverDate,
                          },
                          {
                              label: "Account",
                              value: getFormatedAccountNumber(accountNo),
                              showRightText: false,
                          },
                          {
                              label: "ATM location",
                              value: atmLocation,
                              showRightText: false,
                          },
                          {
                              label: "Amount",
                              value: `RM ${displayAmountValue}`,
                              showRightText: false,
                              rightTextType: "status",
                              rightText: "success",
                              isAmount: true,
                          },
                      ]
                    : [
                          {
                              label: ATM_REF_ID,
                              value: refId,
                              showRightText: true,
                              rightTextType: "text",
                              rightStatusType: "",
                              rightText: serverDate,
                          },
                          {
                              label: "Account",
                              value: getFormatedAccountNumber(accountNo),
                              showRightText: false,
                          },
                          {
                              label: "Amount",
                              value: `RM ${displayAmountValue}`,
                              showRightText: false,
                              rightTextType: "status",
                              rightText: "success",
                              isAmount: true,
                          },
                      ],
                true,
                "success",
                "Successful"
            );

            if (file === null) {
                Alert.alert(ALLOW_PDF_PERMISSION);
                return;
            }

            navigation.navigate("commonModule", {
                screen: "PDFViewer",
                params: {
                    file,
                    share: true,
                    type: "file",
                    pdfType: "shareReceipt",
                    title: "Share Receipt",
                },
            });
        } catch (error) {
            const msg = errorMessageMap(error);
            if (msg) {
                Alert.alert(msg);
            }
            ErrorLogger(error);
        } finally {
            setState((prevState) => ({
                ...prevState,
                showLoader: false,
            }));
        }
    };

    const savePreferredAmount = async (el) => {
        navigation.navigate(ATM_CASHOUT_STACK, {
            screen: ADD_PREFERRED_AMOUNT,
            params: {
                timestamp: null,
                routeFrom: SHARE_RECEIPT,
                action: "new",
                didPerformWithdrawal: true,
                currentList: state.preferredAmountList,
                preferredAmountList: state.preferredAmountList,
                selectedAccount: route.params?.selectedAccount,
                amountObj: {
                    accountName: route.params?.transactionDetails?.accountName,
                    accountNo: route.params?.transactionDetails?.accountNo,
                    amount: route.params?.transactionDetails?.amount,
                },
            },
        });
    };

    useEffect(() => {
        return () => {
            updateModel({
                atm: {
                    selectedAmount: false,
                    withdrawalConfirming: false,
                    qrTextCache: false,
                },
            });
        };
    }, []);

    useEffect(() => {
        if (!route.params?.isPreferred) {
            getAmountList();
        }

        const { isUpdateBalanceEnabled } = getModel("wallet");
        const isSuccess = route.params?.isWithdrawalSuccessful;
        if (isUpdateBalanceEnabled && isSuccess) {
            updateWalletBalance(updateModel);
        }
    }, []);

    const {
        isWithdrawalSuccessful,
        errorMessage,
        transactionDetails: { refId, serverDate, accountName, amount },
    } = route.params;

    const detailsData = [
        {
            title: ATM_REF_ID,
            value: refId,
        },
        {
            title: "Date & time",
            value: serverDate,
        },
        {
            title: "Account",
            value: accountName,
        },
    ];

    const displayAmountValue = displayAmount(amount);

    return (
        <AcknowledgementScreenTemplate
            isSuccessful={isWithdrawalSuccessful}
            message={`Withdrawal ${!isWithdrawalSuccessful ? "unsuccessful" : "successful"}`}
            detailsData={detailsData}
            errorMessage={errorMessage}
            amount={`RM ${displayAmountValue}`}
            showLoader={state.showLoader}
            ctaComponents={[
                isWithdrawalSuccessful && (
                    <ActionButton
                        key="2"
                        fullWidth
                        onPress={onShareReceiptButtonPressed}
                        borderColor="#cfcfcf"
                        borderWidth={1}
                        borderStyle="solid"
                        backgroundColor="#ffffff"
                        componentCenter={
                            <Typo
                                text="Share Receipt"
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                            />
                        }
                    />
                ),
                <ActionButton
                    key="1"
                    fullWidth
                    onPress={onAcknowledgementModalDismissed}
                    componentCenter={
                        <Typo text="Done" fontSize={14} fontWeight="600" lineHeight={18} />
                    }
                />,
                isWithdrawalSuccessful && !state.hasFavourite && (
                    <TouchableOpacity
                        style={styles.savePreferredAmount}
                        onPress={savePreferredAmount}
                    >
                        <Typo
                            key="3"
                            fontSize={14}
                            lineHeight={14}
                            fontWeight="600"
                            text={SAVED_PREFERRED_AMOUNT}
                            color={BLUE}
                        />
                    </TouchableOpacity>
                ),
            ]}
        />
    );
};
const styles = StyleSheet.create({
    savePreferredAmount: { paddingVertical: 10 },
});

ShareReceipt.propTypes = {
    navigation: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};

export default withModelContext(ShareReceipt);
