import { useFocusEffect } from "@react-navigation/native";
import moment from "moment";
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, ScrollView, Image } from "react-native";

import AutoDebitCard from "@screens/Wallet/requestToPay/AutoDebitCard";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import { StatusTextView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typography from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext, useModelController } from "@context";

import { rtpActionApi, rtpStatus, getCancelReasonList } from "@services";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import { YELLOW, BLACK, MEDIUM_GREY, DARK_GREY, GREEN } from "@constants/colors";
import * as Strings from "@constants/strings";

import {
    formateAccountNumber,
    formatMobileNumbersList,
    checks2UFlow,
    formatICNumber,
} from "@utils/dataModel/utility";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

import Assets from "@assets";

const menuArrayReceiverSolePropActive = [
    {
        menuLabel: Strings.SWITCH_LABEL,
        menuParam: Strings.SWITCH_PARAM,
    },
];

const menuArrayReceiverSolePropCancel = [
    {
        menuLabel: Strings.CANCEL_LABEL,
        menuParam: Strings.CANCEL_PARAM,
    },
];
function AutoBillingDetailsScreen({ navigation, route }) {
    const [item, setItem] = useState({});
    const [transferParams, setTransferParams] = useState({});
    const [status, setStatus] = useState("Pending");
    const [showMenu, setShowMenu] = useState(false);
    const [menu, setMenu] = useState([]);
    const [allowRefresh, setAllowRefresh] = useState(false);
    const [showFrequencyInfo, setShowFrequencyInfo] = useState(false);
    const [infoTitle, setInfoTitle] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
    const [showDotMenu, setShowDotMenu] = useState(true);
    const [cancelList, setCancelList] = useState([]);
    const [isConsentOnlineBanking, setIsConsentOnlineBanking] = useState(false);
    const [selectedAccName, setSelectedAccName] = useState("");
    const [selectedAccNum, setSelectedAccNum] = useState("");
    const [selectedAccNumber, setSelectedAccNumber] = useState("");
    const [consentFrequencyText, setConsentFrequencyText] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [popupValue, setPopupValue] = useState({
        showPopup: false,
        popupTitle: "",
        popupDesc: "",
        popupPrimaryAction: {
            text: "ok",
            onPress: () => {},
        },
        popupSecondaryAction: {
            text: "",
            onPress: () => {},
        },
        popupCloseAction: () => {},
    });
    const [idValue, setIdValue] = useState("");
    const [idValueFormatted, setIdValueFormatted] = useState("");
    const [idTypeText, setIdTypeText] = useState("");
    const [btnLabel, setBtnLabel] = useState("");
    const [actionFunc, setActionFunc] = useState(() => {});
    const [showBtn, setShowBtn] = useState(false);

    const { getModel, updateModel } = useModelController();
    const authenticationFlow = useRef();

    useEffect(() => {
        showLoader(true);
        RTPanalytics.detailScreenLoad(route.params?.item?.consentId);
        _getCancels();
        _updateDataInScreenAlways();

        getAllAccounts();
    }, []);
    useEffect(() => {
        return () => {
            // ComponentWillUnmount in Class Component
            authenticationFlow.current = {};
        };
    }, []);
    useFocusEffect(
        useCallback(() => {
            _updateDataInScreenAlways();
        }, [])
    );

    /***
     * _getCancels
     * Get list of Cancels/sub-Cancels from api
     */
    async function _getCancels() {
        try {
            const response = await getCancelReasonList();
            // array mapping
            const cancelListing = response?.data?.list.map((Cancel, index) => ({
                value: index,
                title: Cancel?.sub_service_name,
                oid: Cancel?.oid,
                subServiceCode: Cancel?.sub_service_code,
            }));
            setCancelList(cancelListing);
        } catch (error) {
            showErrorToast({
                message: error.message ?? Strings.UNABLE_FETCH_CANCEL_LIST,
            });
            goBack(true);
        }
    }

    /**
     *_updateDataInScreenAlways()
     * @memberof AutoBillingDetailsScreen
     */
    async function _updateDataInScreenAlways() {
        //rtpStatus api to extract user selected acc number
        const { merchantInquiry } = getModel("rpp");
        let merInqRes =
            route.params?.merchantDetails?.length > 0
                ? route.params?.merchantDetails?.length
                : merchantInquiry;
        if (!merInqRes) {
            const merchantInquiryRes = await rtpStatus();
            merInqRes = merchantInquiryRes?.data?.result;
        }

        const item = route.params?.item ?? {};

        // Flags related
        const flagOff = "0";
        const uFlag = route.params?.utilFlg;
        const utilFlagsCharge = uFlag?.filter(
            (code) => code?.serviceCode === Strings.SC_DN_CHARGE_CUSTOMER
        );
        const utilFlagsSwitch = uFlag?.filter((code) => code?.serviceCode === Strings.SC_DN_SWITCH);
        const utilFlagsCancel = uFlag?.filter((code) => code?.serviceCode === Strings.SC_DN_CANCEL);

        // if cancel and switched flag turned off
        const utilThreeDotsOff =
            utilFlagsSwitch?.[0]?.status === flagOff && utilFlagsCancel?.[0]?.status === flagOff;

        const todayDate = moment(new Date()).format("YYYY-MM-DD");

        let btnLabel = "";
        let showBtn = true;
        let showDotMenu = !utilThreeDotsOff;
        let actionFunc = goBack;

        const isChargeValid = todayDate >= item?.startDate;

        if (item.isSender) {
            switch (item.consentStatus) {
                case "ACTIVE":
                    btnLabel = "";
                    showBtn = false;
                    break;
                case "REJECT":
                case "REJECTED":
                case "CANCEL":
                case "CANCELLED":
                case "PAUSED":
                default:
                    showDotMenu = false;
                    showBtn = false;
                    break;
            }
        } else {
            // default for non sender
            switch (item.consentStatus) {
                case "CANCELLED":
                case "ACTIVE":
                case "REJECT":
                case "REJECTED":
                case "PAUSED":
                    btnLabel = "";
                    showBtn = false;
                    break;
                default:
                    showBtn = false;
                    break;
            }
        }
        if (item.isCustomer && item.consentStatus === "ACTIVE") {
            if (merInqRes?.status === "03" || utilFlagsCharge?.[0]?.status === "0") {
                showBtn = false;
                showDotMenu = false;
            } else {
                showBtn = isChargeValid;
                btnLabel = Strings.CHARGE_NOW;
                actionFunc = chargeNow;
            }
        }

        const flow = item.flow;

        const initalPopupValue = getInitalPopupValue();

        // formating proxyvalue
        const idValue = setRecipientAccOrProxy(item);
        const idTypeCode = item.isSender ? item.debtorAccountType : item.creditorAccountType;
        let idValueFormatted = idValue;

        let idTypeText;

        switch (idTypeCode) {
            case "MBNO":
                idTypeText = "Mobile Number";
                idValueFormatted = formatMobileNumbersList(idValue);
                break;
            case "NRIC":
            case "OLIC":
                idTypeText = "NRIC Number";
                idValueFormatted = formatICNumber(idValue);
                break;
            case "ACCT":
                idTypeText = "Account Number";
                idValueFormatted = idValue
                    .substring(0, idValue.length)
                    .replace(/[^\dA-Z]/g, "")
                    .replace(/(.{4})/g, "$1 ")
                    .trim();

                break;
            case "PSPT":
                idTypeText = "Passport Number";
                break;
            case "ARMN":
                idTypeText = "Army/Police ID";
                break;
            case "BREG":
                idTypeText = "Business Registration Number";
                break;
        }

        const { frequencyContext } = getModel("rpp");
        const freqObj = frequencyContext?.list?.find((el) => el.code === item.frequency);

        const consentFrequencyText = freqObj?.name ?? "";
        const menu = setMenuOptions();

        //online banking redirect detail screen
        const isConsentOnlineBanking =
            route?.params?.item?.funId === Strings.CONSENT_OB_REDIRECT_UPDATE ||
            route?.params?.item?.originalFunId === Strings.CONSENT_OB_REDIRECT_UPDATE;
        setConsentFrequencyText(consentFrequencyText);
        setItem(item);
        setTransferParams(item ?? {});
        setErrorMessage(Strings.AMOUNT_ERROR_RTP);
        setPopupValue(initalPopupValue);
        setStatus(item.status);
        authenticationFlow.current = flow;
        setIdValue(idValue);
        setIdValueFormatted(idValueFormatted);
        setIdTypeText(idTypeText);
        setMenu(menu);
        setBtnLabel(btnLabel);
        setShowDotMenu(showDotMenu);
        setShowBtn(showBtn);
        setSelectedAccNum(merInqRes?.accNo);
        setIsConsentOnlineBanking(isConsentOnlineBanking);
        showLoader(false);
        setActionFunc({ name: actionFunc });
    }

    function chargeNow() {
        RTPanalytics.selectChargeCust();
        const amount = route.params.item?.limitAmount
            ? Numeral(route.params.item?.limitAmount).format("0,0.00")
            : "50000.00";
        const { primaryAccount } = getModel("wallet");

        navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
            screen: navigationConstant.REQUEST_TO_PAY_AB_AMOUNT_SCREEN,
            params: {
                transferParams: {
                    ...route.params.item,
                    maxAmount: amount,
                    maxAmountError: `Charge amount exceeded limit per transaction. Please input value lower than RM ${amount}`,
                    primaryAccount: selectedAccNum,
                    creditorAccountObj: primaryAccount,
                    isChargeCustomer: true,
                    image: {
                        image: Strings.DUINTNOW_IMAGE,
                        imageName: Strings.DUINTNOW_IMAGE,
                        imageUrl: Strings.DUINTNOW_IMAGE,
                        shortName: "Test",
                        type: true,
                    },
                    imageBase64: true,
                },
            },
        });
    }

    function setMenuOptions() {
        const item = route.params?.item;
        const currentDate = new Date().getTime();
        const startDate = item?.startDate ? new Date(item?.startDate)?.getTime() : null;

        //  maintenance flags
        const flagOn = "1";
        const uFlag = route.params?.utilFlg;

        const switchFlag =
            uFlag?.findIndex(
                (el) => el?.serviceCode === Strings.SC_DN_SWITCH && el?.status === flagOn
            ) >= 0;
        const cancelFlag =
            uFlag?.findIndex(
                (el) => el?.serviceCode === Strings.SC_DN_CANCEL && el?.status === flagOn
            ) >= 0;

        let hideSwitch = [];

        if (!switchFlag) {
            hideSwitch = menuArrayReceiverSolePropActive.filter((item) => {
                return item?.menuParam !== Strings.SWITCH_PARAM;
            });
        }
        return item?.canTerminateByDebtor === "false"
            ? []
            : item?.isMyBills === true && item?.consentStatus === "ACTIVE"
            ? currentDate >= startDate // if currentDate is more than startDate
                ? item?.canTerminateByDebtor === "true" && cancelFlag && switchFlag // all flags turned on
                    ? [...menuArrayReceiverSolePropCancel, ...menuArrayReceiverSolePropActive]
                    : cancelFlag
                    ? [...menuArrayReceiverSolePropCancel]
                    : cancelFlag && !switchFlag // only switch flag turned off
                    ? [...menuArrayReceiverSolePropCancel, ...hideSwitch]
                    : !cancelFlag
                    ? []
                    : !cancelFlag && !switchFlag // cancel flag and switch turned off
                    ? [...hideSwitch]
                    : menuArrayReceiverSolePropActive // only cancel flag turned off
                : item?.canTerminateByDebtor === "true" && cancelFlag // if currentDate is less than startDate
                ? menuArrayReceiverSolePropCancel
                : []
            : item?.isCustomer === true && item?.canTerminateByDebtor === "true"
            ? menuArrayReceiverSolePropCancel
            : [];
    }

    function setRecipientAccOrProxy(rtpRequestInfo) {
        if (rtpRequestInfo?.isSender) {
            return rtpRequestInfo?.consentStatus === Strings.PENDING_FORWARDED
                ? rtpRequestInfo?.creditorAccountNumber
                : rtpRequestInfo?.debtorAccountNumber;
        }
        return rtpRequestInfo?.senderProxyValue;
    }

    function resetPopup() {
        const initalPopupValue = getInitalPopupValue();
        setPopupValue(initalPopupValue);
    }

    function getInitalPopupValue() {
        return {
            showPopup: false,
            popupTitle: "",
            popupDesc: "",
            popupPrimaryAction: {},
            popupSecondaryAction: {},
            popupCloseAction: resetPopup,
        };
    }

    function setRejectPopup() {
        const popupPrimaryAction = {
            text: "Confirm",
            onPress: rejectPopupPrimaryAction,
        };

        const popupSecondaryAction = {
            text: "Cancel",
            onPress: rejectPopupSecondaryAction,
        };

        setPopupValue({
            showPopup: true,
            popupTitle: Strings.REJECT_REQUEST,
            popupDesc: Strings.REJECT_INCOMING_REQUEST_DESC,
            popupPrimaryAction,
            popupSecondaryAction,
        });
    }

    function rejectPopupPrimaryAction() {
        const initalPopupValue = getInitalPopupValue();
        setPopupValue({ initalPopupValue });
        callBillingAction({ requestType: "REJECT" });
        RTPanalytics.screenLoadRejectPopupDNR();
    }

    function rejectPopupSecondaryAction() {
        resetPopup();
    }

    function _onBackPress() {
        goBack(allowRefresh);
    }

    function goBack(isRefresh = false) {
        navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
            screen: navigationConstant.AUTOBILLING_DASHBOARD,
            params: { updateScreenData: isRefresh },
        });
    }

    async function setCancelAutoDebit(isRefresh = false) {
        const selectedAccountName = selectedAccName;
        const selectedAccountNumber = formateAccountNumber(selectedAccNumber, 12);
        const checkFlow = 73;
        const params = getTransferParams(transferParams);
        const { flow, secure2uValidateData } = await checks2UFlow(checkFlow, getModel);
        authenticationFlow.current = flow;
        if (flow === "S2UReg") {
            navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                screen: Strings.ACTIVATE,
                params: {
                    flowParams: {
                        success: {
                            stack: navigationConstant.AUTOBILLING_STACK,
                            screen: navigationConstant.AUTOBILLING_CANCEL_AUTODEBIT,
                        },
                        fail: {
                            stack: navigationConstant.AUTOBILLING_STACK,
                            screen: navigationConstant.AUTOBILLING_DASHBOARD,
                        },

                        params: {
                            transferParams: {
                                ...item,
                                ...params,
                                selectedAccountName,
                                selectedAccountNumber,
                                isCancel: true,
                            },
                            updateScreenData: isRefresh,
                            cancelFlow: "S2U",
                            secure2uValidateData,
                            isFromS2uReg: true,
                        },
                    },
                },
            });
        } else {
            navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                screen: navigationConstant.AUTOBILLING_CANCEL_AUTODEBIT,
                params: {
                    transferParams: {
                        ...item,
                        ...transferParams,
                        selectedAccountName,
                        selectedAccountNumber,
                        isCancel: true,
                    },
                    updateScreenData: isRefresh,
                    cancelFlow: flow,
                    secure2uValidateData,
                },
            });
        }
    }

    function showLoader(visible) {
        updateModel({
            ui: {
                showLoader: visible,
                showLoaderModal: visible,
            },
        });
    }

    /***
     * getAllAccounts
     * get the user accounts and filter from and To accounts
     * if from account not there set primary account as from account
     */
    function getAllAccounts() {
        const { primaryAccount } = getModel("wallet");
        setSelectedAccName(primaryAccount?.name);
        setSelectedAccNumber(primaryAccount?.number);
    }

    function _onMorePress() {
        setShowMenu(true);
    }

    function _onHideMorePress() {
        setShowMenu(false);
    }

    function handleItemPress(param) {
        setShowMenu(false);
        if (param === Strings.REJECT_PARAM) {
            setRejectPopup();
        }
        if (param === Strings.CANCEL_PARAM) {
            setCancelAutoDebit();
            RTPanalytics.selectABCancelPopup();
        }

        if (param === Strings.SWITCH_PARAM) {
            RTPanalytics.selectABSwitchPopup();

            navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                screen: navigationConstant.SWITCH_ACCOUNT_SCREEN,
                params: {
                    getModel,
                    transferParams: route.params?.transferParams,
                    item: route?.params?.item,
                },
            });
        }
    }

    async function callBillingAction(addtionalParam) {
        try {
            const params = { ...transferParams };
            const response = await rtpActionApi(params);
            if (response?.data?.code === 200) {
                setAllowRefresh(true);
                const respMesageList = {
                    REJECT: Strings.DUITNOW_AD_REJECTED,
                    SUCCESS: "Success",
                };
                showSuccessToast({
                    message: respMesageList[addtionalParam?.requestType ?? "SUCCESS"],
                });
                goBack(true);
            } else {
                showErrorToast({ message: response?.data?.result?.statusDescription });
            }
        } catch (err) {
            showErrorToast({ message: err?.error?.error?.message ?? Strings.COMMON_ERROR_MSG });
        }
    }

    function goToConfirmPage() {
        const { item } = route?.params || {};

        const idValue = item.receiverProxyValue;
        const idCode = item.receiverProxyType;

        const params = getTransferParams(transferParams);
        params.idValue = idValue;
        params.idType = idCode;
        params.idCode = idCode;
        params.amount = item.amount;
        params.formattedAmount = item.formattedAmount;
        params.receiverAcct = item.receiverAcct;
        params.swiftCode = item.swiftCode;
        params.receiverName = item.receiverName;
        params.requestId = item.requestId;
        params.payeeName = item.receiverName;
        params.paymentDesc = item.paymentDesc;
        params.firstPartyPayeeIndicator = item?.firstPartyPayeeIndicator;
        params.payerName = item?.senderName;

        const nextParam = {
            transferParams: params,
            soleProp: "",
            rtpType: "",
            senderBrn: "",
            isRtdEnabled: "",
        };
        if (authenticationFlow.current === "S2UReg") {
            navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                screen: Strings.ACTIVATE,
                params: {
                    flowParams: {
                        success: {
                            stack: navigationConstant.AUTOBILLING_STACK,
                            screen: navigationConstant.AUTOBILLING_CONFIRMATION,
                        },
                        fail: {
                            stack: navigationConstant.AUTOBILLING_STACK,
                            screen: navigationConstant.AUTOBILLING_DASHBOARD,
                        },

                        params: { ...nextParam, isFromS2uReg: true },
                    },
                },
            });
        } else {
            navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                screen: navigationConstant.AUTOBILLING_CONFIRMATION,
                params: { ...nextParam },
            });
        }
    }

    function getTransferParams(resultData) {
        const { item } = route.params || {};
        const funId = route?.params?.item?.originalData?.funId;

        return {
            ...item,
            consentFrequencyText,
            transferFlow:
                funId === Strings.CONSENT_APPROVAL
                    ? 30
                    : funId === Strings.CONSENT_APPROVE_CREDITOR
                    ? 31
                    : funId === Strings.CONSENT_UPDATE_SPR
                    ? 34
                    : 27,
            isMaybankTransfer: false,
            transferOtherBank: !resultData.maybank,
            image: {
                image: Strings.DUINTNOW_IMAGE,
                imageName: Strings.DUINTNOW_IMAGE,
                imageUrl: Strings.DUINTNOW_IMAGE,
                shortName: resultData.accHolderName,
                type: true,
            },
            imageBase64: true,
            reference: item.reference,
            minAmount: 0.0,
            maxAmount: 50000.0,
            amountError: Strings.AMOUNT_ERROR_RTP,
            screenLabel: Strings.ENTER_AMOUNT,
            screenTitle: Strings.REQUEST_TO_PAY,
            receiptTitle: item.refundIndicator ? Strings.RTP_REFUND : Strings.REQUEST_TO_PAY,
            isFutureTransfer: false,
            formattedFromAccount: "",
            transferType: "RTP_TRANSFER",
            endDateInt: 0,
            startDateInt: 0,
            transferFav: false,
            accHolderName: item.receiverName,
            idValue,
            idValueFormatted,
            idTypeText,
            fromAccount:
                item?.fromAccount?.length > 12 ? item?.fromAccount.slice(0, 12) : item?.fromAccount,
            serviceFee: item?.paymentMode?.serviceFee ?? undefined,
            amountEditable: item?.amountEditable,
            requestedAmount: item?.requestedAmount,
            firstPartyPayeeIndicator: item?.firstPartyPayeeIndicator,
        };
    }

    function handleInfoPress(type) {
        const infoTitle =
            type === Strings.FREQUENCY ? Strings.FREQUENCY_TRN : Strings.LIMIT_PER_TRANSACTION;
        const infoMessage =
            type === Strings.FREQUENCY
                ? Strings.FREQUENCY_DETAILS_DEBTOR
                : Strings.LIMIT_DETAILS_DEBTOR;
        setShowFrequencyInfo(!showFrequencyInfo);
        setInfoMessage(infoMessage);
        setInfoTitle(infoTitle);
    }

    const getCancelReason = (value) => {
        const filteredItem = cancelList?.filter((item) => item?.subServiceCode === value);
        return filteredItem[0]?.title;
    };

    const auDebitParams = {
        autoDebitEnabled: true,
        showProductInfo: true,
        showTooltip: false,
        transferParams: {
            reference: item?.ref1,
            consentStartDate: item?.startDate,
            consentExpiryDate: item?.expiryDate,
            consentMaxLimit: item?.limitAmount,
            consentId: item?.consentId,
            consentFrequencyText,
            productInfo: {
                productName: item?.productName,
            },
            hideProduct: !!isConsentOnlineBanking,
        },
        transferFlow: 26,
        handleInfoPress,
    };

    const requestedOn =
        ((item?.isCustomer &&
            (item.isPastTab || item.status === "Paused" || item.status === "Ended")) ||
            item?.isMyBills ||
            item.status === "Active" ||
            item.status === "Pending") &&
        item?.trxDate;
    const showReference = item?.ref1?.replace(/ /g, "");
    const showPaymentDetails =
        item?.ref2?.replace(/ /g, "") && item?.ref2 !== "N/A" && item?.ref2 !== "NA";
    const showExpiryDate =
        item?.isMyBills &&
        (item.status === "Outgoing" || item.status === "Expired") &&
        item?.shortExpiryDate;
    const showLastPaid =
        item.isMyBills &&
        (item.status === "Outgoing" ||
            item.status === "Active" ||
            item.status === "Paused" ||
            item.status === "Cancelled" ||
            item.status === "Ended");
    const showLastCharge = item.isCustomer;
    const showCancelled = item?.cancelReason && item.status === "Cancelled";
    const dotArray = ["Expired", "Cancelled"];
    const title = !item?.isMyBills ? item?.debtorName : item?.merchantName;
    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                errorMessage={errorMessage}
                showOverlay={false}
                backgroundColor={MEDIUM_GREY}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typography
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={item?.isCustomer ? "My Customers" : "My Bills"}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={_onBackPress} />}
                            headerRightElement={
                                menu?.length > 0 &&
                                !dotArray.includes(item?.status) &&
                                showDotMenu ? (
                                    <HeaderDotDotDotButton onPress={_onMorePress} />
                                ) : null
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    useSafeArea
                >
                    <ScrollView>
                        <View style={Styles.blockInner}>
                            <View style={Styles.cardSmallContainerColumnCenter}>
                                <View style={Styles.descriptionContainerCenter}>
                                    <Typography
                                        fontSize={20}
                                        fontWeight="300"
                                        fontStyle="normal"
                                        lineHeight={28}
                                        text={item?.detailHeader}
                                    />
                                </View>

                                <View style={Styles.logoView}>
                                    <TransferImageAndDetails
                                        title={title}
                                        image={{
                                            type: "local",
                                            source: Assets.icDuitNowCircle,
                                        }}
                                        isVertical
                                    />
                                </View>
                            </View>

                            <View style={Styles.cardSmallContainerColumnCenter3}>
                                <View style={Styles.statusCenter}>
                                    <StatusTextView
                                        status={status}
                                        style={
                                            status === Strings.APPROVED_STATUS
                                                ? StylesLocal.statusApprovedStyle
                                                : status === Strings.SB_PAYSTATUS_EXPD
                                                ? StylesLocal.statusExpiredStyle
                                                : null
                                        }
                                    />
                                    <Image
                                        source={Assets.recurring}
                                        resizeMode="contain"
                                        style={StylesLocal.recurringImage}
                                    />
                                </View>
                            </View>

                            <View style={Styles.lineConfirm2} />

                            {requestedOn ? (
                                <View style={Styles.viewRow2}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            textAlign="left"
                                            text={Strings.REQUESTED_ON}
                                        />
                                    </View>
                                    <View style={Styles.viewRowRightItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="right"
                                            text={item.trxDate}
                                        />
                                    </View>
                                </View>
                            ) : null}
                            {showReference ? (
                                <View style={Styles.viewRow2}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            textAlign="left"
                                            text={Strings.RECIPIENT_REFERENCE}
                                        />
                                    </View>
                                    <View
                                        style={
                                            route.params?.item?.ref1.length > 20
                                                ? Styles.viewRowRightItemWrap
                                                : Styles.viewRowRightItem
                                        }
                                    >
                                        <Typography
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="right"
                                            text={item.ref1}
                                        />
                                    </View>
                                </View>
                            ) : null}

                            {showPaymentDetails ? (
                                <View style={Styles.viewRow2}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            textAlign="left"
                                            text={Strings.PAYMENT_DETAILS}
                                        />
                                    </View>
                                    <View style={Styles.viewRowRightItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="right"
                                            color={BLACK}
                                            text={item?.ref2}
                                        />
                                    </View>
                                </View>
                            ) : null}
                            {showExpiryDate ? (
                                <View style={Styles.viewRow2}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            textAlign="left"
                                            text={Strings.REQUEST_EXPIRY_DATE}
                                        />
                                    </View>
                                    <View style={Styles.viewRowRightItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="right"
                                            text={item.shortExpiryDate}
                                        />
                                    </View>
                                </View>
                            ) : null}
                            {showLastPaid ? (
                                <View style={Styles.viewRow2}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            textAlign="left"
                                            text="Last paid"
                                        />
                                    </View>
                                    <View style={Styles.viewRowRightItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="right"
                                            color={BLACK}
                                            text={
                                                item.lastPaidDateTime?.length > 2
                                                    ? moment(item.lastPaidDateTime).format(
                                                          Strings.DATE_TIME_FORMAT_DISPLAY2
                                                      )
                                                    : "-"
                                            }
                                        />
                                    </View>
                                </View>
                            ) : null}

                            {showLastCharge ? (
                                <View style={Styles.viewRow2}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            textAlign="left"
                                            text="Last Charged"
                                        />
                                    </View>
                                    <View style={Styles.viewRowRightItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="right"
                                            color={BLACK}
                                            text={
                                                item.lastChargeDateTime
                                                    ? moment(item.lastChargeDateTime).format(
                                                          Strings.DATE_TIME_FORMAT_DISPLAY2
                                                      )
                                                    : "-"
                                            }
                                        />
                                    </View>
                                </View>
                            ) : null}
                            {showCancelled ? (
                                <View style={Styles.viewRow2}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            textAlign="left"
                                            text="Reason to cancel"
                                        />
                                    </View>
                                    <View style={Styles.viewRowRightItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="right"
                                            color={BLACK}
                                            text={getCancelReason(item?.cancelReason)}
                                        />
                                    </View>
                                </View>
                            ) : null}

                            <View style={Styles.mb20}>
                                <View style={Styles.viewRow3}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            textAlign="left"
                                            text="DuitNow AutoDebit Details"
                                        />
                                    </View>
                                </View>
                                <AutoDebitCard {...auDebitParams} />
                            </View>
                        </View>
                    </ScrollView>
                </ScreenLayout>
                <View style={Styles.footerButton}>
                    {showBtn && (
                        <ActionButton
                            fullWidth
                            borderRadius={25}
                            onPress={actionFunc?.name}
                            backgroundColor={YELLOW}
                            componentCenter={
                                <Typography
                                    color={BLACK}
                                    text={btnLabel}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                    )}
                </View>
                <Popup
                    visible={popupValue?.showPopup}
                    onClose={popupValue?.popupCloseAction}
                    title={popupValue?.popupTitle}
                    description={popupValue?.popupDesc}
                    primaryAction={popupValue?.popupPrimaryAction}
                    secondaryAction={popupValue?.popupSecondaryAction}
                />
            </ScreenContainer>
            <TopMenu
                showTopMenu={showMenu}
                onClose={_onHideMorePress}
                navigation={navigation}
                menuArray={menu}
                onItemPress={handleItemPress}
            />
            <Popup
                visible={showFrequencyInfo}
                title={infoTitle}
                description={infoMessage}
                onClose={handleInfoPress}
            />
        </React.Fragment>
    );
}

const StylesLocal = {
    logo: {
        height: 64,
        width: 64,
    },
    startedBy: { width: "55%" },
    textWrap: { flexDirection: "row", flexWrap: "wrap" },
    recurringImage: {
        height: 20,
        marginRight: 8,
        marginLeft: 8,
        width: 20,
    },
    statusApprovedStyle: {
        backgroundColor: GREEN,
    },
    statusExpiredStyle: {
        backgroundColor: DARK_GREY,
    },
};

AutoBillingDetailsScreen.propTypes = {
    getModel: PropTypes.func,
    resetModel: PropTypes.func,
    route: PropTypes.object,
    navigation: PropTypes.object,
    updateModel: PropTypes.func,
};

export default withModelContext(AutoBillingDetailsScreen);
