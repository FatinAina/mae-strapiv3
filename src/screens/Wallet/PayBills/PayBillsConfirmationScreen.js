import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, TouchableOpacity, TextInput, Dimensions } from "react-native";
import DeviceInfo from "react-native-device-info";

import * as navigationConstant from "@navigation/navigationConstant";

import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";
import TransferDetailLabel from "@components/Transfers/TransferConfirmationDetailLabel";
import TransferDetailValue from "@components/Transfers/TransferConfirmationDetailValue";
import TransferConfirmation from "@components/Transfers/TransferConfirmationScreenTemplate";
import TransferDetailLayout from "@components/Transfers/TransferDetailLayout";

import { withModelContext } from "@context";

import {
    bankingGetDataMayaM2u,
    lhdnServiceCall,
    lhdnTacCall,
    payBill,
    payBillInquiry,
} from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, DARK_GREY, GREY, ROYAL_BLUE } from "@constants/colors";
import { getDateRangeDefaultData } from "@constants/datePickerDefaultData";
import { PAYMENTS_ONE_OFF } from "@constants/dateScenarios";
import * as FundConstants from "@constants/fundConstants";
import {
    ADD_DETAILS,
    COMMON_ERROR_MSG,
    CONFIRMATION,
    DATE,
    DD_MMM_YYYY,
    DONATE_NOW,
    FAILED,
    FAILED_REGISTER_S2U_PLEASE_USE_TAC,
    FA_FIELD_INFORMATION,
    FA_FORM_PROCEED,
    FA_PAY_BILLERS_REVIEW_PAYMENT_DETAILS,
    FA_PAY_ZAKAT_REVIEW_PAYMENT_DETAILS,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FROM,
    NOTES1,
    PAY_BILLS,
    PAY_NOW,
    SERVICE_FEES,
    SUCCESSFUL_STATUS,
    SUCC_STATUS,
    TO,
    ZAKAT_TYPE,
    LHDN_PAYEE_CODE,
    PAY_TO,
    PAY_FROM,
    DATE_AND_TIME,
    TRANSACTION_TYPE,
    AUTHORISATION_WAS_REJECTED,
    AUTHORISATION_FAILED,
    WRONG_TAC_ENTERED,
    LBL_BUSINESS_REG_NO,
    S2U_RETRY_AFTER_SOMETIME,
    PAYMENT_UNSUCCESSFUL,
    LHDN_CONTACT_ERROR,
    TRANSACTION_UNSUCCESS,
    FLEX_START,
    LHDN_PAYMENT,
    TRX_BILLPAYMENT,
} from "@constants/strings";
import { PAY_BILL_API, ZAKAT_PAY_BILL_API } from "@constants/url";

import * as DataModel from "@utils/dataModel";
import {
    checks2UFlow,
    getDeviceRSAInformation,
    maskCard,
    getFormatedAccountNumber,
    addSpaceAfter4Chars,
    formateAccountNumber,
    formateReferenceNumber,
} from "@utils/dataModel/utility";
import { navigateToHomeDashboard } from "@utils/dataModel/utilityDashboard";
import { getDateRange, getStartDate, getEndDate, getDefaultDate } from "@utils/dateRange";
import { secure2uCheckEligibility } from "@utils/secure2uCheckEligibility";

import Assets from "@assets";

export const { width, height } = Dimensions.get("window");
// ===========
// VAR
// ===========
// this value as a flag user is editing startDate or endDate, there is a logic to handle after user click done on calendar
let confirmDateEditFlow = 0;
const todayDateCode = "00000000";

