import AsyncStorage from "@react-native-community/async-storage";
import { useRoute, useNavigation } from "@react-navigation/native";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import {
    ATM_CASHOUT_STACK,
    DASHBOARD,
    ATM_CASHOUT_PREFERRED_VALUE,
    ATM_AMOUNT_SCREEN,
    ADD_PREFERRED_AMOUNT,
} from "@navigation/navigationConstant";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { getDashboardWalletBalance, invokeL2, checkAtmOnboarding } from "@services";

import { ROYAL_BLUE } from "@constants/colors";
import {
    ATM_CASHOUT,
    ATMCASHOUT,
    ATM_QR,
    WITHDRAWAL_SCREEN,
    MUST_BE,
    AMOUNT,
    SELECT_PREF_AMOUNT,
    SET_AMOUNT,
    OR_ENTER_AMOUNT,
    COMMON_ERROR_MSG,
    SECURITY_COOLING_ATMCASHOUT,
} from "@constants/strings";

import { getItemFromStorage } from "@utils/atmCashoutUtil";
import { errorCodeMap } from "@utils/errorMap";
import { ErrorLogger } from "@utils/logs";

import ATMAmountInputScreenTemplate from "./ATMAmountInputScreenTemplate";
import PreferredAmountValue from "./PreferredAmountValue";
import { timeDifference } from "./helper";

