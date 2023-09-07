import moment from "moment";
import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";

import {
    FUNDTRANSFER_MODULE,
    PDF_VIEWER,
    TRANSFER_TAB_SCREEN,
} from "@navigation/navigationConstant";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import TermsAndConditionChecker from "@components/TermsAndConditionChecker";
import { showErrorToast } from "@components/Toast";
import TransactionConfirmationDetails from "@components/TransactionConfirmationDetails";
import TransactionConfirmationNotes from "@components/TransactionConfirmationNotes";
import TransferConfirmation from "@components/Transfers/TransferConfirmationScreenTemplate";

import { withModelContext } from "@context";

import { bankingGetDataMayaM2u, transferFundToASNB } from "@services";
import { logEvent } from "@services/analytics";

import { SWITCH_GREY } from "@constants/colors";
import {
    CONFIRMATION,
    TRANSFER_NOW,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FA_FORM_PROCEED,
} from "@constants/strings";

import { addSpaceAfter4Chars } from "@utils/dataModel/utility";
import { errorCodeMap } from "@utils/errorMap";

import Assets from "@assets";

const REFERENCE_ID = "Reference ID";
const DATE_TIME = "Date & time";
const DATE_FORMAT = "DD MMM YYYY";
const S2U_FLOW_STATUS = "S2U";
const SCREEN_NAME = "Transfer_ASNB_ReviewDetails";

class ASNBTransferConfirmationScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        getModel: PropTypes.func.isRequired,
    };

    state = {
        beneficiaryName: "",
        idNumber: "",
        amount: 0,
        date: "",
        transferType: "",
        serviceFee: "",
        membershipNumber: "",
        productName: "",
        relationship: "",
        purposeOfTransfer: "",
        isTermsAndConditionsAgreed: true,
        showTermsAndCondition: false,
        showLoader: false,
        accountItems: [],
        selectedAccountItem: null,
        tacParams: null,
        tacTransferApiParams: null,
        showS2UModal: false,
        s2uResponseObject: null,
        s2uTransactionDetails: [],
        s2uServerDate: "",
        s2uTransactionReferenceNumber: "",
    };

    componentDidMount() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: SCREEN_NAME,
        });
        this._syncAccountItemsToState();
        this._syncASNBTransferStateToScreenState();
    }

    _syncAccountItemsToState = async () => {
        const response = await this._getAccountItems();
        if (response) {
            const accountItems = this._preSelectAccountItem(
                response?.data?.result?.accountListings ?? []
            );
            this.setState({
                accountItems,
                selectedAccountItem: accountItems[0],
            });
        }
    };

    _preSelectAccountItem = (accountItems) => {
        try {
            const {
                route: {
                    params: {
                        asnbTransferState: { selectedCASAAccountNumber },
                    },
                },
            } = this.props;
            let accountNumber = selectedCASAAccountNumber;
            if (!selectedCASAAccountNumber) {
                const walletDetails = this.props.getModel("wallet");
                accountNumber = walletDetails?.primaryAccount?.number ?? "";
            }
            const sortedAccountItems = [...accountItems];
            accountItems.forEach((item, index) => {
                if (item?.number === accountNumber) {
                    sortedAccountItems.splice(index, 1);
                    sortedAccountItems.splice(0, 0, {
                        ...item,
                        selected: true,
                    });
                }
            });
            return sortedAccountItems;
        } catch {
            return accountItems;
        }
    };

    _getAccountItems = async () => {
        try {
            const request = await bankingGetDataMayaM2u("/summary?type=A", true);
            if (request?.status === 200) return request;
            return null;
        } catch (error) {
            showErrorToast({ message: error?.message ?? "" });
            return null;
        }
    };

    _syncASNBTransferStateToScreenState = () => {
        const {
            route: {
                params: {
                    asnbTransferState: {
                        beneficiaryName,
                        idNumberValue,
                        amount,
                        membershipNumberValue,
                        productDetail,
                        purposeOfTransferDetail,
                        relationshipDetail,
                    },
                },
            },
        } = this.props;
        this.setState({
            beneficiaryName,
            idNumber: idNumberValue,
            amount,
            date: moment().format(DATE_FORMAT),
            transferType: "ASNB transfer",
            serviceFee: "RM 1.00",
            membershipNumber: membershipNumberValue,
            productName: productDetail.name,
            relationship: relationshipDetail.name,
            purposeOfTransfer: purposeOfTransferDetail.name,
        });
    };

    _handleHeaderBackButtonPressed = () => this.props.navigation.goBack();

    _generateTranserDetailLayoutItems = () => {
        const { date, transferType, productName, relationship, purposeOfTransfer } = this.state;
        const {
            route: {
                params: {
                    asnbTransferState: { isNewTransfer, isOwnAccountTransfer },
                },
            },
        } = this.props;
        return [
            { title: "Date", value: date },
            { title: "Transfer type", value: transferType },
            { title: "Product name", value: productName },
            ...(isNewTransfer || !isOwnAccountTransfer
                ? [
                      { title: "Relationship", value: relationship },
                      { title: "Purpose of transfer", value: purposeOfTransfer },
                  ]
                : []),
        ];
    };

    _handleTermsAndConditionsToggled = () =>
        this.setState({ isTermsAndConditionsAgreed: !this.state.isTermsAndConditionsAgreed });

    _handleTermsAndConditionsLinkPressed = () =>
        this.props.navigation.navigate(PDF_VIEWER, {
            file: "https://www.maybank2u.com.my/iwov-resources/pdf/personal/ASNB/ASNB_TnC.pdf",
            share: false,
            type: "url",
            title: "Terms & Conditions",
            pdfType: "shareReceipt",
        });

    _handleSelectedAccountSwitch = (selectedAccount) => {
        let selectedIndex = 0;
        const updatedAccountList = this.state.accountItems.map((item, index) => {
            if (item.number === selectedAccount.number) {
                selectedIndex = index;
                return {
                    ...item,
                    selected: true,
                };
            } else {
                return {
                    ...item,
                    selected: false,
                };
            }
        });
        this.setState({
            accountItems: updatedAccountList,
            selectedAccountItem: updatedAccountList[selectedIndex],
        });
    };

    _preparePayload = (s2uCheckRequired) => {
        const { selectedAccountItem, amount } = this.state;
        const {
            route: {
                params: {
                    asnbTransferState: {
                        productDetail,
                        idTypeDetail,
                        relationshipDetail,
                        purposeOfTransferDetail,
                        idNumberValue,
                        membershipNumberValue,
                        beneficiaryName,
                        acctType,
                        isNewTransfer,
                    },
                },
            },
        } = this.props;
        const transferparams = {
            productName: {
                id: productDetail.name,
            },
            idType: {
                id: idTypeDetail.value,
                type: idTypeDetail.name,
            },
            relationship: {
                id: relationshipDetail.value,
                type: relationshipDetail.name,
            },
            purposeTransfer: {
                id: purposeOfTransferDetail.value,
                type: purposeOfTransferDetail.name,
            },
            amount,
            frmAcctNo: selectedAccountItem.number,
            frmAcctCode: selectedAccountItem.code,
            asnbAccountDetail: {
                idType: idTypeDetail.value,
                idNo: idNumberValue,
                payeeCode: productDetail.payeeCode,
                membNo: membershipNumberValue,
                beneName: beneficiaryName,
                shortName: productDetail.shortName,
                fullName: productDetail.fullName,
                acctType,
            },
            favourite: !isNewTransfer,
        };

        if (!isNewTransfer && acctType === "3" && s2uCheckRequired) {
            transferparams.favLimitExceed = "Y";
            transferparams.favourite = false;
        }

        return transferparams;
    };

    _handleTransferConfirmation = async () => {
        const { productName, relationship, purposeOfTransfer } = this.state;
        const {
            route: {
                params: {
                    asnbTransferState: { idTypeDetail, isNewTransfer, acctType },
                    s2uCheckRequired,
                    secure2uValidateData,
                },
            },
        } = this.props;
        const flow = secure2uValidateData?.action_flow;
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: SCREEN_NAME,
            product_name: productName,
            id_type: idTypeDetail?.name,
            relationship,
            transfer_purpose: purposeOfTransfer,
        });
        if (!this.state.isTermsAndConditionsAgreed) {
            showErrorToast({ message: "Please agree to the Terms & Conditions to continue." });
            return;
        }
        this.setState({ showLoader: true });
        const payload = this._preparePayload(s2uCheckRequired);

        //checking for S2U and TAC and favourites
        if (!isNewTransfer && acctType === "3") {
            // checking for Fav with S2U/TAC flow
            this._handleFavFlow(flow, s2uCheckRequired, payload);
        } else {
            this._handle2faFlow(flow, payload);
        }
    };

    _handle2faFlow = (flow, payload) => {
        if (flow === "S2U") {
            // checking for open S2U flow
            this._handleS2UFlow(payload);
        } else {
            // checking for open TAC flow
            this._handleTACFlow(payload);
        }
    };

    _handleFavouriteTransferFlow = async (payload) => {
        try {
            const response = await transferFundToASNB({
                ...payload,
            });
            const {
                route: {
                    params: { asnbTransferState },
                },
                navigation: { navigate },
            } = this.props;
            navigate(FUNDTRANSFER_MODULE, {
                screen: "ASNBTransferAcknowledgementScreen",
                params: {
                    asnbTransferState: {
                        ...asnbTransferState,
                        fundPrice: response?.data?.fundPrice ?? "N/A",
                        unitAllocated: response?.data?.unitAllocated ?? "N/A",
                        salesChargePercentage: response?.data?.saleChargePercentage ?? "N/A",
                        salesChargeAmount: response.data?.saleChargeRm ?? "N/A",
                        sstAmount: response?.data?.sstAmount ?? "N/A",
                    },
                    transactionAcknowledgementDetails: [
                        {
                            title: REFERENCE_ID,
                            value: response?.data?.formattedTransactionRefNumber ?? "N/A",
                        },
                        { title: DATE_TIME, value: response?.data?.serverDate ?? "N/A" },
                    ],
                    isTransactionSuccessful:
                        response?.status === 200 && response?.data?.statusCode === "0",
                    errorMessage: response?.data?.additionalStatusDescription ?? "",
                },
            });
        } catch (error) {
            const errorMsg = errorCodeMap(error)?.message || error?.error?.error?.message;
            showErrorToast({ message: errorMsg });
        } finally {
            this.setState({ showLoader: false });
        }
    };

    _handleS2UFlow = async (payload) => {
        try {
            const response = await transferFundToASNB({
                ...payload,
                twoFAType:
                    this.props.route.params?.secure2uValidateData?.pull === "N"
                        ? "SECURE2U_PUSH"
                        : "SECURE2U_PULL",
                tac: "",
            });
            const s2uServerDate = response?.data?.serverDate ?? "N/A";
            const s2uTransactionReferenceNumber =
                response?.data?.formattedTransactionRefNumber ?? "N/A";
            const s2uToken = response?.data?.pollingToken || response?.data?.token || "";
            if (s2uToken && response?.status === 200 && response?.data?.statusCode === "0") {
                const { productName, beneficiaryName, membershipNumber, selectedAccountItem } =
                    this.state;
                this.setState({
                    showS2UModal: s2uToken !== "",
                    showLoader: false,
                    s2uServerDate,
                    s2uTransactionType: "ASNB Transfer",
                    s2uTransactionReferenceNumber,
                    s2uResponseObject: response?.data,
                    s2uTransactionDetails: [
                        {
                            label: "To",
                            value: `${productName}\n${beneficiaryName}\n${addSpaceAfter4Chars(
                                membershipNumber
                            )}`,
                        },
                        {
                            label: "From",
                            value: `${selectedAccountItem?.name ?? "N/A"}\n${addSpaceAfter4Chars(
                                selectedAccountItem.number.substring(0, 12)
                            )}`,
                        },
                        { label: "Transaction Type", value: "ASNB Transfer" },
                        {
                            label: "Date",
                            value: s2uServerDate,
                        },
                    ],
                });
            } else {
                const {
                    route: {
                        params: { asnbTransferState },
                    },
                    navigation: { navigate },
                } = this.props;
                navigate(FUNDTRANSFER_MODULE, {
                    screen: "ASNBTransferAcknowledgementScreen",
                    params: {
                        asnbTransferState,
                        transactionAcknowledgementDetails: [
                            { title: REFERENCE_ID, value: s2uTransactionReferenceNumber },
                            { title: DATE_TIME, value: s2uServerDate },
                        ],
                        isTransactionSuccessful: false,
                        errorMessage: response?.data?.additionalStatusDescription ?? "",
                    },
                });
            }
        } catch (error) {
            const errorMsg = errorCodeMap(error)?.message || error?.error?.error?.message;
            showErrorToast({ message: errorMsg });
        } finally {
            this.setState({ showLoader: false });
        }
    };

    _handleS2UConfirmation = ({ s2uSignRespone, transactionStatus }) => {
        this.setState({ showS2UModal: false, showLoader: false });
        const {
            route: {
                params: { asnbTransferState },
            },
            navigation: { navigate },
        } = this.props;
        const { s2uServerDate, s2uTransactionReferenceNumber, s2uResponseObject } = this.state;
        if (transactionStatus) {
            const { selectedAccountItem, amount, membershipNumber } = this.state;
            const shortenedSelectedAccountNumber =
                selectedAccountItem?.number?.substring(0, 12) ?? "";
            navigate(FUNDTRANSFER_MODULE, {
                screen: "ASNBTransferAcknowledgementScreen",
                params: {
                    asnbTransferState: {
                        ...asnbTransferState,
                        fundPrice: s2uSignRespone?.asnbTransferReceipt?.fundPrice ?? "N/A",
                        unitAllocated: s2uSignRespone?.asnbTransferReceipt?.unitAllocated ?? "N/A",
                        salesChargePercentage:
                            s2uSignRespone?.asnbTransferReceipt?.saleChargePercentage ?? "N/A",
                        salesChargeAmount:
                            s2uSignRespone?.asnbTransferReceipt?.saleChargeRm ?? "N/A",
                        sstAmount: s2uSignRespone?.asnbTransferReceipt?.sstAmount ?? "N/A",
                        isAlreadyInFavouriteList: s2uResponseObject?.favorite ?? false,
                    },
                    transactionAcknowledgementDetails: [
                        { title: REFERENCE_ID, value: s2uTransactionReferenceNumber },
                        { title: DATE_TIME, value: s2uServerDate },
                    ],
                    isTransactionSuccessful: true,
                    addToFavouriteTACParams: {
                        accCode: selectedAccountItem.code,
                        amount,
                        fromAcctNo: shortenedSelectedAccountNumber,
                        fundTransferType: "ASNB_ADD_FAV",
                        toAcctNo: membershipNumber,
                    },
                    isS2uFlow: true,
                },
            });
        } else {
            navigate(FUNDTRANSFER_MODULE, {
                screen: "ASNBTransferAcknowledgementScreen",
                params: {
                    asnbTransferState,
                    transactionAcknowledgementDetails: [
                        { title: REFERENCE_ID, value: s2uTransactionReferenceNumber },
                        { title: DATE_TIME, value: s2uServerDate },
                    ],
                    isTransactionSuccessful: false,
                    errorMessage: s2uSignRespone?.text ?? "",
                },
            });
        }
    };

    _handleFavFlow = (flow, s2uCheckRequired, payload) => {
        if (s2uCheckRequired) {
            this._handle2faFlow(flow, payload);
        } else {
            this._handleFavouriteTransferFlow(payload);
        }
    };

    _handleTACFlow = async (payload) => {
        const { selectedAccountItem, amount, membershipNumber } = this.state;
        const shortenedSelectedAccountNumber = selectedAccountItem?.number?.substring(0, 12) ?? "";
        const tacParams = {
            accCode: selectedAccountItem.code,
            amount,
            fromAcctNo: shortenedSelectedAccountNumber,
            fundTransferType: this.props.route?.params?.isOwnAccountTransfer
                ? "ASNB_OWN_TRANSFER"
                : "ASNB_PARTY_TRANSFER",
            toAcctNo: membershipNumber,
            payeeName: this.props.route?.params?.asnbTransferState?.beneficiaryName ?? "",
        };
        this.setState({
            tacParams,
            tacTransferApiParams: { ...payload, twoFAType: "TAC" },
        });
    };

    _handleTACSuccessCall = (tacResponse) => {
        this.setState({
            tacParams: null,
            tacTransferApiParams: null,
        });
        if (tacResponse.statusCode === "0") {
            this.props.navigation.navigate(FUNDTRANSFER_MODULE, {
                screen: "ASNBTransferAcknowledgementScreen",
                params: {
                    asnbTransferState: {
                        ...this.props.route.params?.asnbTransferState,
                        fundPrice: tacResponse?.fundPrice ?? "N/A",
                        unitAllocated: tacResponse?.unitAllocated ?? "N/A",
                        salesChargePercentage: tacResponse?.saleChargePercentage ?? "N/A",
                        salesChargeAmount: tacResponse?.saleChargeRm ?? "N/A",
                        sstAmount: tacResponse?.sstAmount ?? "N/A",
                        isAlreadyInFavouriteList: tacResponse?.favorite ?? false,
                    },
                    transactionAcknowledgementDetails: [
                        {
                            title: REFERENCE_ID,
                            value: tacResponse?.formattedTransactionRefNumber ?? "N/A",
                        },
                        { title: DATE_TIME, value: tacResponse?.serverDate ?? "N/A" },
                    ],
                    isTransactionSuccessful: true,
                    addToFavouriteTACParams: {
                        ...this.state.tacParams,
                        fundTransferType: "ASNB_ADD_FAV",
                    },
                },
            });
        } else {
            this.props.navigation.navigate(FUNDTRANSFER_MODULE, {
                screen: "ASNBTransferAcknowledgementScreen",
                params: {
                    asnbTransferState: this.props.route.params.asnbTransferState,
                    transactionAcknowledgementDetails: [
                        {
                            title: REFERENCE_ID,
                            value: tacResponse?.formattedTransactionRefNumber ?? "N/A",
                        },
                        {
                            title: DATE_TIME,
                            value: tacResponse?.serverDate ?? "N/A",
                        },
                    ],
                    isTransactionSuccessful: false,
                    errorMessage: tacResponse?.additionalStatusDescription ?? "N/A",
                },
            });
        }
    };

    _handleTACFailedCall = (tacResponse) => {
        this.props.navigation.navigate(FUNDTRANSFER_MODULE, {
            screen: "ASNBTransferAcknowledgementScreen",
            params: {
                asnbTransferState: this.props.route.params.asnbTransferState,
                transactionAcknowledgementDetails: [
                    {
                        title: REFERENCE_ID,
                        value: tacResponse?.formattedTransactionRefNumber ?? "N/A",
                    },
                    {
                        title: DATE_TIME,
                        value: tacResponse?.serverDate ?? "N/A",
                    },
                ],
                isTransactionSuccessful: false,
                errorMessage: tacResponse?.additionalStatusDescription ?? "N/A",
            },
        });
        this.setState({
            tacParams: null,
            tacTransferApiParams: null,
        });
    };

    _handleTACModalDismissal = () =>
        this.setState({
            tacParams: null,
            tacTransferApiParams: null,
            showLoader: false,
        });

    _handleHeaderCloseButtonPressed = () =>
        this.props.navigation.navigate(FUNDTRANSFER_MODULE, {
            screen: TRANSFER_TAB_SCREEN,
        });

    _handleS2UModalDismissed = () => this.setState({ showS2UModal: false });

    render() {
        const {
            amount,
            beneficiaryName,
            isTermsAndConditionsAgreed,
            accountItems,
            membershipNumber,
            tacParams,
            tacTransferApiParams,
            showS2UModal,
            showLoader,
            s2uResponseObject,
            s2uTransactionDetails,
            selectedAccountItem,
        } = this.state;

        return (
            <>
                <TransferConfirmation
                    headTitle={CONFIRMATION}
                    payLabel={TRANSFER_NOW}
                    amount={amount}
                    onEditAmount={this._handleHeaderBackButtonPressed}
                    logoTitle={beneficiaryName}
                    logoSubtitle={addSpaceAfter4Chars(membershipNumber)}
                    logoImg={{
                        type: "local",
                        source: Assets.asnbLogo,
                    }}
                    onDonePress={this._handleTransferConfirmation}
                    onBackPress={this._handleHeaderBackButtonPressed}
                    onClosePress={this._handleHeaderCloseButtonPressed}
                    accounts={accountItems}
                    extraData={this.state}
                    onAccountListClick={this._handleSelectedAccountSwitch}
                    selectedAccount={null}
                    tacParams={tacParams}
                    transferAPIParams={tacTransferApiParams}
                    transferApi={transferFundToASNB}
                    onTacSuccess={this._handleTACSuccessCall}
                    onTacError={this._handleTACFailedCall}
                    onTacClose={this._handleTACModalDismissal}
                    transactionResponseObject={s2uResponseObject}
                    isShowS2u={showS2UModal}
                    onS2UDone={this._handleS2UConfirmation}
                    onS2UClose={this._handleS2UModalDismissed}
                    s2uExtraParams={{
                        metadata: {
                            amount,
                            fromAcct: selectedAccountItem?.number ?? "",
                            txnType: "ASNB_TRANSFER",
                        },
                    }}
                    transactionDetails={s2uTransactionDetails}
                    isLoading={showLoader}
                    accountListLabel="Transfer from"
                    secure2uValidateData={this.props.route.params?.secure2uValidateData}
                >
                    <View style={styles.transferDetailLayoutContainer}>
                        <TransactionConfirmationDetails
                            details={this._generateTranserDetailLayoutItems()}
                        />
                        <View style={styles.separator} />
                        <TransactionConfirmationNotes
                            noteItems={[
                                "Money withdrawn from your insured deposit(s) is no longer protected by PIDM if transferred to non PIDM members and products.",
                                "For ASNB Forward Price Funds, your subscription will be updated within 2 working days.",
                                "RM 1.00 service charge applies for ASNB Fixed Fund transactions.",
                            ]}
                        />
                        <SpaceFiller height={24} />
                        <TermsAndConditionChecker
                            onLinkPressed={this._handleTermsAndConditionsLinkPressed}
                            onToggle={this._handleTermsAndConditionsToggled}
                            isAgreed={isTermsAndConditionsAgreed}
                        />
                        <SpaceFiller height={24} />
                    </View>
                </TransferConfirmation>
            </>
        );
    }
}

const FLEX_START = "flex-start";

const styles = StyleSheet.create({
    separator: {
        borderBottomWidth: 1,
        borderColor: SWITCH_GREY,
        height: 1,
        marginVertical: 24,
        width: "100%",
    },
    transferDetailLayoutContainer: {
        alignItems: FLEX_START,
        justifyContent: FLEX_START,
        paddingHorizontal: 24,
    },
});

export default withModelContext(ASNBTransferConfirmationScreen);