class PayBillsConfirmationScreen extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.object,
        resetModel: PropTypes.func,
        route: PropTypes.object,
        updateModel: PropTypes.func,
    };

    constructor(props) {
        console.log("PayBillsConfirmationScreen :::", props.route.params);

        super(props);

        this.prevSelectedAccount = props.route.params.prevSelectedAccount;
        this.fromModule = props.route.params?.fromModule;
        this.fromScreen = props.route.params?.fromScreen;
        const { billerInfo } = props.route.params || {};

        const billRef2Required = billerInfo?.billRef2Required === "1";
        const requiredFields = props.route.params?.requiredFields ?? [];
        const isDoneDisabled =
            billRef2Required && requiredFields.length > 1 && requiredFields[1]?.fieldValue === "";

        // if (billRef2Required && requiredFields.length > 1 && requiredFields[1]?.fieldValue === "") {
        //     isDoneDisabled = true;
        // }

        this.state = {
            disabled: false,
            notesText: "",
            amount: props.route.params?.amount,
            flow: props.route.params.auth === "fail" ? "TAC" : props.route.params.flow,
            accounts: [],
            title: billerInfo?.fullName ? billerInfo?.fullName : billerInfo?.shortName,
            subTitle: billerInfo?.subName ?? requiredFields?.[0].fieldValue ?? "",
            logoImage: billerInfo?.imageUrl,
            displayDate: "Today",
            showTransferDateView: false,
            selectedAccount: null,
            select: { start: 0, end: 0 },
            showDatePicker: false,
            showScrollPickerView: false,
            selectedIndex: 0, // scrollViewSelectedIndex
            dateRangeStart: new Date(),
            dateRangeEnd: new Date(),
            defaultSelectedDate: new Date(),
            selectedStartDate: new Date(),
            formatedStartDate: "", // toshowonscreen
            formatedEndDate: "", // toshowonscreen
            effectiveDate: todayDateCode, // to use in api call
            requiredFields,
            billRef2Required,

            // RSA State Objects
            isRSARequired: false,
            challengeQuestion: "",
            isRSALoader: true,
            RSACount: 0,
            RSAError: false,
            secure2uValidateData: props.route.params?.secure2uValidateData,
            transferAmount: props.route.params?.amount,
            image: Assets.icMaybankAccount,
            screenData: {
                image: Assets.icMaybankAccount,
                name: "",
                description1: "",
                description2: "",
            },
            transferParams: {},
            bankName: "",
            tacParams: null,
            transferAPIParams: null,
            isShowS2u: false,
            transactionResponseObject: null, // to pass to s2uAuth modal
            s2uExtraParams: {
                metadata: {
                    txnType: "PAY_BILL",
                    donation: props.route.params?.donationFlow ?? false,
                },
            },
            isDoneDisabled,
            isFav: props.route.params?.isFav ?? false,
            // Donation related
            donationFlow: props.route.params?.donationFlow ?? false,
            // Zakat Related
            zakatFlow: props.route.params?.zakatFlow ?? false,
            zakatFitrahFlow: props.route.params?.zakatFitrahFlow ?? false,
            zakatType: "",
            serviceFee: "",
            riceType: "",
            numOfPeople: "",
            radioBtnText: false,
            zakatRadioBtn: true,
            ref2Val: "",
            isLoading: false,
            validDateRangeData: getDateRangeDefaultData(PAYMENTS_ONE_OFF),
            s2uCheck: false,
            serverDate: "",
            refNo: "",
        };
    }

    componentDidMount() {
        console.log("[PayBillsConfirmationScreen] >> [componentDidMount]");
        this._getDatePickerData();
        const zakatFlow = this.props.route.params?.zakatFlow ?? false;
        logEvent(
            FA_VIEW_SCREEN,
            zakatFlow
                ? {
                      [FA_SCREEN_NAME]: FA_PAY_ZAKAT_REVIEW_PAYMENT_DETAILS,
                  }
                : { [FA_SCREEN_NAME]: FA_PAY_BILLERS_REVIEW_PAYMENT_DETAILS }
        );

        this.updateDataInScreenAlways();
        this.getAccountsList();
        const s2uCheck = secure2uCheckEligibility(
            this.state.amount,
            this.state.secure2uValidateData
        );
        this.setState({ s2uCheck });
    }

    _getDatePickerData() {
        getDateRange(PAYMENTS_ONE_OFF).then((data) => {
            this.setState({
                validDateRangeData: data,
                defaultSelectedDate: getDefaultDate(data),
            });
        });
    }

    updateDataInScreenAlways = () => {
        console.log("[PayBillsConfirmationScreen] >> [updateDataInScreenAlways]");

        const params = this.props?.route?.params ?? {};
        const zakatFlow = params?.zakatFlow ?? false;
        const { secure2uValidateData, action_flow, flow } = params?.isFromS2uReg
            ? this.verifyS2uStatus()
            : params;

        const transferParams = params?.transferParams ?? this.state.screenData;

        console.log("PayBillsConfirmationScreen transferParams : ", transferParams);
        console.log("updateData ==> ", transferParams);
        const screenData = {
            image: transferParams?.image,
            name: transferParams?.formattedToAccount,
            description1: transferParams?.accountName,
            description2: transferParams?.bankName,
        };

        this.setState({
            bankName: transferParams?.bankName,
            image: Assets.icMaybankAccount,
            transferParams,
            screenData,
            flow: flow || action_flow,
            secure2uValidateData,
        });

        if (zakatFlow) {
            this.initZakatData();
        }
    };

    verifyS2uStatus = async () => {
        const { action_flow, secure2uValidateData } = await checks2UFlow(
            17,
            this.props.getModel,
            this.props.updateModel,
            TRX_BILLPAYMENT
        );

        return { action_flow, secure2uValidateData };
    };

    initZakatData = () => {
        console.log("[PayBillsConfirmationScreen] >> [initZakatData]");

        const params = this.props?.route?.params ?? {};
        const zakatFitrahFlow = params?.zakatFitrahFlow ?? false;

        const { isTapTasticReady } = this.props.getModel("misc");
        this.setState({
            zakatType: params?.zakatType ?? "",
            serviceFee: "RM 0.00",
            riceType: params?.riceType ?? "",
            numOfPeople: params?.payingForNum,
            subTitle: params?.formattedMobileNumber ?? "",
            radioBtnText: params?.radioBtnText ?? false,
            s2uExtraParams: {
                metadata: {
                    txnType: zakatFitrahFlow ? "ZAKAT_FITRAH" : "ZAKAT",
                },
                txnType: isTapTasticReady ? "M2UZAKAT" : "",
            },
        });
    };

    onZakatRadioTap = () => {
        console.log("[PayBillsConfirmationScreen] >> [onZakatRadioTap]");

        const { zakatRadioBtn } = this.state;

        this.setState({ zakatRadioBtn: !zakatRadioBtn, isDoneDisabled: zakatRadioBtn });
    };

    showLoader = (visible) => {
        this.props.updateModel({
            ui: {
                showLoader: visible,
            },
        });
    };

    // -----------------------
    // API CALL
    // -----------------------
    getAccountsList = () => {
        console.log("[PayBillsConfirmationScreen] >> [getAccountsList]");

        const subUrl = "/summary";
        const params = "?type=A";

        this.newAccountList = [];

        bankingGetDataMayaM2u(subUrl + params, false)
            .then((response) => {
                this.showLoader(false);
                const result = response.data.result;

                if (result) {
                    this.newAccountList = [...this.newAccountList, ...result.accountListings];
                }

                if (
                    this.props.route.params.billerInfo.creditCardPayment === "0" ||
                    this.prevSelectedAccount?.accountType === "card"
                ) {
                    this.getCardsList();
                } else {
                    this.doPreSelectAccount();
                }
            })
            .catch((error) => {
                this.showLoader(false);
                this.doPreSelectAccount();
                console.log("getAccountsList:error", error);
            });
    };

    getCardsList = () => {
        console.log("[PayBillsConfirmationScreen] >> [getCardsList]");

        const subUrl = "/summary";
        const params = "?type=C";

        // this.showLoader(true);
        bankingGetDataMayaM2u(subUrl + params, false)
            .then((response) => {
                this.showLoader(false);
                const result = response.data.result;
                if (result) {
                    this.newAccountList = [...this.newAccountList, ...result.accountListings];
                }

                this.doPreSelectAccount();
            })
            .catch((error) => {
                this.showLoader(false);
                console.log("getCardsList:error", error);
                this.doPreSelectAccount();
            });
    };

    doPreSelectAccount = () => {
        console.log("[PayBillsConfirmationScreen] >> [doPreSelectAccount]");

        let propsToCompare = "acctNo";
        let selectedAccount;
        let selectedIndex = null;

        if (this.prevSelectedAccount && this.prevSelectedAccount.accountType === "card") {
            propsToCompare = "cardNo";
        }

        if (this.prevSelectedAccount) {
            selectedAccount = this.newAccountList.find((item, i) => {
                const isFind = item.number === this.prevSelectedAccount[propsToCompare];
                if (isFind) {
                    selectedIndex = i;
                }
                return isFind;
            });
        } else {
            selectedAccount = this.newAccountList.find((item, i) => {
                if (item.primary) {
                    selectedIndex = i;
                }
                return item.primary;
            });
        }

        if (!selectedAccount && this.newAccountList.length > 0) {
            selectedAccount = this.newAccountList[0];
            selectedIndex = 0;
        }

        if (selectedAccount) {
            const temp = this.newAccountList[selectedIndex];
            this.newAccountList.splice(selectedIndex, 1);
            this.newAccountList.unshift(temp);
            selectedAccount.selected = true;
        }

        if (this.props.route.params.auth === "fail") {
            showErrorToast({ message: FAILED_REGISTER_S2U_PLEASE_USE_TAC });
        }

        this.setState({ accounts: this.newAccountList, selectedAccount });
    };

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onBackPress = () => {
        console.log("[PayBillsConfirmationScreen] >> [onBackPress]");

        const { zakatFlow, zakatFitrahFlow, isFav } = this.state;
        if (!isFav && zakatFlow && zakatFitrahFlow) {
            this.props.navigation.navigate(navigationConstant.PAYBILLS_MODULE, {
                screen: navigationConstant.ZAKAT_MOBILE_NUMBER,
                params: {
                    ...this.props.route.params,
                },
            });
        } else {
            this.props.navigation.goBack();
        }
    };

    onClosePress = () => {
        console.log("[PayBillsConfirmationScreen] >> [onClosePress]");
        const { donationFlow } = this.state;

        if (this.prevSelectedAccount) {
            this.props.navigation.navigate(this.fromModule, {
                screen: this.fromScreen,
                params: {
                    prevData: this.prevSelectedAccount,
                    // onGoBack: this._refresh
                },
            });
        } else {
            navigateToHomeDashboard(this.props.navigation, {
                refresh: donationFlow,
            });
        }
    };

    // scrollPicker event
    scrollPickerDonePress = (value, index) => {
        console.log("[PayBillsConfirmationScreen] >> [scrollPickerDonePress]");

        const selected = value.const;
        if (selected === "ONE_OFF_TRANSFER") {
            this.setState({
                showScrollPickerView: false,
                showTransferDateView: false,
                selectedIndex: index,
                formatedStartDate: "",
                formatedEndDate: "",
            });
        } else if (selected === "RECURRING") {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const startDate = DataModel.getFormatedTodaysMoments("DD MMM YYYY");
            const endDate = DataModel.getFormatedDateMoments(tomorrow, "DD MMM YYYY");
            this.setState({
                showScrollPickerView: false,
                showTransferDateView: true,
                selectedIndex: index,
                formatedStartDate: startDate,
                formatedEndDate: endDate,
            });
        }
    };

    scrollPickerCancelPress = () => {
        console.log("[PayBillsConfirmationScreen] >> [scrollPickerCancelPress]");

        this.setState({
            showScrollPickerView: false,
        });
    };

    // Calendar Event
    onDateDonePress = (date) => {
        console.log("[PayBillsConfirmationScreen] >> [onDateDonePress]");

        // TODO: need to understand this!!!
        console.log("  [onDateDonePress] ", date);
        let formatedDate = DataModel.getFormatedDateMoments(date, "DD MMM YYYY");
        // console.log("  [formatedDate] ", formatedDate);
        const today = new Date();
        let nextDay = new Date();
        let effectiveDate = todayDateCode;

        const month =
            date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
        const days = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
        const year = date.getFullYear().toString();

        const todayInt = year + month + days;

        if (
            DataModel.getFormatedDateMoments(today, "DD MMM YYYY") ===
            DataModel.getFormatedDateMoments(date, "DD MMM YYYY")
        ) {
            formatedDate = "Today";
            effectiveDate = todayDateCode;
        } else {
            effectiveDate = todayInt;
        }

        const nextDayMoments = moment(date).add(1, "days");
        nextDay = nextDayMoments.toDate();
        //nextDay.setDate(date.getDate() + 1);
        const monthNextDay =
            nextDay.getMonth() + 1 < 10
                ? `0${nextDay.getMonth() + 1}`
                : `${nextDay.getMonth() + 1}`;
        const daysNextDay =
            nextDay.getDate() + 1 < 10 ? `0${nextDay.getDate() + 1}` : `${nextDay.getDate() + 1}`;
        const yearNextDay = nextDay.getFullYear().toString();

        let nextDayInt = "";

        let formatedDateNextDay;

        if (confirmDateEditFlow === 1) {
            formatedDateNextDay = DataModel.getFormatedDateMoments(date, "DD MMM YYYY");
            this.setState({
                formatedEndDate: formatedDate,
            });
        } else {
            // setStartDate
            nextDayInt = yearNextDay + monthNextDay + daysNextDay;
            formatedDateNextDay = DataModel.getFormatedDateMoments(nextDay, "DD MMM YYYY");
        }

        if (date instanceof Date) {
            if (confirmDateEditFlow === 1) {
                this.setState({
                    formatedEndDate: formatedDate,
                });
            } else {
                this.setState({
                    dateText: date.toISOString().split("T")[0],
                    date,
                    displayDate: formatedDate,
                    selectedStartDate: date,
                    formatedStartDate: formatedDate,
                    formatedEndDate: formatedDateNextDay,
                    effectiveDate,
                });
            }
        }
        this.onDateCancelPress();
    };

    onDateCancelPress = () => {
        console.log("[PayBillsConfirmationScreen] >> [onDateCancelPress]");

        this.setState({
            showDatePicker: false,
        });
    };

    onEditStartDate = () => {
        console.log("[PayBillsConfirmationScreen] >> [onEditStartDate]");

        confirmDateEditFlow = 0;

        const startDate = new Date();
        const maxDate = new Date();

        maxDate.setDate(maxDate.getDate() + 28);

        this.setState({
            dateRangeStart: startDate,
            dateRangeEnd: maxDate,
            defaultSelectedDate: startDate,
        });
        this.onOpenNewCalenderFlow();
    };

    onEditEndDate = () => {
        console.log("[PayBillsConfirmationScreen] >> [onEditEndDate]");

        confirmDateEditFlow = 1;

        const startDate = this.state.selectedStartDate;
        const maxDate = new Date();

        maxDate.setDate(maxDate.getDate() + 28);

        this.setState({
            dateRangeStart: startDate,
            dateRangeEnd: maxDate,
            defaultSelectedDate: startDate,
        });
        this.onOpenNewCalenderFlow();
    };

    // Calendar Related function
    onDateEditClick = () => {
        console.log("[PayBillsConfirmationScreen] >> [onDateEditClick]");

        this.setState({
            dateRangeStart: getStartDate(this.state.validDateRangeData),
            dateRangeEnd: getEndDate(this.state.validDateRangeData),
            defaultSelectedDate: this.state.displayDate,
            showDatePicker: true,
        });
    };

    onOpenNewCalenderFlow = () => {
        console.log("[PayBillsConfirmationScreen] >> [onOpenNewCalenderFlow]");

        this.setState({
            showDatePicker: true,
            // showScrollPickerView: false,
        });
    };

    // RSA event
    onChallengeSnackClosePress = () => {
        console.log("[PayBillsConfirmationScreen] >> [onChallengeSnackClosePress]");

        this.setState({ RSAError: false });
    };

    onChallengeQuestionSubmitPress = (answer) => {
        console.log("[PayBillsConfirmationScreen] >> [onChallengeQuestionSubmitPress]");

        const { challenge } = this.state;

        const params = this.getTransferAPIParams(this.isS2u);
        const rsaParams = { ...params, challenge: { ...challenge, answer } };
        this.setState(
            {
                isRSALoader: true,
                RSAError: false,
                isSubmitDisable: true,
            },
            () => {
                this.callTransferAPI(rsaParams, params?.payeeCode === LHDN_PAYEE_CODE);
            }
        );
    };

    onAccountListClick = (item) => {
        console.log("[PayBillsConfirmationScreen] >> [onAccountListClick]");

        const itemType =
            item.type === "C" || item.type === "J" || item.type === "R" ? "card" : "account";
        if (parseFloat(item.acctBalance) <= 0.0 && itemType === "account") {
            // TODO: show zero error
        } else {
            const tempArray = this.state.accounts;
            for (let i = 0; i < tempArray.length; i++) {
                if (tempArray[i].number === item.number) {
                    console.log("selectedAccount Obj ==> ", tempArray[i]);
                    tempArray[i].selected = true;
                } else {
                    tempArray[i].selected = false;
                }
            }
            this.setState({ accounts: tempArray, selectedAccount: item });
        }
    };

    handleResponseV2 = (response) => {
        try {
            const result = response?.paymentDetails;
            const pollingToken = result?.Msg?.MsgBody?.S2UTokenNo;
            const transactionRefNumber = result?.Msg?.MsgHeader?.MsgID;
            const statusCode = result?.Msg?.MsgHeader?.StatusCode;
            const statusDesc = result?.Msg?.MsgHeader?.StatusDesc;
            this.setState({
                refNo: formateReferenceNumber(transactionRefNumber),
                serverDate: moment().format(DD_MMM_YYYY + ", hh:mm A"),
                isLoading: false,
                isRSALoader: false,
                isRSARequired: false,
            });
            if (pollingToken) {
                this.openS2UModal({
                    pollingToken,
                    serverDate: moment().format(DD_MMM_YYYY + ", hh:mm A"),
                });
            } else if (transactionRefNumber && statusCode) {
                const { HostStatusCode, HostStatusDesc } =
                    result?.Msg?.MsgHeader?.AdditionalStatusCodes[0] || {};
                const extraStatusDescription =
                    HostStatusCode === "00F1" ? LHDN_CONTACT_ERROR : HostStatusDesc;
                const statusDescription = result?.statusDescription || statusDesc;
                const payViaTACSuccess =
                    this.state.flow !== "S2U" &&
                    (HostStatusCode === "000" || statusCode === "0000");
                this.goToAcknowledgeScreen({
                    ...result,
                    amount: this.state.amount,
                    additionalStatusDescription: extraStatusDescription || statusDescription,
                    formattedTransactionRefNumber: formateReferenceNumber(transactionRefNumber),
                    statusDescription,
                    statusCode: payViaTACSuccess ? "0" : "",
                    receiptBody: payViaTACSuccess
                        ? this.getBillerInfo(
                              {
                                  ...this.props?.route?.params?.billerData,
                                  formattedTransactionRefNumber:
                                      formateReferenceNumber(transactionRefNumber),
                                  serverDate: moment().format(DD_MMM_YYYY + ", hh:mm A"),
                              },
                              true
                          )
                        : null,
                    serverDate: moment().format(DD_MMM_YYYY + ", hh:mm A"),
                    receiptTitle:
                        this.props?.route?.params?.billerInfo?.payeeCode === LHDN_PAYEE_CODE
                            ? LHDN_PAYMENT
                            : "",
                    HostStatusCode,
                });
            } else {
                this.onGetTacError(COMMON_ERROR_MSG);
            }
        } catch (ex) {
            this.onGetTacError(COMMON_ERROR_MSG);
        }
    };

    payBillV2 = async (params) => {
        try {
            const response = await lhdnServiceCall(params, "/RT/TR/LHDN/1.0/paybill");
            this.handleResponseV2(response?.data);
        } catch (ex) {
            this.showLoader(false);
            this.callTransferAPIErrorHandler(ex);
        }
    };

    // TODO: need to understand this!!!
    onConfirmClick = async () => {
        //TODO: prevent multiple triggering button, thus proceed ahead only if Validation successful
        if (this.state.disabled || !this.state.selectedAccount) {
            return;
        }

        const isS2u = this.props.route.params.flow !== "TAC";
        const params = this.getTransferAPIParams(isS2u);
        const payeeCode = this.props?.route?.params?.billerInfo?.payeeCode;
        const zakatType = this.props.route.params?.zakatType ?? false;
        zakatType &&
            logEvent(FA_FORM_PROCEED, {
                [FA_SCREEN_NAME]: FA_PAY_ZAKAT_REVIEW_PAYMENT_DETAILS,
                [FA_FIELD_INFORMATION]: zakatType,
            });
        const { selectedAccount, donationFlow } = this.state;

        this.setState({
            isLoading: true,
            disabled: true,
            serverDate: "",
            refNo: "",
        });

        let inqResult;

        try {
            inqResult = await payBillInquiry({
                billAcctNo: donationFlow
                    ? payeeCode
                    : params.billAcctNo !== ""
                    ? params.billAcctNo
                    : params.billRefNo,
                payeeCode,
            });

            // TODO:, backend should change to "0"
            if (inqResult.statusCode !== "0000") {
                this.setState({ isLoading: false, disabled: false });
                showErrorToast({ message: inqResult.statusDescription });
                return;
            }
        } catch (err) {
            console.log(err); // TypeError: failed to fetch
            if (err?.message) {
                this.setState({ isLoading: false, disabled: false });
                showErrorToast({ message: err.message });
            }
            return;
        }

        console.log("payBillInquiry result:", inqResult);

        const validateAccount = selectedAccount.number.length >= 1;
        console.log("validateAccount:", validateAccount);
        if (validateAccount) {
            this.payBillFlow(payeeCode === LHDN_PAYEE_CODE);
        } else {
            this.setState({ disabled: false });
        }
    };

    onEditAmount = () => {
        console.log("[PayBillsConfirmationScreen] >> [onEditAmount]");
        this.props.navigation.goBack();
    };

    onRef2Change = (val) => {
        val = val.replace(/[^0-9 a-z A-Z .\-(),:_/]/g, "");
        const requiredFields = [...this.state.requiredFields];
        const { billRef2Required } = this.state;
        // requiredFields[1].fieldName = "billRefNo";
        // requiredFields[1].fieldValue = val;

        // if (requiredFields?.length === 2) {
        //     requiredFields.push({ fieldName: "billRef2", fieldValue: val });
        // } else {
        //     requiredFields[requiredFields?.length > 1 ? 2 : 1].fieldName =
        //         requiredFields?.length > 1 ? "billRef2" : "billRef";
        //     requiredFields[requiredFields?.length > 1 ? 2 : 1].fieldValue = val;
        // }
        requiredFields[2].fieldValue = val;
        const isDoneDisabled = val?.length < 3 && billRef2Required;
        this.setState({ requiredFields, isDoneDisabled, ref2Val: val });
    };

    onRef1Change = (val) => {
        val = val.replace(/[^0-9 a-z A-Z .\-(),:_/]/g, "");
        const { billRef2Required } = this.state;
        const requiredFields = [...this.state.requiredFields];
        requiredFields[1].fieldValue = val;
        const isDoneDisabled = val?.length < 3;
        this.setState({ requiredFields, isDoneDisabled });
    };

    onRiceTypeEdit = () => {
        console.log("[PayBillsConfirmationScreen] >> [onRiceTypeEdit]");

        const { isFav } = this.state;

        if (isFav) {
            this.props.navigation.goBack();
        } else {
            this.props.navigation.navigate(navigationConstant.PAYBILLS_MODULE, {
                screen: navigationConstant.ZAKAT_DETAILS,
                params: {
                    ...this.props.route.params,
                    routeBackFrom: navigationConstant.PAYBILLS_CONFIRMATION_SCREEN,
                },
            });
        }
    };

    onNumOfPeopleEdit = () => {
        console.log("[PayBillsConfirmationScreen] >> [onNumOfPeopleEdit]");

        const { isFav } = this.state;

        if (isFav) {
            this.props.navigation.goBack();
        } else {
            this.props.navigation.navigate(navigationConstant.PAYBILLS_MODULE, {
                screen: navigationConstant.ZAKAT_DETAILS,
                params: {
                    ...this.props.route.params,
                    routeBackFrom: navigationConstant.PAYBILLS_CONFIRMATION_SCREEN,
                },
            });
        }
    };

    // -----------------------
    // OTHERS
    // -----------------------

    // make flow decision
    payBillFlow = async (isV2) => {
        console.log("[PayBillsConfirmationScreen] >> [payBillFlow]");

        const { secure2uValidateData, donationFlow, flow } = this.state;
        const { billerInfo, billerData, isFav } = this.props?.route?.params || {};
        const params = this.getTransferAPIParams(flow !== "TAC");

        if ((isFav && !this.state.s2uCheck) || flow === "NA") {
            // this.props.route.params.isFav
            // do pay
            this.isS2u = flow === "S2U";
            this.callTransferAPI(params, isV2);
        } else {
            const isS2uRequired =
                this.props.route?.params?.auth === "success" || flow === "S2U" || flow === "S2UReg";
            this.isS2u = isS2uRequired;
            if (isS2uRequired) {
                // go pay and go to sec2u
                this.callTransferAPI(params, isV2);
            } else {
                const tacParams = {
                    amount: params.transferAmount,
                    donation: donationFlow,
                    fromAcctNo: params.fromAccount,
                    fundTransferType: params.transactionType,
                    accCode: params.fromAcctCode,
                    toAcctNo:
                        params.payeeCode === LHDN_PAYEE_CODE
                            ? String(billerData?.outITRefNo)
                            : params.billAcctNo || params.billRefNo,
                    paymentType: params.payeeCode,
                    groupCode: params.payeeCode === LHDN_PAYEE_CODE ? billerData?.outITGrpCd : "",
                    payeeName:
                        params.payeeCode === LHDN_PAYEE_CODE
                            ? params?.payeeName
                            : billerInfo?.fullName || billerInfo?.shortName,
                    PaymentID: this.props.route.params?.billerData?.PaymentID,
                };

                // show tac ui
                this.setState({
                    tacParams: !isV2 && tacParams,
                    transferAPIParams: params,
                });

                if (isV2) {
                    this.lhdnTacCall(tacParams);
                }
            }
        }
    };

    // prepare paybill params
    getTransferAPIParams = (isS2u) => {
        const params = this.props?.route?.params ?? {};
        const {
            selectedAccount,
            effectiveDate,
            amount,
            zakatFlow,
            zakatFitrahFlow,
            donationFlow,
            zakatType,
        } = this.state;

        let billAcctNo = "";
        let billRefNo = "";

        const billParams = { ...params?.billerData };
        const requiredFields = this.state?.requiredFields ?? [];

        console.log("requiredFields:", requiredFields);

        requiredFields.forEach((field) => {
            if (field?.fieldName === "bilAcct") {
                billAcctNo = field.fieldValue;
            } else if (field?.fieldName === "billRef") {
                billRefNo = field.fieldValue; // TODO: double confirm with backend, billRefNo or billRefNo2
                // } else if (field?.fieldName === "billRef2") {
                //     billParams.billRef2No = field.fieldValue;
                //     billParams.billRefNo2 = field.fieldValue;
            }
        });

        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const additionalParams = this.getAdditionalParams(billAcctNo, params);
        const transferParams = {
            accountType: selectedAccount.accountType,
            billAcctNo: donationFlow ? "AJD" : billAcctNo,
            billRefNo,
            ...billParams,
            effectiveDateTime: effectiveDate, //"00000000"
            fromAccount: selectedAccount.number,
            fromAcctCode: selectedAccount.code,
            onlinePayment: params?.billerInfo.onlinePayment,
            payeeCode: params?.billerInfo.payeeCode,
            tacrequired: params?.billerInfo.tacRequired,
            transactionType: FundConstants.BILL_PAYMENT_OTP,
            transferAmount: amount,
            tac: this.tac ? this.tac : "",
            startDate: "",
            endDate: "",
            mobileSDKData: mobileSDK, // Required For RSA
            type: params.isFav && !this.state.s2uCheck ? "FAVORITE" : "OPEN",
            zakat: zakatFlow,
            donation: donationFlow,
            zakatFitrah: zakatFitrahFlow,
            zakatType,
            payeeName: params?.billerInfo?.fullName || params?.billerInfo?.shortName,
            ...additionalParams,
        };
        const s2uFlow =
            this.state.secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL";

        if ((params.isFav && this.state.s2uCheck) || !params.isFav)
            transferParams.twoFAType = isS2u ? s2uFlow : "TAC";
        if (params.isFav && this.state.s2uCheck) transferParams.favLimitExceed = "Y";
        return transferParams;
    };

    getAdditionalParams = (billAcctNo, params) => {
        if (params?.billerInfo.payeeCode === LHDN_PAYEE_CODE) {
            const billAccNo = billAcctNo?.replace(/\s+/g, "");
            return {
                billAcctNo: billAccNo,
                billNo: billAccNo,
                assessmentYear: String(params?.billerData?.outAsmYr),
                installmentNo: String(params?.billerData?.outAsmMth),
                paymentCode:
                    "0" +
                    String(
                        !params?.billerData?.outPaymentCd ? "84" : params?.billerData?.outPaymentCd
                    ),
                taxNo: String(params?.billerData?.outITRefNo),
                billIndicator: params?.billerData?.outITGrpCd,
                businessRegistrationNo: params?.billerData?.outROCNum || "",
                paymentType: params?.payeeCode,
                groupCode: params?.billerData?.outITGrpCd || "",
                payeeName: params?.billerData?.outName,
            };
        }
    };

    callTransferAPI = (params, isV2) => {
        console.log("[PayBillsConfirmationScreen] >> [callTransferAPI]");
        if (isV2) {
            this.payBillV2(params);
            return;
        }
        const { flow, s2uCheck, zakatFlow } = this.state;
        const url = zakatFlow ? ZAKAT_PAY_BILL_API : PAY_BILL_API;
        const { isFav } = this.props.route.params;

        payBill(params, url)
            .then((response) => {
                console.log("payBill respone**:", response);
                this.setState({
                    // update state values
                    isRSARequired: false,
                    isRSALoader: false,
                });

                const responseObject = response?.data;
                if (responseObject?.statusCode === "0") {
                    if (
                        responseObject?.token &&
                        ((isFav && s2uCheck) || (!isFav && flow === "S2U"))
                    ) {
                        this.openS2UModal(responseObject);
                    } else {
                        console.log("#success, isfav or tac, go to done");
                        this.goToAcknowledgeScreen(responseObject);
                    }
                } else {
                    // FAIL
                    console.log("#fail 1", responseObject);
                    this.goToAcknowledgeScreen(responseObject);
                }
            })
            .catch((data) => {
                this.showLoader(false);
                this.callTransferAPIErrorHandler(data);
            });
    };

    callTransferAPIForTac = (params) => {
        console.log("[PayBillsConfirmationScreen] >> [callTransferAPIForTac]");

        const { zakatFlow } = this.state;
        const url = zakatFlow ? ZAKAT_PAY_BILL_API : PAY_BILL_API;

        return params?.payeeCode === LHDN_PAYEE_CODE
            ? lhdnServiceCall(params, "/RT/TR/LHDN/1.0/paybill")
            : payBill(params, url);
    };

    callTransferAPIErrorHandler = (err) => {
        console.log("[PayBillsConfirmationScreen] >> [callTransferAPIErrorHandler]");

        if (err.status === 428) {
            // Display RSA Challenge Questions if status is 428
            this.setState((prevState) => ({
                challenge: err.error.challenge,
                isRSARequired: true,
                isRSALoader: false,
                isLoading: false,
                challengeQuestion: err.error.challenge.questionText,
                RSACount: prevState.RSACount + 1,
                RSAError: prevState.RSACount > 0,
                tacParams: null,
                transferAPIParams: null,
            }));
        } else if (err.status === 423) {
            console.log("423:", err);
            this.setState(
                {
                    tacParams: null,
                    transferAPIParams: null,
                    isRSALoader: false,
                    RSAError: false,
                    isSubmitDisable: true,
                    isRSARequired: false,
                },
                () => {
                    const reason = err?.error?.statusDescription;
                    const loggedOutDateTime = err?.error?.serverDate;
                    const lockedOutDateTime = err?.error?.serverDate;
                    this.props.navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                        screen: "Locked",
                        params: {
                            reason,
                            loggedOutDateTime,
                            lockedOutDateTime,
                        },
                    });
                }
            );
        } else if (err.status === 422) {
            // RSA deny handler
            let errorObj = err?.error;
            errorObj = errorObj?.error ?? errorObj;

            const { statusDescription, additionalStatusDescription, serverDate } = errorObj;

            const rsaDenyScreenParams = {
                statusDescription,
                additionalStatusDescription,
                serverDate,
                nextParams: { screen: navigationConstant.DASHBOARD, params: { refresh: false } },
                nextModule: navigationConstant.TAB_NAVIGATOR,
                nextScreen: "Tab",
            };

            if (this.prevSelectedAccount) {
                rsaDenyScreenParams.nextParams = this.prevSelectedAccount;
                rsaDenyScreenParams.nextModule = this.fromModule;
                rsaDenyScreenParams.nextScreen = this.fromScreen;
            }

            this.props.navigation.navigate(navigationConstant.COMMON_MODULE, {
                screen: navigationConstant.RSA_DENY_SCREEN,
                params: rsaDenyScreenParams,
            });
        } else {
            this.setState(
                {
                    tacParams: null,
                    transferAPIParams: null,
                    isRSALoader: false,
                    RSAError: false,
                    isSubmitDisable: true,
                    isRSARequired: false,
                    isLoading: false,
                },
                () => {
                    let errorObj = err?.error;
                    errorObj = errorObj?.error ?? errorObj;
                    if (err.status >= 500 && err.status < 600) {
                        showErrorToast({ message: errorObj.message ?? "Error" });
                    } else if (err.status >= 400 && err.status < 500) {
                        this.goToAcknowledgeScreen({
                            formattedTransactionRefNumber:
                                errorObj?.formattedTransactionRefNumber ?? null,
                            serverDate: errorObj?.serverDate ?? null,
                            additionalStatusDescription: errorObj?.message ?? null,
                            statusDescription: FAILED,
                            statusCode: errorObj.statusCode,
                        });
                    } else {
                        showErrorToast({ message: COMMON_ERROR_MSG });
                    }
                }
            );
        }
    };

    getAddFavParam = () => {
        //
        return {};
    };

    openS2UModal = (response) => {
        console.log("[PayBillsConfirmationScreen] >> [openS2UModal]");

        console.log(response);
        this.setState({ isShowS2u: true, transactionResponseObject: response });
    };

    onS2UDone = (response) => {
        console.log("[PayBillsConfirmationScreen] >> [onS2UDone]");

        // will close s2u popup
        this.setState({ isShowS2u: false });
        const {
            additionalStatusDescription,
            formattedTransactionRefNumber,
            transactionReferenceNumber,
        } = response?.s2uSignRespone || {};
        const customResponse = {
            ...this.state.transactionResponseObject,
            ...response?.s2uSignRespone,
            statusCode: response.transactionStatus ? "0" : "1",
            additionalStatusDescription,
            formattedTransactionRefNumber:
                this.state.refNo ||
                formateReferenceNumber(transactionReferenceNumber) ||
                formattedTransactionRefNumber,
            serverDate: this.state.serverDate || response?.s2uSignRespone?.dateTime,
            amount: this.state.transferAmount,
        };

        this.goToAcknowledgeScreen(customResponse, response);
    };

    onS2UClose = () => {
        console.log("[PayBillsConfirmationScreen] >> [onS2UClose]");

        // will close tac popup
        this.setState({ isShowS2u: false });
    };

    onTacSuccess = (response) => {
        console.log("[PayBillsConfirmationScreen] >> [onTacSuccess]");

        // will close tac popup
        this.setState({ tacResponse: null, tacParams: null, transferAPIParams: null });

        if (response?.paymentDetails) {
            this.handleResponseV2(response);
            return;
        }

        this.goToAcknowledgeScreen(response);
    };

    onTacError = (err, tac) => {
        console.log("[PayBillsConfirmationScreen] >> [onTacError]");

        this.tac = tac;
        this.setState(
            {
                tacResponse: null,
                tacParams: null,
                transferAPIParams: null,
                isLoading: false,
                isDoneDisabled: false,
            },
            () => this.callTransferAPIErrorHandler(err)
        );
    };

    onTacClose = () => {
        console.log("[PayBillsConfirmationScreen] >> [onTacClose]");

        // will close tac popup
        this.setState({
            tacResponse: null,
            tacParams: null,
            transferAPIParams: null,
            isLoading: false,
        });
    };

    goToAcknowledgeScreen = (response, s2uSignData = null) => {
        console.log("[PayBillsConfirmationScreen] >> [goToAcknowledgeScreen]", response);
        this.setState({ isLoading: false });
        const { donationFlow, zakatFlow, zakatFitrahFlow } = this.state;

        const statusDescription =
            response.statusCode === "0"
                ? response?.statusDescription?.toLowerCase()
                : "unsuccessful";

        const statusCode = s2uSignData?.s2uSignRespone?.status ?? "";
        const statusCodeMdip = s2uSignData?.s2uSignRespone?.statusCode || statusCode;
        const s2uStatusDesc =
            s2uSignData?.s2uSignRespone?.statusDescription?.toLowerCase() ?? "unsuccessful";

        if (s2uSignData) {
            const transferType = statusCode === "M201" ? "Transaction" : "Payment";
            response.statusDescription = `${transferType} ${
                s2uStatusDesc === SUCC_STATUS ? SUCCESSFUL_STATUS?.toLowerCase() : s2uStatusDesc
            }`;

            if (statusCode === "M408") {
                response.statusDescription = `${s2uStatusDesc}`;
            }

            if (
                this.props?.route?.params?.billerInfo?.payeeCode === LHDN_PAYEE_CODE &&
                (statusCode === "M201" || statusCodeMdip === "M200")
            ) {
                response.statusDescription =
                    statusCode === "M201" ? AUTHORISATION_FAILED : PAYMENT_UNSUCCESSFUL;
                response.additionalStatusDescription =
                    statusCode === "M201"
                        ? AUTHORISATION_WAS_REJECTED
                        : response?.additionalStatusDescription;
            }

            if (statusCode === "00F1") {
                response.additionalStatusDescription = LHDN_CONTACT_ERROR;
                response.statusDescription = TRANSACTION_UNSUCCESS;
            }
        } else {
            response.statusDescription = `Payment ${
                statusDescription === SUCC_STATUS
                    ? SUCCESSFUL_STATUS?.toLowerCase()
                    : statusDescription
            }`;

            if (response.HostStatusCode === "00A5") {
                response.additionalStatusDescription = WRONG_TAC_ENTERED;
                response.statusDescription = AUTHORISATION_FAILED;
            }

            if (response.HostStatusCode === "0051") {
                response.additionalStatusDescription =
                    "You have insufficient balance in your account.";
                response.statusDescription = PAYMENT_UNSUCCESSFUL;
            }

            if (response.HostStatusCode === "00D9") {
                response.additionalStatusDescription = S2U_RETRY_AFTER_SOMETIME;
                response.statusDescription = PAYMENT_UNSUCCESSFUL;
            }

            if (statusCode === "00F1" || response.HostStatusCode === "00F1") {
                response.additionalStatusDescription = LHDN_CONTACT_ERROR;
                response.statusDescription = TRANSACTION_UNSUCCESS;
            }
        }

        if (zakatFlow) {
            response.statusDescription = `Zakat ${statusDescription}`;
        }

        if (donationFlow) {
            response.statusDescription = `Donation ${statusDescription}`;
        }

        const refNumber = formateReferenceNumber(
            s2uSignData?.s2uSignRespone?.transactionReferenceNumber ||
                response?.formattedTransactionRefNumber ||
                response?.transactionRefNumber ||
                response?.paymentDetails?.Msg?.MsgHeader?.MsgID
        );

        // effectiveDateType
        this.props.navigation.navigate(navigationConstant.PAYBILLS_MODULE, {
            screen: navigationConstant.PAYBILLS_ACKNOWLEDGE_SCREEN,
            params: {
                transferResponse: {
                    ...response,
                    receiptTitle:
                        this.props?.route?.params?.billerInfo?.payeeCode === LHDN_PAYEE_CODE
                            ? LHDN_PAYMENT
                            : "",
                    receiptBody: this.getBillerInfo(
                        {
                            ...this.props?.route?.params?.billerData,
                            formattedTransactionRefNumber: refNumber,
                            serverDate:
                                s2uSignData?.s2uSignRespone?.dateTime ||
                                moment().format(DD_MMM_YYYY + ", hh:mm A"),
                        },
                        true
                    ),
                },
                transferParams: {
                    ...this.props.route.params,
                    isToday: this.state.effectiveDate === todayDateCode,
                    effectiveDate: this.state.effectiveDate,
                    referenceNumber: refNumber,
                },
                s2uSignRespone: s2uSignData?.s2uSignRespone,
                zakatFlow,
                zakatFitrahFlow,
                donationFlow,
                addFavSuccess: this.props?.route?.params?.billerInfo?.payeeCode === LHDN_PAYEE_CODE,
                isS2uFlow: s2uSignData !== null,
            },
        });
    };

    filterTransferDetail = (data) => {
        return data?.label && data?.value;
    };

    renderTransferDetail = (infoData, i) => {
        return (
            <TransferDetailLayout
                key={i + "info"}
                left={<TransferDetailLabel value={infoData?.label} />}
                right={<TransferDetailValue value={infoData?.value} />}
            />
        );
    };

    //Prod issue- this function is to mask the Card number in Approve/Reject page.
    processAccountNo = () => {
        const accType = this.state.selectedAccount.type;
        const accNum = this.state.selectedAccount.number;
        if (accType === "C" || accType === "J" || accType === "DC" || accType === "R") {
            return maskCard(accNum);
        } else {
            return getFormatedAccountNumber(accNum);
        }
    };

    getBillerInfo = (transferInfo, isReceipt) => {
        const { billerInfo } = this.props?.route?.params || {};
        // const isPRN =
        //     transferInfo?.responseCode === "200" &&
        //     !(transferInfo?.outAsmYr && transferInfo?.outAsmMth && transferInfo?.outPaymentCd);
        const isSoleProp = this.props.getModel("user").soleProp;
        const char = isReceipt ? " " : "\n";
        const detailsArray = [
            {
                label: "Tax payer name",
                value: `${transferInfo?.maskOutName}`,
                showRightText: false,
            },
            {
                label: "Bill no.",
                value:
                    isReceipt && isSoleProp
                        ? addSpaceAfter4Chars(String(transferInfo?.billNo))
                        : "",
                showRightText: false,
            },
            {
                label: "Income tax no.",
                value: `${transferInfo?.outITGrpCd} ${transferInfo?.maskOutITRefNo}`,
                showRightText: false,
            },
            {
                label: "Instalment no.",
                value: String(transferInfo?.outAsmMth),
                showRightText: false,
            },
            {
                label: "Bill no.",
                value:
                    isReceipt && !isSoleProp
                        ? addSpaceAfter4Chars(String(transferInfo?.billNo))
                        : "",
                showRightText: false,
            },
            {
                label: "Assessment year",
                value: String(transferInfo?.outAsmYr),
                showRightText: false,
            },
            {
                label: "Payment code",
                value: `0${String(
                    transferInfo?.outPaymentCd
                )} - Bayaran${char}Ansuran Cukai${char} - ${
                    transferInfo?.outPaymentCd === 86 ? "Syarikat" : "Individu"
                }`,
                showRightText: false,
            },
            {
                label: LBL_BUSINESS_REG_NO,
                value: !isReceipt && isSoleProp ? transferInfo?.maskOutROCNum : "",
                showRightText: false,
            },
        ];

        if (billerInfo?.payeeCode === LHDN_PAYEE_CODE) {
            if (isReceipt) {
                return [
                    {
                        label: "Reference ID",
                        value: transferInfo?.formattedTransactionRefNumber,
                        showRightText: true,
                        rightTextType: "text",
                        rightStatusType: "",
                        rightText: transferInfo?.serverDate,
                    },
                    {
                        label: "Pay from",
                        value: `${this.state.selectedAccount?.name}\n${formateAccountNumber(
                            this.state.selectedAccount?.number.replace(/\s/g, ""),
                            12
                        )}`,
                        showRightText: false,
                    },
                    {
                        label: "Corporate Name",
                        value: this.state.title,
                        showRightText: false,
                    },
                    ...detailsArray,
                ];
            }

            return [
                {
                    label: "Effective date",
                    value: moment().format("DD MMM YYYY"),
                    showRightText: false,
                },
                ...detailsArray,
            ];
        }

        return null;
    };

    lhdnTacCall = async (params) => {
        try {
            const result = await lhdnTacCall(
                params,
                this.props.route.params?.billerData?.PaymentID
            );
            const response =
                result?.data?.tacTokenDetails || result?.data?.msServicesStatus || result?.data;
            console.tron.log("lhdnTacCall response ", response);
            const { statusCode, statusDesc, token, message } = response || {};

            if (message || response?.status === 500) {
                throw Error(message);
            }

            this.setState({
                isLoading: false,
                disabled: false,
                tacResponse: { statusCode, statusDesc, token },
            });
        } catch (ex) {
            this.setState({
                isLoading: false,
                disabled: false,
            });
            const message = `${ex?.error?.message || ex?.message}`;
            this.onGetTacError(message);
        }
    };

    onGetTacError = (msg) => {
        this.setState({ tacParams: null, isLoading: false, isDoneDisabled: false });
        if (msg) {
            showErrorToast({ message: msg });
        }
    };

    getS2uTransactionDetails = (billerInfo, stateData) => {
        const {
            isShowS2u,
            title,
            zakatFlow,
            zakatType,
            selectedAccount,
            transactionResponseObject,
        } = stateData;
        if (isShowS2u && selectedAccount) {
            if (zakatFlow) {
                return [
                    {
                        label: TO,
                        value: `${title}`,
                    },
                    {
                        label: FROM,
                        value: `${selectedAccount.name}\n${this.processAccountNo()}`,
                    },
                    { label: TRANSACTION_TYPE, value: zakatType },
                    {
                        label: DATE,
                        value: `${moment(
                            transactionResponseObject.serverDate,
                            "D MMM YYYY, hh:mm a"
                        ).format("DD MMM YYYY")}`,
                    },
                ];
            }
            if (billerInfo?.payeeCode === LHDN_PAYEE_CODE) {
                return [
                    {
                        label: PAY_TO,
                        value: title,
                    },
                    {
                        label: PAY_FROM,
                        value: `${selectedAccount.name}\n${this.processAccountNo()}`,
                    },
                    {
                        label: TRANSACTION_TYPE,
                        value: LHDN_PAYMENT,
                    },
                    {
                        label: DATE_AND_TIME,
                        value: transactionResponseObject.serverDate,
                    },
                ];
            }

            return [
                {
                    label: TO,
                    value: `${title}\n${this.state.subTitle}`,
                },
                {
                    label: FROM,
                    value: `${selectedAccount.name}\n${this.processAccountNo()}`,
                },
                {
                    label: TRANSACTION_TYPE,
                    value: PAY_BILLS,
                },
                {
                    label: DATE,
                    value: `${moment(
                        transactionResponseObject.serverDate,
                        "D MMM YYYY, hh:mm a"
                    ).format("DD MMM YYYY")}`,
                }, //
            ];
        }
    };
    // -----------------------
    // UI
    // -----------------------
    render() {
        const {
            title,
            subTitle,
            transferAmount,
            logoImage,
            accounts,
            selectedAccount,
            tacParams,
            transferAPIParams,
            transactionResponseObject,
            isShowS2u,
            showDatePicker,
            dateRangeStart,
            dateRangeEnd,
            defaultSelectedDate,
            secure2uValidateData,
            s2uExtraParams,
            displayDate,
            isDoneDisabled,
            donationFlow,
            zakatFlow,
            zakatFitrahFlow,
            zakatType,
            serviceFee,
            riceType,
            numOfPeople,
            radioBtnText,
            zakatRadioBtn,
            requiredFields,
            // billRef2Required,
            isLoading,
        } = this.state;
        const { billerInfo, allowEdit, billerData } = this.props?.route?.params || {};
        const transactionDetails = this.getS2uTransactionDetails(billerInfo, this.state);
        // const refPlaceholder = billRef2Required ? ADD_DETAILS : OPTIONAL1;
        const subTitleFormatted =
            billerInfo?.payeeCode === LHDN_PAYEE_CODE
                ? `${"Bill No. "}${subTitle}`
                : addSpaceAfter4Chars(subTitle);
        const hideDateField = billerInfo?.payeeCode === LHDN_PAYEE_CODE || donationFlow;
        return (
            <TransferConfirmation
                headTitle={CONFIRMATION}
                payLabel={donationFlow ? DONATE_NOW : PAY_NOW}
                amount={transferAmount}
                onEditAmount={
                    (!allowEdit && billerInfo?.payeeCode === LHDN_PAYEE_CODE) ||
                    (zakatFlow && zakatFitrahFlow)
                        ? null
                        : this.onEditAmount
                }
                logoTitle={title}
                logoSubtitle={zakatFlow || donationFlow ? subTitle : subTitleFormatted}
                logoImg={{
                    type: "url",
                    source: logoImage,
                }}
                onDonePress={this.onConfirmClick}
                isDoneDisabled={isDoneDisabled}
                onBackPress={this.onBackPress}
                onClosePress={this.onClosePress}
                accounts={accounts}
                extraData={this.state}
                onAccountListClick={this.onAccountListClick}
                selectedAccount={selectedAccount}
                resendByOwnAPI={() => {
                    this.payBillFlow(billerInfo?.payeeCode === LHDN_PAYEE_CODE);
                }}
                getTacResponse={this.state.tacResponse}
                tacParams={tacParams}
                onGetTacError={this.onGetTacError}
                transferAPIParams={transferAPIParams}
                transferApi={this.callTransferAPIForTac}
                onTacSuccess={this.onTacSuccess}
                onTacError={this.onTacError}
                onTacClose={this.onTacClose}
                transactionResponseObject={transactionResponseObject}
                isShowS2u={isShowS2u}
                onS2UDone={this.onS2UDone}
                onS2UClose={this.onS2UClose}
                s2uExtraParams={s2uExtraParams}
                transactionDetails={transactionDetails}
                isLoading={isLoading}
                showDatePicker={showDatePicker}
                onCancelButtonPressed={this.onDateCancelPress}
                onDoneButtonPressed={this.onDateDonePress}
                dateRangeStartDate={dateRangeStart}
                dateRangeEndDate={dateRangeEnd}
                defaultSelectedDate={defaultSelectedDate}
                secure2uValidateData={secure2uValidateData}
            >
                {zakatFlow ? (
                    <View style={Styles.detailsViewCls}>
                        <TransferDetailLayout
                            left={<TransferDetailLabel value={DATE} />}
                            right={<TransferDetailValue value={displayDate} />}
                        />
                        <TransferDetailLayout
                            left={<TransferDetailLabel value={ZAKAT_TYPE} />}
                            right={<TransferDetailValue value={zakatType} />}
                        />
                        <TransferDetailLayout
                            left={<TransferDetailLabel value={SERVICE_FEES} />}
                            right={<TransferDetailValue value={serviceFee} />}
                        />

                        {zakatFitrahFlow ? (
                            <>
                                <TransferDetailLayout
                                    left={<TransferDetailLabel value="Rice type" />}
                                    right={
                                        <TransferDetailValue
                                            value={riceType}
                                            onPress={this.onRiceTypeEdit}
                                        />
                                    }
                                />
                                <TransferDetailLayout
                                    left={<TransferDetailLabel value="No. of people" />}
                                    right={
                                        <TransferDetailValue
                                            value={numOfPeople}
                                            onPress={this.onNumOfPeopleEdit}
                                        />
                                    }
                                />

                                <View style={Styles.lineConfirm} />

                                {radioBtnText && (
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        onPress={this.onZakatRadioTap}
                                        style={Styles.radioBtnViewCls}
                                    >
                                        {zakatRadioBtn ? (
                                            <RadioChecked
                                                label={radioBtnText}
                                                paramLabelCls={Styles.radioBtnLabelCls}
                                                paramContainerCls={Styles.radioBtnContainerStyle}
                                                checkType="image"
                                                imageSrc={Assets.icRadioChecked}
                                            />
                                        ) : (
                                            <RadioUnchecked
                                                label={radioBtnText}
                                                paramLabelCls={Styles.radioBtnLabelCls}
                                                paramContainerCls={Styles.radioBtnContainerStyle}
                                            />
                                        )}
                                    </TouchableOpacity>
                                )}
                            </>
                        ) : (
                            <View style={Styles.lineConfirm} />
                        )}
                    </View>
                ) : (
                    <View style={Styles.detailsViewCls}>
                        {!hideDateField && (
                            <TransferDetailLayout
                                left={<TransferDetailLabel value={DATE} />}
                                right={
                                    <TransferDetailValue
                                        value={this.state.displayDate}
                                        onPress={this.onDateEditClick}
                                    />
                                }
                            />
                        )}
                        <>
                            {requiredFields?.length > 1 && (
                                <TransferDetailLayout
                                    left={
                                        <TransferDetailLabel
                                            value={
                                                requiredFields[1]?.fieldLabel ??
                                                requiredFields[1].alternateLabel
                                            }
                                        />
                                    }
                                    right={
                                        <TextInput
                                            textAlign="right"
                                            autoCorrect={false}
                                            autoFocus={false}
                                            allowFontScaling={false}
                                            style={Styles.textInput}
                                            placeholderTextColor={GREY}
                                            testID="inputReference"
                                            accessibilityLabel="inputReference"
                                            secureTextEntry={false}
                                            placeholder={ADD_DETAILS}
                                            value={requiredFields[1]?.fieldValue}
                                            onChangeText={this.onRef1Change}
                                            maxLength={20}
                                            keyboardType="ascii-capable"
                                        />
                                    }
                                />
                            )}

                            {this.getBillerInfo(billerData)
                                ?.filter(this.filterTransferDetail)
                                ?.map(this.renderTransferDetail)}
                        </>
                        <View style={Styles.lineConfirm} />
                    </View>
                )}

                {billerInfo?.payeeCode === LHDN_PAYEE_CODE && (
                    <View style={Styles.notesMainContainer}>
                        <Typography
                            fontSize={12}
                            fontWeight="600"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            textAlign="left"
                            color="#787878"
                            text={NOTES1}
                            style={Styles.note}
                        />

                        <View style={Styles.notesContainer}>
                            <Typography
                                text="1.   "
                                fontSize={12}
                                fontWeight="400"
                                lineHeight={20}
                                textAlign="left"
                                color={DARK_GREY}
                            />
                            <Typography
                                fontSize={12}
                                fontWeight="normal"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={18}
                                textAlign="left"
                                color="#787878"
                                text="LHDN has provided the amount to pay and your other info based on your bill no. For any inquiries, please contact LHDN."
                            />
                        </View>
                    </View>
                )}
                {this.state.isRSARequired && (
                    <ChallengeQuestion
                        loader={this.state.isRSALoader}
                        display={this.state.isRSARequired}
                        displyError={this.state.RSAError}
                        questionText={this.state.challengeQuestion}
                        onSubmitPress={this.onChallengeQuestionSubmitPress}
                        onSnackClosePress={this.onChallengeSnackClosePress}
                    />
                )}
            </TransferConfirmation>
        );
    }
}