const AmountScreen = (props) => {
    const navigation = useNavigation();
    const route = useRoute();
    const { getModel, updateModel } = useModelController();
    const [state, setState] = useState({
        preferredAmountList: route?.params?.preferredAmountList,
        selectedAccount: route?.params?.selectedAccount,
        buttonTitle:
            route?.params?.routeFrom === ATM_QR || route?.params?.routeFrom === WITHDRAWAL_SCREEN
                ? "Next"
                : "Scan To Withdraw",
        custName: "",
        disableToast: false,
        showKeypad: false,
        buttonDisabled: true,
        cacheQRText: undefined,
        preferredAmountSelected: null,
        focusAmount: false,
        selectedAmount: undefined,
        amount: 0,
    });

    useEffect(() => {
        initData();
    }, []);

    useEffect(() => {
        if (route.params.action === "update") {
            const selectedAmount = parseInt(props?.route?.params?.transferAmount);
            setState((prevState) => ({
                ...prevState,
                buttonTitle: "Next",
                preferredAmountSelected: selectedAmount,
                buttonDisabled: false,
            }));
        }
    }, [route.params.routeFrom]);

    useEffect(() => {
        const checkBackFromShareReceipt = () => {
            if (props.route.params.backFromShareReceipt) {
                setState((prevState) => ({
                    ...prevState,
                    buttonTitle: "Scan To Withdraw",
                }));
            }
        };
        checkBackFromShareReceipt();
    }, [route.params.backFromShareReceipt]);

    useEffect(() => {
        const fetchPreferredAmountList = async () => {
            await _getPreferredAmountList();
        };
        fetchPreferredAmountList();
    }, []);

    useEffect(() => {
        route?.params?.routeFrom === "AddPreferredAmount" &&
            setState((prevState) => ({ ...prevState, disableToast: true }));
    }, [state.disableToast, route.params.routeFrom]);

    const showLoader = (visible) => {
        updateModel({
            ui: {
                showLoader: visible,
            },
        });
    };

    const getWalletAccData = () => {
        const { params } = route;
        const hasAccNoParam =
            params?.selectedAccount?.acctNo ||
            params?.selectedAccount?.number ||
            params?.amountObj?.accountNo;
        if (!hasAccNoParam) {
            getPrimaryAccount();
        }
    };

    const _getPreferredAmountList = async () => {
        const { atmCashOutReady } = getModel("misc");
        const { isEnabled, isOnboarded } = getModel("atm");
        try {
            const response = await checkAtmOnboarding(true);
            if (response?.status === 200) {
                const { code, result } = response?.data;
                if (code === 200) {
                    setState((prevState) => ({
                        ...prevState,
                        custName: result?.customerName,
                    }));
                    result?.customerName &&
                        navigation.setParams({
                            custName: result.customerName,
                            entryPoint: route?.params?.routeFrom === ATM_QR ? ATM_QR : "Dashboard",
                        });

                    if (code === 200) {
                        if (result?.status === "ACTIVE" && !isEnabled && !isOnboarded) {
                            showInfoToast({
                                message: SECURITY_COOLING_ATMCASHOUT,
                            });
                        } else if (atmCashOutReady && result?.status === "ACTIVE") {
                            await AsyncStorage.setItem("isAtmOnboarded", "true");
                        }
                        updateModel({
                            atm: {
                                isOnboarded: atmCashOutReady && result?.status === "ACTIVE",
                                serviceFee: result?.feeCharge,
                            },
                        });
                        navigation.setParams({
                            is24HrCompleted: atmCashOutReady && result?.status === "ACTIVE",
                        });
                    }
                } else {
                    if (code === 200) {
                        setState((prevState) => ({
                            ...prevState,
                            custName: result?.customerName,
                        }));
                        navigation.setParams({
                            is24HrCompleted: atmCashOutReady && result?.status === "ACTIVE",
                            preferredAmountList: [],
                        });
                    }
                }
            }
        } catch (err) {
            console.info("err >> ", err);
            const exObj = errorCodeMap(err);
            showErrorToast({ message: exObj?.message ?? COMMON_ERROR_MSG });
        }
    };

    const initData = async () => {
        try {
            const { isPostLogin } = getModel("auth");
            if (!isPostLogin) {
                const request = await _requestL2Permission();
                if (request) {
                    getWalletAccData();
                    return;
                } else {
                    navigation.goBack();
                }
                if (props?.route?.params?.routeFrom === ATM_QR) {
                    // cancelWithdrawal();
                }
                return;
            }
            getWalletAccData();
            const fromOnEdit = route.params.action === "update";
            if (fromOnEdit) {
                setState((prevState) => ({ ...prevState, buttonTitle: "Next" }));
            }
        } catch (ex) {
            console.log("ex...", ex);
        } finally {
            props.navigation.setParams({ routeFrom: DASHBOARD, allowCancellation: true });
        }
    };

    const getPrimaryAccount = async () => {
        showLoader(true);
        try {
            const response = await getDashboardWalletBalance(true);
            if (response?.data) {
                const { result } = response.data;
                if (result) {
                    updateModel({
                        wallet: {
                            primaryAccount: result,
                        },
                    });
                    const data = {
                        acctCode: result?.code,
                        acctType: result?.type,
                        acctName: result?.name,
                        acctBalance: result?.currentBalance,
                        currentBalance: result?.currentBalance,
                        oneDayFloat: result?.oneDayFloat,
                        twoDayFloat: result?.twoDayFloat,
                        lateClearing: result?.lateClearing,
                        primary: result?.primary,
                        acctStatusCode: result?.statusCode,
                        acctStatusValue: result?.statusMessage,
                        rawBalance: result?.value,
                        group: result?.group,
                        number: result?.number,
                    };
                    setState((prevState) => ({ ...prevState, selectedAccount: data }));
                    showLoader(false);
                }
            }
        } catch (error) {
            _onBackPress();
            showLoader(false);
        }
    };

    const _onBackPress = async () => {
        updateModel({
            atm: {
                selectedAmount: false,
            },
        });
        props.navigation.setParams({ routeFrom: null });
        props.navigation.goBack();
    };

    const _onHeaderBackButtonPressed = async () => {
        updateModel({
            atm: {
                selectedAmount: false,
            },
        });
        navigation.navigate(ATM_CASHOUT_STACK, {
            screen: "PreferredAmount",
            params: {
                routeFrom: ATM_AMOUNT_SCREEN,
            },
        });

        setState((prevState) => ({ ...prevState, disableToast: false }));
    };

    const _requestL2Permission = async () => {
        try {
            const response = await invokeL2(false);
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    const onItemPressed = async (item) => {
        setState((prevState) => ({
            ...prevState,
            buttonDisabled: false,
            showKeypad: false,
            selectedAmount: item,
        }));
        updateModel({
            atm: {
                selectedAmount: item,
                entryPoint: route.params.entryPoint,
            },
        });
    };

    const focusOnAmount = () => {
        setState((prevState) => ({
            ...prevState,
            focusAmount: true,
            preferredAmountSelected: null,
        }));
    };

    useEffect(() => {
        let isMounted = true;
        const main = async () => {
            try {
                const dataString = await getItemFromStorage();
                const list = JSON.parse(dataString);
                if (
                    dataString !== null &&
                    list !== null &&
                    !_.isEqual(state.preferredAmountList, list)
                ) {
                    isMounted &&
                        setState((prevState) => ({ ...prevState, preferredAmountList: list }));
                }
            } catch (err) {
                console.log(err);
            }
        };
        main();
        return () => {
            isMounted = false;
        };
    }, [route?.params?.preferredAmountList]);

    return (
        <ATMAmountInputScreenTemplate
            topComponent={
                <View style={styles.topComponent}>
                    <View>
                        <SpaceFiller height={12} />
                        <Typo
                            text={SELECT_PREF_AMOUNT}
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            textAlign="left"
                        />
                        <SpaceFiller height={24} />
                        <PreferredAmountValue
                            navigation={navigation}
                            route={{
                                screen: { ATM_CASHOUT_PREFERRED_VALUE },
                                params: {
                                    ...route?.params,
                                    // Modified line: Added the common values to the params
                                    entryPoint:
                                        route?.params?.routeFrom === ATM_QR ? ATM_QR : "Dashboard",
                                    custName: state.custName,
                                    disableToast: state.disableToast,
                                    preferredAmountList: state.preferredAmountList,
                                    transferAmount: route?.params?.transferAmount,
                                    didPerformAddOrUpdate:
                                        !state.preferredAmountList?.length &&
                                        route?.params?.didPerformAddOrUpdate === "delete"
                                            ? "false"
                                            : route?.params?.didPerformAddOrUpdate === "delete"
                                            ? "delete"
                                            : !state.preferredAmountList?.length
                                            ? "false"
                                            : "update",
                                    routeFrom: ATM_AMOUNT_SCREEN,
                                },
                            }}
                            onItemPressed={onItemPressed}
                            selectedItemId={state.preferredAmountSelected}
                            setSelectedItemId={(item) =>
                                setState((prevState) => ({
                                    ...prevState,
                                    preferredAmountSelected: item,
                                }))
                            }
                        />

                        <SpaceFiller height={24} />

                        <View style={styles.setAmount}>
                            <Typo
                                text={
                                    state.preferredAmountList?.length &&
                                    state.preferredAmountList?.length < 4
                                        ? SET_AMOUNT
                                        : ""
                                }
                                color={ROYAL_BLUE}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                textAlign="right"
                                onPressText={() => {
                                    navigation.navigate(ATM_CASHOUT_STACK, {
                                        screen: ADD_PREFERRED_AMOUNT,
                                        params: {
                                            ...route.params,
                                            routeFrom: ATM_AMOUNT_SCREEN,
                                            didPerformAddOrUpdate: "add",
                                            preferredAmountList: state.preferredAmountList,
                                        },
                                    });
                                }}
                            />
                        </View>
                        <SpaceFiller height={32} />
                    </View>
                    <View>
                        <Typo
                            text={OR_ENTER_AMOUNT}
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={18}
                            textAlign="left"
                        />
                    </View>
                    <SpaceFiller height={16} />
                </View>
            }
            bottomComponent={
                <View style={styles.bottomComponent}>
                    <Typo
                        text={MUST_BE}
                        fontSize={12}
                        fontWeight="400"
                        lineHeight={18}
                        textAlign="left"
                    />
                </View>
            }
            onHeaderBackButtonPressed={_onHeaderBackButtonPressed}
            headerCenterText={ATMCASHOUT}
            inputTextMaxLength={10}
            headerData={
                !route?.params?.didPerformWithdrawal &&
                route?.params?.timestamp &&
                navigation.isFocused() && {
                    type: ATM_CASHOUT,
                    timeInSecs: timeDifference(route?.params?.timestamp, route?.params?.mins),
                    navigation,
                    params: {
                        qrText: route?.params?.qrText,
                        refNo: route?.params?.refNo,
                    },
                    allowToCancelTimer: navigation.isFocused(),
                    screenName: AMOUNT,
                }
            }
            buttonText={state.buttonTitle}
            showKeypad={state.showKeypad}
            setShowKeypad={(value) =>
                setState((prevState) => ({ ...prevState, showKeypad: value }))
            }
            isDisabled={state.buttonDisabled}
            setIsDisabled={(value) =>
                setState((prevState) => ({ ...prevState, buttonDisabled: value }))
            }
            qrParams={state.cacheQRText}
            focusOnAmount={focusOnAmount}
            selectedPreferredAmount={state.preferredAmountSelected}
            amount={state.amount}
            setAmount={(value) => setState((prevState) => ({ ...prevState, amount: value }))}
        />
    );
};

const styles = StyleSheet.create({
    topComponent: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
    setAmount: { alignSelf: "flex-end" },
    bottomComponent: { marginTop: 8 },
});

AmountScreen.propTypes = {
    route: PropTypes.any,
    navigation: PropTypes.any,
};

export default withModelContext(AmountScreen);
