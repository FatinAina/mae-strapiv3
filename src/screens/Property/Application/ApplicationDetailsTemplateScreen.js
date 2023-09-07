/* eslint-disable react/prop-types */
import React from "react";
import { Image, Platform, ScrollView, View, StyleSheet } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { FADE_GREY, DARK_GREY, WHITE, YELLOW, SEPARATOR } from "@constants/colors";
import { PROP_LA_INPUT, LOAN_PERIOD, STG_ELIGIBILITY, PROP_LA_RESULT } from "@constants/data";
import {
    ADDITIONAL_FINANCING_INFO_TEXT,
    BANK_SELLING_TEXT,
    BANK_SELLING_TITLE,
    ELIGIBILY_CHECK_EXPIRY_TEXT,
    PUBLIC_SECTOR_FINANC_TEXT,
    SALES_REPRESENTTATIVE,
    VIEW_OR_MANAGE_TEXT,
    YOUR_JOINT_APPLICANT,
    YOUR_MAIN_APPLICANT,
    APPLICATION_CANCEL_TEXT,
    UNABLE_TO_PROCEED_APPLICATION,
    PROPERTY,
    OTHER_RELATED_EXPENSES,
    DOWNPAYMENT,
    PROPERTY_PRICE,
    AD_FINANCING_TYPE,
    PROPERTY_LOAN_AMOUNT,
    MONTHLY_INSTALLMENT,
    FINANCING_PRODUCT,
    SELECTED_HOME_FINANCING,
    BANKS_SELLING_PRICE,
    DOCUMENTS,
    CONTACT_SALES_REPRESENTTATIVE,
    ELIGIBILITY_CHAECK_ON,
    FURTHER_INFORMATION,
    NO_LONGER_JOINT_APPLICANT,
    THIS_APPLICATION_EXPIRED,
    BECUASE_YOU_ARE,
    THIS_APPLICATION_HAS,
    THIS_APPLICATION_IS,
    YOUR_APPLICATION_WAS,
    LOAN_AMOUNT_TEXT,
    CANCELLED_TEXT,
    UNIT_NUMBER,
    STARTED_ON,
    AD_INVALID,
    TERMINATED,
    YOU_VE,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

import ActionTile from "../Common/ActionTile";
import DetailField from "../Common/DetailField";
import AgentInfoTile from "./Common/AgentInfoTile";
import JointApplicantDetail from "./Common/JointApplicantDetail";
import MainApplicantDetail from "./Common/MainApplicantDetail";
import SalesRepEmptyTile from "./Common/SalesRepEmptyTile";
import StatusIndicator from "./Common/StatusIndicator";

// eslint-disable-next-line sonarjs/cognitive-complexity
function ApplicationDetailsTemplateScreen({
    state,
    isCancelled,
    isJointApplicant,
    isMainApplicant,
    wolocStatus,
    isExpired,
    progressStatus,
    jointApplicantInfo,
    params,
    isRemoved,
    fullDataEntryIndicator,
    dispatch,
    agentInfo,
    currentStage,
    showCTA,
    onPressCall,
    onPressMessage,
    onViewDocuments,
    onOpenRemoveJointApplicantPopup,
    onOpenRemindJointApplicantPopup,
    mainApplicantInfo,
    onContinue,
    getStatusData,
}) {
    const onBankSellingIconPress = () => {
        console.log("[ApplicationDetails] >> [onBankSellingIconPress]");
        dispatch({
            actionType: "SHOW_INFO_POPUP",
            payload: {
                infoPopup: true,
                infoPopupTitle: BANK_SELLING_TITLE,
                infoPopupDesc: BANK_SELLING_TEXT,
            },
        });
    };

    return (
        <>
            <ScrollView>
                <View style={Style.horizontalMargin}>
                    {/* Status Pill */}
                    <View
                        style={[
                            Style.statusPillCls,
                            {
                                backgroundColor: state.statusColor,
                            },
                        ]}
                    >
                        <Typo
                            text={state.statusText}
                            fontSize={9}
                            lineHeight={11}
                            numberOfLines={1}
                            color={WHITE}
                        />
                    </View>

                    {/* Property Name */}
                    <Typo
                        fontSize={18}
                        fontWeight="600"
                        lineHeight={25}
                        textAlign="left"
                        text={state.propertyName}
                        style={Style.headerText}
                    />

                    {/* Unit Number */}
                    {state.showUnitNumber && state.unitNumber && (
                        <Typo
                            fontSize={12}
                            lineHeight={18}
                            textAlign="left"
                            text={`${UNIT_NUMBER}: ${state.unitNumber}`}
                            color={FADE_GREY}
                            style={Style.subText}
                        />
                    )}

                    {/* Creation - Date & Time */}
                    {state.startDate && (
                        <Typo
                            fontSize={12}
                            lineHeight={18}
                            textAlign="left"
                            text={`${STARTED_ON} ${state.startDate}`}
                            color={FADE_GREY}
                            style={Style.subText}
                        />
                    )}

                    {/* Cancel/Terminated Date */}

                    {isCancelled && isMainApplicant && !wolocStatus && (
                        <View style={Style.cancelDateCont}>
                            {state.updatedDate
? (
                                <View style={Style.removedTextField}>
                                    <Typo
                                        fontSize={12}
                                        lineHeight={20}
                                        textAlign="center"
                                        fontWeight="600"
                                        text={YOU_VE}
                                    />
                                    <Typo
                                        lineHeight={20}
                                        textAlign="center"
                                        color="red"
                                        text={TERMINATED}
                                        style={Style.leftText}
                                    />
                                    <Typo
                                        fontSize={12}
                                        lineHeight={20}
                                        fontWeight="600"
                                        alignItems="center"
                                        style={Style.leftText}
                                        text={ELIGIBILITY_CHAECK_ON}
                                    />
                                    <Typo
                                        fontSize={12}
                                        lineHeight={20}
                                        fontWeight="600"
                                        alignItems="center"
                                        style={Style.leftText}
                                        text={`${state.updatedDate}`}
                                    />
                                </View>
                            )
: (
                                <Typo
                                    fontSize={12}
                                    lineHeight={20}
                                    fontWeight="600"
                                    text={APPLICATION_CANCEL_TEXT}
                                />
                            )}
                        </View>
                    )}

                    {/* Cancel/Terminated Date */}
                    {isRemoved && !wolocStatus && (
                        <View style={Style.cancelDateCont}>
                            <View style={Style.removedTextField}>
                                <Typo
                                    lineHeight={20}
                                    textAlign="center"
                                    text={THIS_APPLICATION_IS}
                                />

                                <Typo
                                    lineHeight={20}
                                    textAlign="center"
                                    color="red"
                                    text={AD_INVALID}
                                    style={Style.leftText}
                                />
                            </View>

                            <View style={Style.removedTextField}>
                                <Typo lineHeight={20} textAlign="left" text={BECUASE_YOU_ARE} />
                                <Typo
                                    lineHeight={20}
                                    fontWeight="600"
                                    textAlign="left"
                                    text={NO_LONGER_JOINT_APPLICANT}
                                />
                            </View>
                        </View>
                    )}

                    {/* Cancel/Terminated Date */}
                    {isCancelled && isJointApplicant && !wolocStatus && (
                        <View style={Style.cancelDateCont}>
                            {state.updatedDate
? (
                                <>
                                    <View style={Style.removedTextField}>
                                        <Typo
                                            fontSize={12}
                                            lineHeight={18}
                                            fontWeight="600"
                                            textAlign="center"
                                            text={YOUR_APPLICATION_WAS}
                                        />
                                        <Typo
                                            lineHeight={18}
                                            fontSize={12}
                                            textAlign="center"
                                            color="red"
                                            text={CANCELLED_TEXT}
                                            style={Style.leftText}
                                        />
                                        <Typo
                                            fontSize={12}
                                            lineHeight={20}
                                            fontWeight="600"
                                            textAlign="center"
                                            style={Style.leftText}
                                            text="on"
                                        />
                                    </View>
                                    <Typo
                                        fontSize={12}
                                        lineHeight={18}
                                        textAlign="center"
                                        fontWeight="800"
                                        style={Style.leftText}
                                        text={`${state.updatedDate}`}
                                    />
                                </>
                            )
: (
                                <Typo
                                    fontSize={12}
                                    lineHeight={18}
                                    fontWeight="600"
                                    style={Style.leftText}
                                    text={APPLICATION_CANCEL_TEXT}
                                />
                            )}
                        </View>
                    )}

                    {/* Expired*/}
                    {isExpired && isMainApplicant && !wolocStatus && (
                        <View style={Style.cancelDateCont}>
                            <Typo
                                fontSize={12}
                                lineHeight={18}
                                fontWeight="600"
                                text={ELIGIBILY_CHECK_EXPIRY_TEXT}
                            />
                        </View>
                    )}
                    {/*Highliighted text on expired for Joint Applicant*/}
                    {isExpired && isJointApplicant && !wolocStatus && (
                        <View style={Style.cancelDateCont}>
                            <View style={Style.removedTextField}>
                                <Typo
                                    fontSize={12}
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={THIS_APPLICATION_HAS}
                                />
                                <Typo
                                    fontSize={12}
                                    lineHeight={18}
                                    fontWeight="600"
                                    color="red"
                                    text=" expired"
                                />
                            </View>
                            <Typo
                                fontSize={12}
                                lineHeight={18}
                                textAlign="center"
                                fontWeight="800"
                                style={Style.leftText}
                                text={`on ${state.updatedDate}`}
                            />
                        </View>
                    )}

                    {/* Highlighted text on expired scenario */}
                    {isExpired && wolocStatus && (
                        <View style={Style.cancelDateCont}>
                            <Typo
                                fontSize={12}
                                lineHeight={18}
                                fontWeight="600"
                                text={THIS_APPLICATION_EXPIRED}
                            />
                        </View>
                    )}

                    {/* Highlighted text on cancelled scenario */}
                    {isCancelled && wolocStatus && (
                        <View style={Style.cancelDateCont}>
                            <Typo
                                fontSize={12}
                                lineHeight={18}
                                fontWeight="600"
                                text={UNABLE_TO_PROCEED_APPLICATION}
                            />
                            <Typo
                                fontSize={12}
                                lineHeight={18}
                                fontWeight="600"
                                text={CONTACT_SALES_REPRESENTTATIVE}
                            />
                            <Typo
                                fontSize={12}
                                lineHeight={18}
                                fontWeight="600"
                                text={FURTHER_INFORMATION}
                            />
                        </View>
                    )}
                </View>

                {/* Status Detail Indicator */}
                {!isCancelled && !isExpired && !isRemoved && (
                    <StatusIndicator data={state.stepperData} />
                )}

                {/* Loan Details Container */}
                {!wolocStatus && getStatusData() && (
                    <View style={Platform.OS === "ios" ? Style.shadow : {}}>
                        <View
                            style={[
                                Platform.OS === "ios" ? {} : Style.shadow,
                                Style.loanDetailsContainer,
                                Style.horizontalMargin,
                            ]}
                        >
                            {/* Loan Amount Label */}
                            <Typo
                                lineHeight={19}
                                style={Style.loanAmountLabel}
                                text={state.loanAmountLabel}
                            />

                            {/* Loan Amount value */}
                            <Typo
                                fontSize={24}
                                lineHeight={29}
                                fontWeight="bold"
                                style={Style.loanAmount}
                                text={state.loanAmount}
                            />

                            {/* Info container */}

                            {!fullDataEntryIndicator && (
                                <View style={Style.infoNoteContainer}>
                                    <Image
                                        source={Assets.noteInfo}
                                        style={Style.infoIcon}
                                        resizeMode="contain"
                                    />

                                    <Typo
                                        fontSize={12}
                                        textAlign="left"
                                        lineHeight={15}
                                        text={ADDITIONAL_FINANCING_INFO_TEXT}
                                        color={DARK_GREY}
                                        style={Style.infoText}
                                    />
                                </View>
                            )}

                            {/* publicSectorNameFinance info container*/}
                            {state.publicSectorNameFinance && (
                                <View style={Style.infoNoteContainer}>
                                    <Image
                                        source={Assets.noteInfo}
                                        style={Style.infoIcon}
                                        resizeMode="contain"
                                    />

                                    <Typo
                                        fontSize={12}
                                        textAlign="left"
                                        lineHeight={15}
                                        text={PUBLIC_SECTOR_FINANC_TEXT}
                                        color={DARK_GREY}
                                        style={Style.infoText}
                                    />
                                </View>
                            )}

                            {fullDataEntryIndicator && (
                                <>
                                    {/* Loan breakdown */}
                                    <Typo
                                        textAlign="left"
                                        fontSize={12}
                                        lineHeight={18}
                                        color={FADE_GREY}
                                        text={state.breakDownLabel}
                                        style={Style.breakDownHeader}
                                    />

                                    {/* Property */}
                                    <DetailField label={PROPERTY} value={state.propertyAmount} />

                                    {/* Other related expenses */}
                                    <DetailField
                                        label={OTHER_RELATED_EXPENSES}
                                        value={state.otherRelatedExpenses}
                                    />
                                </>
                            )}

                            {/* Gray separator line */}
                            <View style={Style.graySeparator} />

                            {/* Interest Rate */}
                            <DetailField
                                label={state.interestRateLabel}
                                value={state.interestRate}
                                valueSubText1={state.interestRateSubText1}
                                valueSubText2={state.interestRateSubText2}
                                style={Style.firstDetailField}
                            />

                            {/* Loan period */}
                            <DetailField label={state.tenureLabel} value={state.tenure} />

                            {/* Monthly Instalment */}
                            <DetailField
                                label={MONTHLY_INSTALLMENT}
                                value={state.monthlyInstalment}
                                infoNote={state.monthlyInfoNote}
                            />

                            {/* Gray separator line */}
                            <View style={Style.graySeparator} />

                            {/* Property Price */}
                            <DetailField
                                label={PROPERTY_PRICE}
                                value={state.propertyPrice}
                                style={Style.firstDetailField}
                            />

                            {/* Downpayment */}
                            <DetailField label={DOWNPAYMENT} value={state.downpayment} />

                            {/* Bank selling price */}
                            {state.bankSellingPrice?.length > 0 && (
                                <DetailField
                                    label={BANKS_SELLING_PRICE}
                                    value={state.bankSellingPrice}
                                    isShowLeftInfoIcon={true}
                                    onLeftInfoIconPress={onBankSellingIconPress}
                                />
                            )}
                            {/* Financing details */}
                            {/*If progressStatus is LA_RESULT or LA_INPUT or currentStage is Eligibility and financing type and plan are not empty then show Financing Details*/}

                            {(progressStatus === PROP_LA_RESULT ||
                                progressStatus === PROP_LA_INPUT ||
                                currentStage !== STG_ELIGIBILITY) &&
                                state.financingTypeTitle !== "" &&
                                state.financingPlanTitle !== "" && (
                                    <>
                                        {/* Gray separator line */}
                                        <View style={Style.graySeparator} />

                                        {/* Selected home financing */}
                                        <Typo
                                            textAlign="left"
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={SELECTED_HOME_FINANCING}
                                            style={Style.homeFinancingHeader}
                                        />

                                        {/* Financing type */}
                                        <DetailField
                                            label={AD_FINANCING_TYPE}
                                            value={state.financingTypeTitle}
                                        />

                                        {/* Financing product */}
                                        <DetailField
                                            label={FINANCING_PRODUCT}
                                            value={state.financingPlanTitle}
                                        />
                                    </>
                                )}
                        </View>
                    </View>
                )}

                {((isCancelled && wolocStatus) || (isExpired && wolocStatus)) && (
                    <View style={Platform.OS === "ios" ? Style.shadow : {}}>
                        <View
                            style={[
                                Platform.OS === "ios" ? {} : Style.shadow,
                                Style.loanDetailsContainer,
                                Style.horizontalMargin,
                            ]}
                        >
                            {/* Loan Amount Label */}
                            {isCancelled && (
                                <Typo
                                    lineHeight={19}
                                    style={Style.loanAmountLabel}
                                    text={PROPERTY_LOAN_AMOUNT}
                                />
                            )}
                            {isExpired && (
                                <Typo
                                    lineHeight={19}
                                    style={Style.loanAmountLabel}
                                    text={LOAN_AMOUNT_TEXT}
                                />
                            )}

                            {/* Loan Amount value */}
                            <Typo
                                fontSize={24}
                                lineHeight={29}
                                fontWeight="bold"
                                style={Style.loanAmount}
                                text={state.loanAmount}
                            />

                            {/* Gray separator line */}
                            {isExpired && <View style={Style.graySeparator} />}

                            {/* Info container */}
                            {isCancelled && (
                                <View style={Style.infoNoteContainer}>
                                    <Image
                                        source={Assets.noteInfo}
                                        style={Style.infoIcon}
                                        resizeMode="contain"
                                    />

                                    <Typo
                                        fontSize={12}
                                        textAlign="left"
                                        lineHeight={15}
                                        text={ADDITIONAL_FINANCING_INFO_TEXT}
                                        color={DARK_GREY}
                                        style={Style.infoText}
                                    />
                                </View>
                            )}
                            {/* Interest Rate */}
                            <DetailField
                                label={state.interestRateLabel}
                                value={state.interestRate}
                                valueSubText1={state.interestRateSubText1}
                                valueSubText2={state.interestRateSubText2}
                                style={Style.firstDetailField}
                            />

                            {/* Loan period */}
                            <DetailField label={LOAN_PERIOD} value={state.tenure} />

                            {/* Monthly Instalment */}
                            {isCancelled && (
                                <DetailField
                                    label={MONTHLY_INSTALLMENT}
                                    value={state.monthlyInstalment}
                                    infoNote={state.monthlyInfoNote}
                                />
                            )}

                            {isCancelled && (
                                <DetailField
                                    label={MONTHLY_INSTALLMENT}
                                    value={state.monthlyInstalment}
                                />
                            )}

                            {/* Gray separator line */}
                            <View style={Style.graySeparator} />

                            {/* Property Price */}
                            <DetailField
                                label={PROPERTY_PRICE}
                                value={state.propertyPrice}
                                style={Style.firstDetailField}
                            />

                            {/* Downpayment */}
                            <DetailField label={DOWNPAYMENT} value={state.downpayment} />

                            {/* Bank selling price */}
                            {state.bankSellingPrice?.length > 0 && (
                                <DetailField
                                    label={BANKS_SELLING_PRICE}
                                    value={state.bankSellingPrice}
                                    isShowLeftInfoIcon={true}
                                    onLeftInfoIconPress={onBankSellingIconPress}
                                />
                            )}

                            {/* Financing details */}
                            {state.financingTypeTitle !== "" && state.financingPlanTitle !== "" && (
                                <>
                                    {/* Gray separator line */}
                                    <View style={Style.graySeparator} />

                                    {/* Selected home financing */}
                                    <Typo
                                        textAlign="left"
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={SELECTED_HOME_FINANCING}
                                        style={Style.homeFinancingHeader}
                                    />

                                    {/* Financing type */}
                                    <DetailField
                                        label={AD_FINANCING_TYPE}
                                        value={state.financingTypeTitle}
                                    />

                                    {/* Financing product */}
                                    <DetailField
                                        label={FINANCING_PRODUCT}
                                        value={state.financingPlanTitle}
                                    />
                                </>
                            )}
                        </View>
                    </View>
                )}

                {/* Documents */}
                <ActionTile
                    header={DOCUMENTS}
                    description={VIEW_OR_MANAGE_TEXT}
                    style={Style.documentTile}
                    icon={Assets.documents}
                    onPress={onViewDocuments}
                    shadow
                />

                {/* Main Applicant */}
                {isMainApplicant &&
                    jointApplicantInfo !== null &&
                    jointApplicantInfo?.customerId !== null && (
                        <>
                            {/* Gray separator line */}
                            <View style={[Style.graySeparatorBig, Style.horizontalMargin]} />
                            <View style={Style.detailsInfo}>
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={20}
                                    text={YOUR_JOINT_APPLICANT}
                                    textAlign="left"
                                    style={Style.horizontalMargin}
                                />

                                <JointApplicantDetail
                                    jointApplicantInfo={state.jointApplicantInfo}
                                    status={params?.savedData?.status}
                                    jaStatus={params?.savedData?.jaStatus}
                                    isAccepted={state.isAccepted}
                                    isRemind={state.isAccepted}
                                    isCancelled={isCancelled}
                                    removeOpenJointApplicant={onOpenRemoveJointApplicantPopup}
                                    remindOpenJointApplicant={onOpenRemindJointApplicantPopup}
                                />
                            </View>
                        </>
                    )}

                {/* Joint Applicant */}
                {isJointApplicant && mainApplicantInfo?.customerId !== null && (
                    <>
                        <View style={[Style.graySeparatorBig, Style.horizontalMargin]} />
                        <View style={Style.detailsInfo}>
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={20}
                                text={YOUR_MAIN_APPLICANT}
                                textAlign="left"
                                style={Style.horizontalMargin}
                            />
                            <MainApplicantDetail mainApplicantInfo={mainApplicantInfo} />
                        </View>
                    </>
                )}

                {/* Gray separator line */}
                <View style={[Style.graySeparatorBig, Style.horizontalMargin]} />

                {/* Sales Representative */}
                <Typo
                    fontSize={16}
                    fontWeight="600"
                    lineHeight={20}
                    text={SALES_REPRESENTTATIVE}
                    textAlign="left"
                    style={Style.horizontalMargin}
                />

                {/* <SalesRepEmptyTile /> */}
                {agentInfo
? (
                    <AgentInfoTile
                        agentInfo={agentInfo}
                        onPressCall={onPressCall}
                        onPressMessage={onPressMessage}
                        isRemoved={isRemoved}
                        isCancelled={isCancelled}
                    />
                )
: (
                    <SalesRepEmptyTile />
                )}
            </ScrollView>

            {showCTA && (
                <FixedActionContainer>
                    <ActionButton
                        fullWidth
                        componentCenter={
                            <Typo lineHeight={18} fontWeight="600" text={state.ctaText} />
                        }
                        onPress={onContinue}
                    />
                </FixedActionContainer>
            )}
        </>
    );
}

export default ApplicationDetailsTemplateScreen;

const Style = StyleSheet.create({
    breakDownHeader: {
        marginHorizontal: 20,
        marginTop: 16,
    },

    cancelDateCont: {
        backgroundColor: YELLOW,
        borderRadius: 8,
        marginTop: 15,
        opacity: 0.6,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    detailsInfo: {
        flex: 1,
        flexDirection: "column",
    },

    documentTile: {
        marginBottom: 0,
        marginTop: 15,
    },

    firstDetailField: {
        marginTop: 0,
    },

    graySeparator: {
        borderColor: SEPARATOR,
        borderTopWidth: 1,
        flex: 1,
        height: 1,
        marginVertical: 15,
    },

    graySeparatorBig: {
        borderColor: SEPARATOR,
        borderTopWidth: 1,
        flex: 1,
        height: 1,
        marginVertical: 25,
    },

    headerText: {
        marginTop: 12,
    },

    homeFinancingHeader: {
        marginHorizontal: 20,
    },

    horizontalMargin: {
        marginHorizontal: 24,
    },

    infoIcon: {
        height: 16,
        width: 16,
    },

    infoNoteContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        marginBottom: 5,
        marginHorizontal: 20,
        marginTop: 15,
    },

    infoText: {
        marginLeft: 8,
    },

    leftText: {
        marginLeft: 5,
    },

    loanAmount: {
        marginTop: 10,
    },
    loanAmountLabel: {
        marginTop: 15,
    },

    loanDetailsContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        marginTop: 15,
        paddingBottom: 15,
    },

    removedTextField: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        textAlign: "center",
    },
    shadow: {
        ...getShadow({
            elevation: 8,
        }),
    },
    statusPillCls: {
        alignItems: "center",
        borderRadius: 50,
        height: 22,
        justifyContent: "center",
        width: 60,
    },
    subText: {
        marginTop: 5,
    },
});
