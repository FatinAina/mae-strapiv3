/* eslint-disable react/jsx-no-bind */
import AsyncStorage from "@react-native-community/async-storage";
import { isEmpty } from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { View, TouchableOpacity, Image, StyleSheet, Dimensions, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

import {
    ATM_CASHOUT_STACK,
    ATM_AMOUNT_SCREEN,
    ATM_PREFERRED_AMOUNT,
    QR_STACK,
    ATM_WITHDRAW_CONFIRMATION,
    CASHOUT_FAVOURITE,
    BANKINGV2_MODULE,
    TAB,
    DASHBOARD,
    TAB_NAVIGATOR,
} from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { withModelContext } from "@context";

import {
    cancelOrTimeoutRequest,
    checkAtmOnboarding,
    combinedATMActions,
    invokeL2,
} from "@services";

import { MEDIUM_GREY, GREY, WHITE } from "@constants/colors";
import {
    ATM_QR,
    COMMON_ERROR_MSG,
    PREFERRED_AMOUNT,
    SET_UP_ATM_HOW_TO_PREFERRED,
    SET_UP_SUCCESSFUL_ATMCASHOUT,
    STEP1_ATMCASHOUT,
    STEP1_ATMCASHOUT_DESC,
    STEP2_ATMCASHOUT,
    STEP2_ATMCASHOUT_DESC,
    TIPS_ATMCASHOUT,
    SECURITY_COOLING_ATMCASHOUT,
} from "@constants/strings";

import { getDeviceRSAInformation } from "@utils/dataModel/utility";
import { navigateToHomeDashboard } from "@utils/dataModel/utilityDashboard";
import { errorCodeMap } from "@utils/errorMap";
import { ErrorLogger } from "@utils/logs";

import Images from "@assets";

const CloseButton = ({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.closeButton}>
        <Image source={Images.icCloseBlack} style={styles.closeButtonIcon} />
    </TouchableOpacity>
);

CloseButton.propTypes = {
    onPress: PropTypes.func,
};

const { width } = Dimensions.get("window");
const X_WIDTH = 375;
const isIPhoneSmall = Platform.OS === "ios" && width <= X_WIDTH;

const styles = StyleSheet.create({
    addSteps: {
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: "row",
        height: 114,
        marginBottom: 8,
        padding: 20,
        textAlign: "left",
    },
    steps: {
        marginBottom: 16,
        textAlign: "left",
    },
    bgImg: {
        marginTop: isIPhoneSmall ? 20 : 0,
        width: "100%",
    },
    closeButton: {
        alignItems: "center",
        height: 44,
        justifyContent: "center",
        width: 44,
    },
    closeButtonIcon: {
        height: 17,
        width: 17,
    },
    container: {
        flex: 1,
        height: "100%",
    },
    contentContainer: {
        flexGrow: 1,
        height: "100%",
    },
    description: {
        marginBottom: 10,
    },
    footerButtonTextContainer: {
        marginTop: 2,
        textAlign: "left",
        //marginLeft: 16,
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    stepsText: {
        textAlign: "left",
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 20,
    },
    layout: { flex: 1, paddingHorizontal: 25, height: "100%" },
    // check the diff b/w the two
    mb20: {
        marginBottom: "-16%",
        //position: "absolute",
        zIndex: -1,
    },
    mb40: {
        marginBottom: "-16%",
        //position: "absolute",
        zIndex: -1,
    },
    mt25: {
        marginTop: 25,
    },
    mt40: {
        marginTop: 10,
    },
    text: {
        marginTop: 8,
    },
});

class PreferredAmount extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
    };
    constructor(props) {
        super(props);
        this.state = {
            preferredAmountList: [],
            menuArray: [],
            showMenu: false,
            editMode: false,
            didPerformAddOrUpdate: false,
            selectedItem: null,
            isLoading: false,
            custName: "",
            hideAddbtn: false,
            hasScannedQR: props.route?.params?.routeFrom === ATM_QR,
        };
    }

    componentDidMount() {
        this.initData();
    }

    initData = async () => {
        const { isPostLogin } = this.props.getModel("auth");
        if (!isPostLogin) {
            const request = await this._requestL2Permission();
            if (request) {
                this._getPreferredAmountList();
                return;
            }
            this.setState({ isLoading: false });
            this.props.navigation.goBack();
        } else {
            this._getPreferredAmountList();
        }
    };
    componentDidUpdate(props) {
        console.log(`PA DidUpdate`);
        if (this.props.route.params?.fromPNS) {
            this.setState({ isLoading: true });
            this._getPreferredAmountList();
        } else if (
            this.props.route.params?.didPerformAddOrUpdate &&
            this.props.route.params?.preferredAmountList
        ) {
            this.setState({ isLoading: true });
            this.updatePreferredAmountList(
                this.state.preferredAmountList.length >
                    this.props.route.params?.preferredAmountList.length
            );
        } else if (
            this.props.route.params?.didPerformWithdrawal &&
            this.props.route.params?.didPerformWithdrawal !==
                props.route.params?.didPerformWithdrawal
        ) {
            this._onClickAmount("new", "Add Preferred Amount");
        }

        if (
            this.props.route.params.is24HrCompleted &&
            this.props.route.params.routeFrom === "Dashboard"
        ) {
            console.log(`PA activated`);
            this.props.navigation.navigate(ATM_CASHOUT_STACK, {
                screen: ATM_AMOUNT_SCREEN,
                params: {
                    ...this.props.route.params,
                    routeFrom: ATM_PREFERRED_AMOUNT,
                    is24HrCompleted: true,
                },
            });
        } else if (
            this.props.route.params.is24HrCompleted &&
            this.props.route.params.routeFrom === ATM_AMOUNT_SCREEN
        ) {
            console.log(`PA haven't activated`);
            this.props.navigation.navigate(TAB_NAVIGATOR, {
                screen: TAB,
                params: {
                    ...this.props.route.params,
                    screen: DASHBOARD,
                    params: { refresh: true },
                },
            });
        }
    }
    updatePreferredAmountList = (needsUpdate) => {
        this.setState({ isLoading: true });
        if (!needsUpdate) {
            this._getPreferredAmountList();
        }
        this.setState(
            {
                didPerformAddOrUpdate: true,
                preferredAmountList: needsUpdate
                    ? this.props.route.params?.preferredAmountList
                    : this.state.preferredAmountList,
            },
            async () => {
                await this.props.navigation.setParams({
                    preferredAmountList: [],
                    didPerformAddOrUpdate: false,
                });
            }
        );
        this.setState({ isLoading: false });
    };
    _getPreferredAmountList = async (addOrUpdate) => {
        this.setState({ isLoading: true });

        try {
            const { isEnabled, isOnboarded } = this.props.getModel("atm");

            if (this.props.route.params.fromPNS) {
                this.props.navigation.setParams({
                    fromPNS: false,
                });
            }

            const response = await checkAtmOnboarding(true);

            if (response?.status === 200) {
                const { code, result } = response.data;
                const preferredList = result?.preferred_amount
                    ? JSON.parse(result.preferred_amount)
                    : null;

                if (code === 200) {
                    if (!isEmpty(preferredList)) {
                        const listOfAmount = preferredList.sort((a, b) => b.id - a.id);
                        this.setState(
                            {
                                hideAddbtn: listOfAmount.length > 0,
                                preferredAmountList: listOfAmount,
                                didPerformAddOrUpdate: addOrUpdate,
                                custName: result.customerName,
                                isLoading: false,
                            },
                            async () => {
                                if (result.status === "ACTIVE" && !isEnabled && !isOnboarded) {
                                    showInfoToast({
                                        message: SECURITY_COOLING_ATMCASHOUT,
                                    });
                                } else if (
                                    this.props.getModel("misc").atmCashOutReady &&
                                    result.status === "ACTIVE"
                                ) {
                                    await AsyncStorage.setItem("isAtmOnboarded", "true");
                                }

                                this.props.updateModel({
                                    atm: {
                                        preferredAmount: listOfAmount,
                                        isOnboarded:
                                            this.props.getModel("misc").atmCashOutReady &&
                                            result.status === "ACTIVE",
                                        serviceFee: result.feeCharge,
                                    },
                                });

                                this.props.navigation.setParams({
                                    is24HrCompleted:
                                        this.props.getModel("misc").atmCashOutReady &&
                                        result.status === "ACTIVE",
                                });
                            }
                        );
                    } else {
                        this.setState({
                            hideAddbtn: false,
                            custName: result.customerName,
                            didPerformAddOrUpdate: addOrUpdate,
                            preferredAmountList: [],
                            isLoading: false,
                        });

                        this.props.navigation.setParams({
                            is24HrCompleted:
                                this.props.getModel("misc").atmCashOutReady &&
                                result.status === "ACTIVE",
                            preferredAmountList: [],
                        });

                        if (
                            (result.status === "ACTIVE" && !isEnabled && !isOnboarded) ||
                            result.status === "PENDING"
                        ) {
                            showInfoToast({
                                message: SECURITY_COOLING_ATMCASHOUT,
                            });
                        }
                    }
                }
            }
        } catch (err) {
            this.setState({ isLoading: false });
            console.info("err >> ", err);
            const exObj = errorCodeMap(err);
            showErrorToast({ message: exObj?.message ?? COMMON_ERROR_MSG });
        }
    };

    requestTodelete = (el) => {
        this.setState({
            popupVisible: true,
            selectedItem: el,
        });
    };

    _removePreferredAmount = async () => {
        this.setState({ popupVisible: false }, async () => {
            const removeObj = this.state.selectedItem;
            const deviceInfo = this.props.getModel("device");
            const mobileSDKData = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
            let param = {
                mobileSDKData,
                requestType: "QRCLW_002",
            };
            this.state.preferredAmountList
                .sort((a, b) => {
                    return a.id - b.id;
                })
                .forEach((el) => {
                    if (removeObj.id !== el.id) {
                        param["preferredAmount" + el?.id] = el?.amount;
                    } else {
                        param["preferredAmount" + removeObj?.id] = "";
                        param["amount"] = removeObj?.amount;
                        param["action"] = "DELETE";
                        param["accountNo"] = removeObj?.accountNo;
                    }
                });

            const listUpdated = this.state.preferredAmountList.filter((prefAmt) => {
                return prefAmt.id !== removeObj?.id;
            });
            const list = listUpdated.map((obj, i) => {
                return {
                    ...obj,
                    id: parseInt(i) + 1,
                };
            });
            const listOfAmount = list.sort((a, b) => {
                return b.id - a.id;
            });
            param["preferredAmount"] = JSON.stringify(listOfAmount);
            await this._updatePreferredAmountApi(param, "remove");
        });
    };

    _updatePreferredAmountApi = async (params, isNew) => {
        try {
            if (isNew !== "new") {
                const response = await combinedATMActions(params);
                if (response?.data?.code === 200) {
                    this.props.navigation.setParams({
                        preferredAmountList: [],
                        didPerformAddOrUpdate: false,
                    });
                    this._getPreferredAmountList(true);
                    if (isNew === "remove") {
                        this.setState({ selectedItem: null });
                        showInfoToast({
                            message: `Preferred withdrawal amount deleted successfully.`,
                        });
                    } else {
                        showInfoToast({
                            message: `Preferred withdrawal amount ${
                                isNew === "new" ? "added" : "updated"
                            } successfully.`,
                        });
                    }
                }
            } else {
                this.setState({ didPerformAddOrUpdate: false }, () => {
                    this.props.navigation.navigate(ATM_CASHOUT_STACK, {
                        screen: CASHOUT_FAVOURITE,
                        params: {
                            apiParams: params,
                            isNew,
                            routeFrom: PREFERRED_AMOUNT,
                            custName: this.state.custName,
                            currentList: this.state.preferredAmountList,
                        },
                    });
                });
            }
        } catch (error) {
            console.log("combinedATMActions:error", error);
            showErrorToast({
                message: error?.message,
            });
        }
    };
    _requestL2Permission = async () => {
        try {
            const response = await invokeL2(false);
            this.setState({ isLoading: true });
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            this.setState({ isLoading: false });
            return null;
        }
    };

    showMenu = () => {
        const menuArray = [
            {
                menuLabel: "How to use ATM Cash-out?",
                menuParam: "MANAGE_PREFERRED_AMOUNT",
            },
        ];
        this.setState({ showMenu: true, menuArray });
    };

    closeMenu = () => {
        this.setState({ showMenu: false });
    };

    onTopMenuItemPress = (param) => {
        this.setState({ editMode: true, showMenu: false });
        this.closeMenu();
    };

    goBack = () => {
        const { route, navigation } = this.props;
        this.cancelWithdrawal(route?.params, navigation);
    };

    _onClickAmount = (action, amountObj) => {
        if (
            (!this.state.editMode &&
                amountObj !== "Other Amounts" &&
                amountObj !== "Add Preferred Amount") ||
            (action === "update" && this.props?.route?.params?.routeFrom === ATM_QR)
        ) {
            const modValue = Number(amountObj?.amount?.replace(/,/g, ""));
            if (modValue && modValue % 50 === 0 && modValue <= 1500) {
                if (this.props?.route?.params?.routeFrom === ATM_QR) {
                    this.props?.navigation?.navigate(ATM_CASHOUT_STACK, {
                        screen: ATM_WITHDRAW_CONFIRMATION,
                        params: {
                            ...this.props.route.params,
                            transferAmount: modValue,
                            isPreferred: action === "update" && amountObj?.amount ? true : false,
                            // routeFrom: ATM_QR
                            accountNo: amountObj?.accountNo,
                            selectedAccount: this.props.route.params?.selectedAccount ?? {
                                acctNo: amountObj?.accountNo,
                                number: amountObj?.accountNo,
                                acctName: amountObj?.accountName,
                            },
                            custName: this.state.custName,
                            preferredAmountList: this.props?.route?.params?.preferredAmountList,
                        },
                    });
                } else if (!this.state.editMode) {
                    this.props.navigation.navigate(QR_STACK, {
                        screen: "QrMain",
                        params: {
                            origin: this.props.route.params?.origin ?? ATM_PREFERRED_AMOUNT,
                            routeFrom:
                                this.props.route.params?.routeFrom === ATM_QR
                                    ? ATM_QR
                                    : PREFERRED_AMOUNT,
                            transferAmount: modValue,
                            isPreferred: true,
                            custName: this.state.custName,
                            amountObj,
                            selectedAccount: {
                                acctNo: amountObj?.accountNo,
                                number: amountObj?.accountNo,
                                acctName: amountObj?.accountName,
                            },
                            primary: true,
                            settings: false,
                            fromRoute: "",
                            fromStack: "",
                            data:
                                this.props.route.params?.originStack === BANKINGV2_MODULE
                                    ? this.props.route.params?.data
                                    : null,

                            currentList: this.state.preferredAmountList,
                        },
                    });
                }
            }
        } else {
            this.setState({ didPerformAddOrUpdate: false }, () => {
                this.props.navigation.navigate(ATM_CASHOUT_STACK, {
                    screen: ATM_AMOUNT_SCREEN,
                    params: {
                        ...this.props.route.params,
                        selectedAccount:
                            this.props.route.params?.selectedAccount &&
                            this.props.route.params?.originStack === BANKINGV2_MODULE
                                ? this.props.route.params?.selectedAccount
                                : null,
                        routeFrom:
                            action === "new" && this.props.route.params.routeFrom === ATM_QR
                                ? ATM_QR
                                : PREFERRED_AMOUNT,
                        action: amountObj === "Other Amounts" ? amountObj : action,
                        amountObj:
                            amountObj === "Add Preferred Amount" && this.props.route.params?.data
                                ? {
                                      accountName: this.props.route.params?.data?.acctName,
                                      accountNo: this.props.route.params?.data?.acctNo,
                                  }
                                : amountObj,
                        editMode: this.state.editMode,
                        currentList: this.state.preferredAmountList,
                        custName: this.state.custName,
                    },
                });
            });
        }
    };

    cancelWithdrawal = async (params, navigation) => {
        const { qrText, refNo, routeFrom } = params;
        if (routeFrom === ATM_QR && qrText && refNo) {
            try {
                await cancelOrTimeoutRequest({
                    qrtext: qrText,
                    refNo,
                    referenceNo: refNo,
                });
            } catch (e) {
                console.log("[PreferredAmount] >> cancelWithdrawal ex", e);
            }
        }

        if (this.state.editMode) {
            this.setState({ editMode: false });
        } else if (params?.originStack) {
            navigation.navigate(params?.originStack, {
                screen: params?.origin,
                params: {
                    ...params,
                    data: null,
                    qrtText: null,
                    refNo: null,
                },
            });
        } else {
            navigateToHomeDashboard(this.props.navigation, { refresh: true });
        }
    };

    _closeEditMode = () => {
        this.setState({ editMode: false });
        NavigationService.navigate("Dashboard", { screen: DASHBOARD });
    };

    render() {
        const {
            params: { is24HrCompleted, routeFrom },
        } = this.props.route;
        const { preferredAmountList, showMenu, menuArray, editMode, popupVisible, hasScannedQR } =
            this.state;

        return (
            <>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showLoaderModal={this.state.isLoading}
                >
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    !editMode ? <HeaderBackButton onPress={this.goBack} /> : null
                                }
                                headerCenterElement={
                                    <Typo
                                        text={editMode ? "Manage" : "ATM Cash-out"}
                                        fontWeight="600"
                                        fontSize={16}
                                        lineHeight={19}
                                    />
                                }
                                headerRightElement={
                                    !editMode ? (
                                        <HeaderCloseButton onPress={this._closeEditMode} />
                                    ) : (
                                        <HeaderDotDotDotButton onPress={this.showMenu} />
                                    )
                                }
                            />
                        }
                        paddingHorizontal={0}
                        paddingBottom={0}
                        paddingTop={0}
                        useSafeArea
                    >
                        {!is24HrCompleted && (
                            <View
                                style={styles.container}
                                contentContainerStyle={styles.contentContainer}
                            >
                                <View style={styles.layout}>
                                    <View style={styles.body}>
                                        <View style={styles.description}>
                                            <Typo
                                                fontSize={18}
                                                fontWeight="500"
                                                lineHeight={22}
                                                text={SET_UP_SUCCESSFUL_ATMCASHOUT}
                                                textAlign="left"
                                                style={styles.mt25}
                                            />
                                            <Typo
                                                fontSize={14}
                                                fontWeight="400"
                                                lineHeight={22}
                                                text={SET_UP_ATM_HOW_TO_PREFERRED}
                                                textAlign="left"
                                                style={styles.mt40}
                                            />
                                        </View>
                                        <>
                                            <TouchableOpacity
                                                activeOpacity={0.8}
                                                style={styles.addSteps}
                                            >
                                                <View>
                                                    <Typo
                                                        fontSize={16}
                                                        lineHeight={18}
                                                        fontWeight="600"
                                                        text={STEP1_ATMCASHOUT}
                                                        style={styles.steps}
                                                    />
                                                    <View style={styles.footerButtonTextContainer}>
                                                        <Typo
                                                            text={STEP1_ATMCASHOUT_DESC}
                                                            style={styles.stepsText}
                                                        />
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                activeOpacity={0.8}
                                                style={styles.addSteps}
                                            >
                                                <View>
                                                    <Typo
                                                        fontSize={16}
                                                        lineHeight={18}
                                                        fontWeight="600"
                                                        text={STEP2_ATMCASHOUT}
                                                        style={styles.steps}
                                                    />
                                                    <View style={styles.footerButtonTextContainer}>
                                                        <Typo
                                                            text={STEP2_ATMCASHOUT_DESC}
                                                            style={styles.stepsText}
                                                        />
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                            <View style={styles.text}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="400"
                                                    lineHeight={18}
                                                    text={TIPS_ATMCASHOUT}
                                                    textAlign="left"
                                                />
                                            </View>
                                        </>
                                    </View>
                                </View>
                            </View>
                        )}
                    </ScreenLayout>
                    {!editMode && (
                        <View
                            style={
                                editMode ||
                                (routeFrom !== ATM_QR && preferredAmountList?.length === 0)
                                    ? styles.mb20
                                    : styles.mb40
                            }
                        >
                            <Image
                                source={Images.atmCashOutBg}
                                resizeMode="stretch"
                                style={styles.bgImg}
                            />
                        </View>
                    )}
                </ScreenContainer>
                <TopMenu
                    showTopMenu={showMenu}
                    onClose={this.closeMenu}
                    navigation={this.props.navigation}
                    menuArray={menuArray}
                    onItemPress={this.onTopMenuItemPress}
                />
            </>
        );
    }
}

export default withModelContext(PreferredAmount);