const Styles = {
    container: {
        flex: 1,
        alignItems: FLEX_START,
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: FLEX_START,
    },
    detailsViewCls: {
        paddingHorizontal: 24,
    },
    footerContainer: {
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
        paddingTop: 20,
        paddingBottom: 36,
        paddingHorizontal: 24,
    },
    scrollViewContainer: {
        width: "100%",
        paddingHorizontal: 12,
    },

    lineConfirm: {
        backgroundColor: "#cccccc",
        flexDirection: "row",
        height: 1,
        marginTop: 15,
        marginBottom: 10,
    },
    note: { paddingBottom: 7 },

    notesContainer: { flexDirection: "row", paddingRight: 25 },
    radioBtnViewCls: {
        alignItems: FLEX_START,
        marginTop: 25,
    },
    notesMainContainer: { paddingHorizontal: 24, paddingTop: 24 },
    radioBtnLabelCls: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 20,
        paddingLeft: 10,
    },

    radioBtnContainerStyle: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
    },

    textInput: {
        paddingTop: 0,
        marginTop: 0,
        paddingBottom: 0,
        fontFamily: "Montserrat-SemiBold",
        fontSize: 14,
        width: "100%",
        textAlignVertical: "top",
        color: ROYAL_BLUE,
        fontWeight: "600",
    },
};

export default withModelContext(PayBillsConfirmationScreen);
