/* eslint-disable sonarjs/cognitive-complexity */

/* eslint-disable react/prop-types */

/* eslint-disable react/react-in-jsx-scope */
import React from "react";
import { View, Platform, Image, StyleSheet } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { FAProperty } from "@services/analytics/analyticsProperty";

import { WHITE, SEPARATOR, GREY, DARK_GREY, YELLOW } from "@constants/colors";
import {
    STATUS_PASS,
    STATUS_SOFT_FAIL,
    STATUS_HARD_FAIL,
    AMBER,
    ELIGIBILTY_STATUS_ELIGIBLE,
    ELIGIBILTY_STATUS_GREEN,
} from "@constants/data";
import {
    REQUEST_FOR_ASSISTANCE_DESC,
    ADD_NEW_JOINT_APPLICANT,
    VIEW_OTHER_PROPERTIES,
    REQ_ASSISTANCE_TEXT,
    PROCEED_WITH_APPLICATION,
    ADDITIONAL_FINANCING_INFO,
    PUBLIC_SECTOR_FINANC_TEXT,
    MONTHLY_INSTALMENT_INFO,
    ADD_JOINT_APPLICANT,
    ADD_JOINT_APPLICANT_TEXT,
    OTHER_PROPERTIES,
    SALES_REP_TEXT,
    YOUR_JOINT_APPLICANT,
    BETTER_OFFER_TEXT,
    VIEW_OFFER_CONDITIONS,
    SALES_REP_DESC,
    INFO_NOTE,
    ELIGIBLE_FOR_HOME_FINANCING,
    DOWNPAYMENT,
    PROPERTY_PRICE,
    MONTHLY_INSTALLMENT,
    PROPERTY_FIANANCING_AMOUNT,
    EFFECTIVE_PROFIT_RATE,
    ADD_PROMO,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

import ActionTile from "../Common/ActionTile";
import DetailField from "../Common/DetailField";

function CEResultApplicantTemplate({
    state,
    onPressViewOtherProperties,
    onApplyLoan,
    onPressAddJointApplicant,
    onPressRequestForAssistance,
    onTenurePress,
    onDownpaymentPress,
    status,
    navParams,
    onOpenRemoveJointApplicantPopup,
    onViewOfferDisclaimer,
    onMainApplyLoan,
    eligibilityStatus,
    JointApplicantDetail,
    AddPromoRow,
}) {
    const onAddPromoPress = () => {
        console.log("[CEResult] >> [onAddPromoPress]");
        // add promo only for pass and soft fail status
        const currentScreenName = navParams?.currentScreenName;
        const screenName = FAProperty.getScreenName(currentScreenName, status);
        FAProperty.onPressSelectAction(screenName, ADD_PROMO, navParams?.stpApplicationId);
    };

    return (
        <>
            {/* Single Applicant View */}
            {!state.isJointApplicantAdded && eligibilityStatus !== ELIGIBILTY_STATUS_ELIGIBLE ? (
                <View>
                    <View style={Style.horizontalMarginBig}>
                        {/* Header Text */}
                        <Typo
                            fontSize={16}
                            fontWeight="600"
                            lineHeight={20}
                            text={state.headerText}
                            textAlign="left"
                        />

                        {/* Sub Text 1 */}
                        <Typo
                            lineHeight={22}
                            textAlign="left"
                            style={Style.subText1}
                            text={state.subText1}
                        />

                        {/* View offer disclaimer */}
                        {status !== STATUS_HARD_FAIL && (
                            <>
                                <Typo
                                    lineHeight={18}
                                    textAlign="left"
                                    text={VIEW_OFFER_CONDITIONS}
                                    fontWeight="bold"
                                    style={Style.textUnderline}
                                    onPress={onViewOfferDisclaimer}
                                />
                                {status !== STATUS_PASS && (
                                    <Typo
                                        lineHeight={18}
                                        textAlign="left"
                                        style={Style.subText1}
                                        text={state.otherOptionText}
                                    />
                                )}
                            </>
                        )}

                        {/* Sub Text 2 */}
                        <Typo
                            lineHeight={22}
                            textAlign="left"
                            style={state.subText2 ? Style.subText2 : Style.subText2Hide}
                            text={state.subText2 ? state.subText2 : ""}
                        />
                    </View>
                    {status !== STATUS_HARD_FAIL && (
                        <>
                            {/* Loan Details Container */}
                            <View style={Platform.OS === "ios" ? Style.shadow : {}}>
                                <View
                                    style={[
                                        Platform.OS === "ios" ? {} : Style.shadow,
                                        Style.loanDetailsContainer,
                                        Style.horizontalMargin,
                                    ]}
                                >
                                    {/* Property Name */}
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={state.propertyName}
                                        style={Style.propertyName}
                                    />

                                    {/* Financing Amount Label */}
                                    <Typo
                                        lineHeight={19}
                                        style={Style.loanAmountLabel}
                                        text={PROPERTY_FIANANCING_AMOUNT}
                                    />

                                    {/* Financing Amount value */}
                                    <Typo
                                        fontSize={24}
                                        lineHeight={29}
                                        fontWeight="bold"
                                        style={Style.loanAmount}
                                        text={state.loanAmountFormatted}
                                    />

                                    {/* Info container */}
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
                                            text={ADDITIONAL_FINANCING_INFO}
                                            color={DARK_GREY}
                                            style={Style.infoText}
                                        />
                                    </View>

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

                                    {/* Gray separator line */}
                                    <View style={Style.graySeparator} />

                                    {/* profit Rate */}
                                    <DetailField
                                        label={EFFECTIVE_PROFIT_RATE}
                                        value={state.interestRateFormatted}
                                        valueSubText1={state.baseRateFormatted}
                                        valueSubText2={state.spreadRateFormatted}
                                    />

                                    {/* Tenure */}
                                    <DetailField
                                        label={state.tenureLabel}
                                        value={state.tenureFormatted}
                                        isEditable={state.tenureEditable}
                                        onValuePress={state.tenureEditable && onTenurePress}
                                    />

                                    {/* Monthly Instalment */}
                                    <DetailField
                                        label={MONTHLY_INSTALLMENT}
                                        value={state.monthlyInstalmentFormatted}
                                        infoNote={MONTHLY_INSTALMENT_INFO}
                                    />

                                    {/* Gray separator line */}
                                    <View style={Style.graySeparator} />

                                    {/* Property Price */}
                                    <DetailField
                                        label={PROPERTY_PRICE}
                                        value={state.propertyPriceFormatted}
                                    />

                                    {/* Downpayment */}
                                    <DetailField
                                        label={DOWNPAYMENT}
                                        value={state.downpaymentFormatted}
                                        isEditable={state.downpaymentEditable}
                                        onValuePress={
                                            state.downpaymentEditable && onDownpaymentPress
                                        }
                                        infoNote={state.downpaymentInfoNote}
                                    />
                                </View>
                            </View>

                            {/* Add Promo */}
                            {/* Can be visible only in Eligible View */}
                            {status === STATUS_PASS && !navParams?.declinedFromJa && (
                                <View style={Platform.OS === "ios" ? Style.shadow : {}}>
                                    <View style={Platform.OS === "ios" ? {} : Style.shadow}>
                                        <AddPromoRow onPress={onAddPromoPress} />
                                    </View>
                                </View>
                            )}

                            {/* show Joint Applicant details*/}

                            {state.isMainApplicant &&
                                state.isJointApplicantAdded &&
                                navParams?.subModule !== "JA_ELIG_FAIL" && (
                                    <View>
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
                                            removeOpenJointApplicant={
                                                onOpenRemoveJointApplicantPopup
                                            }
                                        />

                                        {/* Gray separator line */}
                                        <View style={Style.graySeparator} />
                                    </View>
                                )}
                            {/* proceed with application btn*/}
                            <View style={Style.horizontalMargin}>
                                {status !== STATUS_HARD_FAIL && state.isJARemoved && (
                                    <ActionButton
                                        fullWidth
                                        backgroundColor={YELLOW}
                                        componentCenter={
                                            <Typo
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={PROCEED_WITH_APPLICATION}
                                            />
                                        }
                                        onPress={onApplyLoan}
                                        style={Style.viewOtherBtn}
                                    />
                                )}
                                {/* view other properties btn*/}
                                {navParams?.declinedFromJa && (
                                    <ActionButton
                                        fullWidth
                                        backgroundColor={WHITE}
                                        borderStyle="solid"
                                        borderWidth={1}
                                        borderColor={GREY}
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={VIEW_OTHER_PROPERTIES}
                                            />
                                        }
                                        onPress={onPressViewOtherProperties}
                                        style={Style.viewOtherBtn}
                                    />
                                )}
                                {/*better offer text*/}
                                {status === STATUS_SOFT_FAIL && state.isJARemoved && (
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={20}
                                        text={BETTER_OFFER_TEXT}
                                        textAlign="center"
                                        style={Style.viewOtherBtn}
                                    />
                                )}
                                {/*view other properties btn for softfail*/}
                                {status === STATUS_SOFT_FAIL &&
                                    !state.isJARemoved &&
                                    !navParams?.declinedFromJa && (
                                        <ActionButton
                                            fullWidth
                                            backgroundColor={WHITE}
                                            borderStyle="solid"
                                            borderWidth={1}
                                            borderColor={GREY}
                                            componentCenter={
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    text={VIEW_OTHER_PROPERTIES}
                                                />
                                            }
                                            onPress={onPressViewOtherProperties}
                                            style={Style.viewOtherBtn}
                                        />
                                    )}
                                {/*proceed with application btn*/}
                                {status !== STATUS_HARD_FAIL && !state.isJARemoved && (
                                    <ActionButton
                                        fullWidth
                                        backgroundColor={YELLOW}
                                        componentCenter={
                                            <Typo
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={PROCEED_WITH_APPLICATION}
                                            />
                                        }
                                        onPress={onApplyLoan}
                                    />
                                )}
                            </View>
                            {/*add joint applicant btn*/}
                            {status !== STATUS_HARD_FAIL &&
                                status !== STATUS_PASS &&
                                state.isJARemoved &&
                                state.isJAButtonEnabled && (
                                    <ActionTile
                                        header={ADD_JOINT_APPLICANT}
                                        description={ADD_JOINT_APPLICANT_TEXT}
                                        icon={Assets.jointApplicant}
                                        style={Style.TileBtn}
                                        onPress={onPressAddJointApplicant}
                                    />
                                )}
                            {/*view other properties btn*/}
                            {status === STATUS_SOFT_FAIL && state.isJARemoved && (
                                <ActionTile
                                    header={VIEW_OTHER_PROPERTIES}
                                    description={OTHER_PROPERTIES}
                                    icon={Assets.otherPropIcon}
                                    style={Style.TileBtn}
                                    onPress={onPressViewOtherProperties}
                                />
                            )}
                            {/*it can view only for Eligible(Pass Scenario)*/}
                            {status === STATUS_PASS &&
                                state.isJARemoved &&
                                state.isRFASwitchEnabled && (
                                    <>
                                        {/* Gray separator line */}
                                        <View
                                            style={[Style.graySeparator, Style.horizontalMargin]}
                                        />
                                        {/* What other... */}
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={20}
                                            textAlign="left"
                                            style={[Style.optionHeader, Style.horizontalMarginBig]}
                                            text={state.otherOptionText}
                                        />
                                        <Typo
                                            lineHeight={22}
                                            textAlign="left"
                                            style={[Style.optionHeader, Style.horizontalMarginBig]}
                                            text={SALES_REP_TEXT}
                                        />
                                    </>
                                )}

                            {/* Button Container */}
                            {status !== STATUS_HARD_FAIL &&
                                state.isJAButtonEnabled &&
                                navParams?.declinedFromJa && (
                                    <ActionTile
                                        header={ADD_JOINT_APPLICANT}
                                        description={ADD_JOINT_APPLICANT_TEXT}
                                        icon={Assets.jointApplicant}
                                        style={Style.JATile}
                                        onPress={onPressAddJointApplicant}
                                    />
                                )}

                            {status !== STATUS_HARD_FAIL &&
                                state.isJARemoved &&
                                state.isRFASwitchEnabled && (
                                    <ActionTile
                                        header={REQ_ASSISTANCE_TEXT}
                                        description={REQUEST_FOR_ASSISTANCE_DESC}
                                        icon={Assets.addAssistanceIcon}
                                        style={Style.additionalIncomeTile}
                                        onPress={onPressRequestForAssistance}
                                    />
                                )}
                        </>
                    )}
                    {/* Button Container if STATUS_HARD_FAIL */}
                    {status === STATUS_HARD_FAIL && (
                        <View style={Style.horizontalMargin}>
                            {!state.isJARemoved && !navParams?.declinedFromJa && (
                                <ActionButton
                                    fullWidth
                                    backgroundColor={WHITE}
                                    borderStyle="solid"
                                    borderWidth={1}
                                    borderColor={GREY}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={VIEW_OTHER_PROPERTIES}
                                        />
                                    }
                                    onPress={onPressViewOtherProperties}
                                    style={Style.viewOtherBtn}
                                />
                            )}
                            {/*view other properties btn when JA removed*/}
                            {state.isJARemoved && (
                                <ActionButton
                                    fullWidth
                                    backgroundColor={WHITE}
                                    style={Style.applyBtn}
                                    componentCenter={
                                        <Typo
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={VIEW_OTHER_PROPERTIES}
                                        />
                                    }
                                    onPress={onPressViewOtherProperties}
                                />
                            )}
                            {/*view other properties btn*/}
                            {navParams?.declinedFromJa && (
                                <ActionButton
                                    fullWidth
                                    backgroundColor={WHITE}
                                    borderStyle="solid"
                                    borderWidth={1}
                                    borderColor={GREY}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={VIEW_OTHER_PROPERTIES}
                                        />
                                    }
                                    onPress={onPressViewOtherProperties}
                                    style={Style.viewOtherBtn}
                                />
                            )}

                            <ActionButton
                                fullWidth
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typo
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={PROCEED_WITH_APPLICATION}
                                    />
                                }
                                onPress={onApplyLoan}
                                style={Style.viewOtherBtn}
                            />
                            {/*add new Joint applicant btn when JA btn got enabled and JA removed*/}
                            {state.isJARemoved && state.isJAButtonEnabled && (
                                <ActionButton
                                    fullWidth
                                    backgroundColor={YELLOW}
                                    style={Style.applyBtn}
                                    componentCenter={
                                        <Typo
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={ADD_NEW_JOINT_APPLICANT}
                                        />
                                    }
                                    onPress={onPressAddJointApplicant}
                                />
                            )}
                            {/*add new Joint applicant btn when JA btn got enabled and JA has declined*/}
                            {navParams?.declinedFromJa && state.isJAButtonEnabled && (
                                <ActionButton
                                    fullWidth
                                    backgroundColor={YELLOW}
                                    style={Style.applyBtn}
                                    componentCenter={
                                        <Typo
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={ADD_NEW_JOINT_APPLICANT}
                                        />
                                    }
                                    onPress={onPressAddJointApplicant}
                                />
                            )}
                        </View>
                    )}
                    {/* Add a joint applicant to be shown in case of hard fail */}
                    {status === STATUS_HARD_FAIL && state.isRFASwitchEnabled && (
                        <ActionTile
                            header={REQ_ASSISTANCE_TEXT}
                            description={REQUEST_FOR_ASSISTANCE_DESC}
                            icon={Assets.addAssistanceIcon}
                            style={Style.additionalIncomeTile}
                            onPress={onPressRequestForAssistance}
                        />
                    )}
                    {/* Add a joint applicant to be shown in case of soft fail or hard fail */}
                    {status !== STATUS_PASS &&
                        !state.jointApplicantInfo?.customerId &&
                        state.isJAButtonEnabled &&
                        !navParams?.declinedFromJa &&
                        !state.isJARemoved && (
                            <ActionTile
                                header={ADD_JOINT_APPLICANT}
                                description={ADD_JOINT_APPLICANT_TEXT}
                                icon={Assets.jointApplicant}
                                style={Style.JATile}
                                onPress={onPressAddJointApplicant}
                            />
                        )}
                    {/*Applicable for Eligible Scenario(Status pass)*/}
                    {status === STATUS_PASS &&
                        !navParams?.declinedFromJa &&
                        !state.isJARemoved &&
                        state.isRFASwitchEnabled && (
                            <>
                                {/* Gray separator line */}
                                <View style={[Style.graySeparator, Style.horizontalMargin]} />

                                {/* What other... */}

                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={20}
                                    textAlign="left"
                                    style={[Style.optionHeader, Style.horizontalMarginBig]}
                                    text={state.otherOptionText}
                                />
                                <Typo
                                    lineHeight={22}
                                    textAlign="left"
                                    style={[Style.optionHeader, Style.horizontalMarginBig]}
                                    text={SALES_REP_TEXT}
                                />
                            </>
                        )}
                    {/* Request assistance to be shown in case of pass or soft fail */}

                    {status !== STATUS_HARD_FAIL &&
                        !state.isJARemoved &&
                        state.isRFASwitchEnabled && (
                            <ActionTile
                                header={REQ_ASSISTANCE_TEXT}
                                description={SALES_REP_DESC}
                                icon={Assets.addIncomeIcon}
                                style={Style.additionalIncomeTile}
                                onPress={onPressRequestForAssistance}
                            />
                        )}
                </View>
            ) : (eligibilityStatus === AMBER || eligibilityStatus === ELIGIBILTY_STATUS_GREEN) &&
              state.isMainEligDataType === STATUS_HARD_FAIL &&
              status === STATUS_HARD_FAIL &&
              state.isJointApplicantAdded ? (
                <>
                    <View style={Style.horizontalMarginBig}>
                        {/* Header Text */}
                        <Typo
                            fontSize={16}
                            fontWeight="600"
                            lineHeight={20}
                            text={state.headerText}
                            textAlign="left"
                        />

                        {/* Sub Text 1 */}
                        <Typo
                            lineHeight={22}
                            textAlign="left"
                            style={Style.subText1}
                            text={state.subText1}
                        />

                        {/* Sub Text 2 */}
                        <Typo
                            lineHeight={22}
                            textAlign="left"
                            style={Style.subText1}
                            text={state.subText2}
                        />
                    </View>
                    {/* Button Container */}
                    <View style={Style.horizontalMargin}>
                        <ActionButton
                            fullWidth
                            backgroundColor={WHITE}
                            borderStyle="solid"
                            borderWidth={1}
                            borderColor={GREY}
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={VIEW_OTHER_PROPERTIES}
                                />
                            }
                            onPress={onPressViewOtherProperties}
                            style={Style.viewOtherBtn}
                        />

                        <ActionButton
                            fullWidth
                            backgroundColor={YELLOW}
                            componentCenter={
                                <Typo
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={PROCEED_WITH_APPLICATION}
                                />
                            }
                            onPress={onApplyLoan}
                            style={Style.viewOtherBtn}
                        />

                        {state.isJAButtonEnabled && (
                            <ActionButton
                                fullWidth
                                backgroundColor={YELLOW}
                                style={Style.applyBtn}
                                componentCenter={
                                    <Typo
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={ADD_NEW_JOINT_APPLICANT}
                                    />
                                }
                                onPress={onPressAddJointApplicant}
                            />
                        )}
                    </View>
                    {state.isRFASwitchEnabled && (
                        <ActionTile
                            header={REQ_ASSISTANCE_TEXT}
                            description={REQUEST_FOR_ASSISTANCE_DESC}
                            icon={Assets.addAssistanceIcon}
                            style={Style.additionalIncomeTile}
                            onPress={onPressRequestForAssistance}
                        />
                    )}
                </>
            ) : (eligibilityStatus === AMBER || eligibilityStatus === ELIGIBILTY_STATUS_GREEN) &&
              state.isMainEligDataType === STATUS_SOFT_FAIL &&
              status === STATUS_HARD_FAIL &&
              state.isJointApplicantAdded ? (
                <>
                    <View>
                        <View style={Style.horizontalMarginBig}>
                            {/* Header Text */}
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={20}
                                text={state.headerText}
                                textAlign="left"
                            />

                            {/* Sub Text 1 */}
                            <Typo
                                lineHeight={22}
                                textAlign="left"
                                style={Style.subText1}
                                text={state.subText1}
                            />
                            {/* View offer disclaimer */}
                            <Typo
                                lineHeight={18}
                                textAlign="left"
                                text={VIEW_OFFER_CONDITIONS}
                                fontWeight="bold"
                                style={Style.textUnderline}
                                onPress={onViewOfferDisclaimer}
                            />
                            {/* Sub Text 2 */}
                            <Typo
                                lineHeight={22}
                                textAlign="left"
                                style={state.subText2 ? Style.subText2 : Style.subText2Hide}
                                text={state.subText2 ? state.subText2 : ""}
                            />
                        </View>
                        <View style={Platform.OS === "ios" ? Style.shadow : {}}>
                            <View
                                style={[
                                    Platform.OS === "ios" ? {} : Style.shadow,
                                    Style.loanDetailsContainer,
                                    Style.horizontalMargin,
                                ]}
                            >
                                {/* Property Name */}
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={state.propertyName}
                                    style={Style.propertyName}
                                />

                                {/* Financing Amount Label */}
                                <Typo
                                    lineHeight={19}
                                    style={Style.loanAmountLabel}
                                    text={PROPERTY_FIANANCING_AMOUNT}
                                />

                                {/* Financing Amount value */}
                                <Typo
                                    fontSize={24}
                                    lineHeight={29}
                                    fontWeight="bold"
                                    style={Style.loanAmount}
                                    text={state.loanAmountFormatted}
                                />

                                {/* Info container */}
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
                                        text={ADDITIONAL_FINANCING_INFO}
                                        color={DARK_GREY}
                                        style={Style.infoText}
                                    />
                                </View>

                                {/* Gray separator line */}
                                <View style={Style.graySeparator} />

                                {/* profit Rate */}
                                <DetailField
                                    label={EFFECTIVE_PROFIT_RATE}
                                    value={state.interestRateFormatted}
                                    valueSubText1={state.baseRateFormatted}
                                    valueSubText2={state.spreadRateFormatted}
                                />

                                {/* Tenure */}
                                <DetailField
                                    label={state.tenureLabel}
                                    value={state.tenureFormatted}
                                    isEditable={state.tenureEditable}
                                    onValuePress={state.tenureEditable && onTenurePress}
                                />

                                {/* Monthly Instalment */}
                                <DetailField
                                    label={MONTHLY_INSTALLMENT}
                                    value={state.monthlyInstalmentFormatted}
                                    infoNote={MONTHLY_INSTALMENT_INFO}
                                />

                                {/* Gray separator line */}
                                <View style={Style.graySeparator} />

                                {/* Property Price */}
                                <DetailField
                                    label={PROPERTY_PRICE}
                                    value={state.propertyPriceFormatted}
                                />

                                {/* Downpayment */}
                                <DetailField
                                    label={DOWNPAYMENT}
                                    value={state.downpaymentFormatted}
                                    isEditable={state.downpaymentEditable}
                                    onValuePress={state.downpaymentEditable && onDownpaymentPress}
                                    infoNote={state.downpaymentInfoNote}
                                />
                            </View>
                        </View>

                        {/* Button Container */}
                        <View style={Style.horizontalMargin}>
                            <ActionButton
                                fullWidth
                                backgroundColor={WHITE}
                                borderStyle="solid"
                                borderWidth={1}
                                borderColor={GREY}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={VIEW_OTHER_PROPERTIES}
                                    />
                                }
                                onPress={onPressViewOtherProperties}
                                style={Style.viewOtherBtn}
                            />

                            <ActionButton
                                fullWidth
                                backgroundColor={YELLOW}
                                style={Style.applyBtn}
                                componentCenter={
                                    <Typo
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={PROCEED_WITH_APPLICATION}
                                    />
                                }
                                onPress={onApplyLoan}
                            />
                        </View>
                        {navParams?.subModule !== "JA_ELIG_FAIL" && (
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={20}
                                text={BETTER_OFFER_TEXT}
                                textAlign="left"
                                style={Style.horizontalMargin}
                            />
                        )}

                        {state.isJAButtonEnabled && (
                            <ActionTile
                                header={ADD_JOINT_APPLICANT}
                                description={ADD_JOINT_APPLICANT_TEXT}
                                icon={Assets.jointApplicant}
                                style={Style.JATile}
                                onPress={onPressAddJointApplicant}
                            />
                        )}
                        {state.isRFASwitchEnabled && (
                            <ActionTile
                                header={REQ_ASSISTANCE_TEXT}
                                description={REQUEST_FOR_ASSISTANCE_DESC}
                                icon={Assets.addAssistanceIcon}
                                style={Style.additionalIncomeTile}
                                onPress={onPressRequestForAssistance}
                            />
                        )}
                    </View>
                </>
            ) : (eligibilityStatus === AMBER || eligibilityStatus === ELIGIBILTY_STATUS_GREEN) &&
              (state.isMainEligDataType === STATUS_SOFT_FAIL ||
                  state.isMainEligDataType === STATUS_PASS) &&
              (status === STATUS_PASS || status === STATUS_SOFT_FAIL) &&
              state.isJointApplicantAdded ? (
                <>
                    <View>
                        <View style={Style.horizontalMarginBig}>
                            {/* Header Text */}
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={20}
                                text={state.headerText}
                                textAlign="left"
                                style={Style.applyBtn}
                            />
                            <Typo textAlign="left" fontSize={16} lineHeight={22}>
                                {/* Sub Text 1 */}
                                <Typo
                                    lineHeight={22}
                                    textAlign="left"
                                    style={Style.subText1}
                                    text={state.subText1}
                                />
                                {status === STATUS_PASS && !navParams?.jaEligResult && (
                                    <>
                                        <Typo
                                            lineHeight={20}
                                            fontWeight="600"
                                            textAlign="left"
                                            text={` ${state.jointApplicantInfo.customerName}`}
                                        />

                                        <Typo
                                            lineHeight={20}
                                            textAlign="left"
                                            text={ELIGIBLE_FOR_HOME_FINANCING}
                                        />
                                    </>
                                )}
                            </Typo>

                            {/* View offer disclaimer */}
                            <Typo
                                lineHeight={18}
                                textAlign="left"
                                text={VIEW_OFFER_CONDITIONS}
                                fontWeight="bold"
                                style={Style.textUnderline}
                                onPress={onViewOfferDisclaimer}
                            />
                            {/* Sub Text 2 */}
                            <Typo
                                lineHeight={22}
                                textAlign="left"
                                style={state.subText2 ? Style.subText2 : Style.subText2Hide}
                                text={state.subText2 ? state.subText2 : ""}
                            />
                        </View>
                        <View style={Platform.OS === "ios" ? Style.shadow : {}}>
                            <View
                                style={[
                                    Platform.OS === "ios" ? {} : Style.shadow,
                                    Style.loanDetailsContainer,
                                    Style.horizontalMargin,
                                ]}
                            >
                                {/* Property Name */}
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={state.propertyName}
                                    style={Style.propertyName}
                                />

                                {/* Financing Amount Label */}
                                <Typo
                                    lineHeight={19}
                                    style={Style.loanAmountLabel}
                                    text={PROPERTY_FIANANCING_AMOUNT}
                                />

                                {/* Financing Amount value */}
                                <Typo
                                    fontSize={24}
                                    lineHeight={29}
                                    fontWeight="bold"
                                    style={Style.loanAmount}
                                    text={state.loanAmountFormatted}
                                />

                                {/* Info container */}
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
                                        text={ADDITIONAL_FINANCING_INFO}
                                        color={DARK_GREY}
                                        style={Style.infoText}
                                    />
                                </View>

                                {/* Gray separator line */}
                                <View style={Style.graySeparator} />

                                {/* profit Rate */}
                                <DetailField
                                    label={EFFECTIVE_PROFIT_RATE}
                                    value={state.interestRateFormatted}
                                    valueSubText1={state.baseRateFormatted}
                                    valueSubText2={state.spreadRateFormatted}
                                />

                                {/* Tenure */}
                                <DetailField
                                    label={state.tenureLabel}
                                    value={state.tenureFormatted}
                                    isEditable={state.tenureEditable}
                                    onValuePress={state.tenureEditable && onTenurePress}
                                />

                                {/* Monthly Instalment */}
                                <DetailField
                                    label={MONTHLY_INSTALLMENT}
                                    value={state.monthlyInstalmentFormatted}
                                    infoNote={MONTHLY_INSTALMENT_INFO}
                                />

                                {/* Gray separator line */}
                                <View style={Style.graySeparator} />

                                {/* Property Price */}
                                <DetailField
                                    label={PROPERTY_PRICE}
                                    value={state.propertyPriceFormatted}
                                />

                                {/* Downpayment */}
                                <DetailField
                                    label={DOWNPAYMENT}
                                    value={state.downpaymentFormatted}
                                    isEditable={state.downpaymentEditable}
                                    onValuePress={state.downpaymentEditable && onDownpaymentPress}
                                    infoNote={INFO_NOTE}
                                />
                            </View>
                            {state.isMainApplicant &&
                                state.isJointApplicantAdded &&
                                navParams?.subModule !== "JA_ELIG_FAIL" && (
                                    <View style={[Style.paddingLeft_15, Style.horizontalMargin]}>
                                        {/* Joint Applicant */}
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
                                            removeOpenJointApplicant={
                                                onOpenRemoveJointApplicantPopup
                                            }
                                        />
                                        {/* Gray separator line */}
                                        <View style={Style.graySeparator} />
                                    </View>
                                )}
                        </View>

                        {/* Button Container */}
                        <View style={Style.horizontalMargin}>
                            {!navParams?.jaEligResult && (
                                <ActionButton
                                    fullWidth
                                    backgroundColor={WHITE}
                                    borderStyle="solid"
                                    borderWidth={1}
                                    borderColor={GREY}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={VIEW_OTHER_PROPERTIES}
                                        />
                                    }
                                    onPress={onPressViewOtherProperties}
                                    style={Style.viewOtherBtn}
                                />
                            )}
                            {/*View other properties btn*/}
                            {navParams?.jaEligResult && navParams?.subModule === "JA_ELIG_FAIL" && (
                                <ActionButton
                                    fullWidth
                                    backgroundColor={WHITE}
                                    borderStyle="solid"
                                    borderWidth={1}
                                    borderColor={GREY}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={VIEW_OTHER_PROPERTIES}
                                        />
                                    }
                                    onPress={onPressViewOtherProperties}
                                    style={Style.viewOtherBtn}
                                />
                            )}
                            {/*proceed with application btn*/}
                            <ActionButton
                                fullWidth
                                backgroundColor={YELLOW}
                                style={Style.applyBtn}
                                componentCenter={
                                    <Typo
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={PROCEED_WITH_APPLICATION}
                                    />
                                }
                                onPress={
                                    navParams?.isAccepted &&
                                    navParams?.statusMessage === "JA_ELIG_RECM"
                                        ? onApplyLoan
                                        : onMainApplyLoan
                                }
                            />
                        </View>
                        {/*add new Joint Applicant btn*/}
                        {state.isJAButtonEnabled &&
                            navParams?.jaEligResult &&
                            navParams?.subModule === "JA_ELIG_FAIL" && (
                                <ActionTile
                                    header={ADD_JOINT_APPLICANT}
                                    description={ADD_JOINT_APPLICANT_TEXT}
                                    icon={Assets.jointApplicant}
                                    style={Style.JATile}
                                    onPress={onPressAddJointApplicant}
                                />
                            )}
                        {/*sales rep btn*/}
                        {state.isRFASwitchEnabled && (
                            <ActionTile
                                header={REQ_ASSISTANCE_TEXT}
                                description={REQUEST_FOR_ASSISTANCE_DESC}
                                icon={Assets.addAssistanceIcon}
                                style={Style.additionalIncomeTile}
                                onPress={onPressRequestForAssistance}
                            />
                        )}
                    </View>
                </>
            ) : (eligibilityStatus === AMBER || eligibilityStatus === ELIGIBILTY_STATUS_GREEN) &&
              state.isMainEligDataType === STATUS_HARD_FAIL &&
              (status === STATUS_PASS || status === STATUS_SOFT_FAIL) &&
              state.isJointApplicantAdded ? (
                <>
                    <View>
                        <View style={Style.horizontalMarginBig}>
                            {/* Header Text */}
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={20}
                                text={state.headerText}
                                textAlign="left"
                                style={Style.applyBtn}
                            />
                            <Typo textAlign="left" fontSize={16} lineHeight={22}>
                                {/* Sub Text 1 */}
                                <Typo
                                    lineHeight={22}
                                    textAlign="left"
                                    style={Style.subText1}
                                    text={state.subText1}
                                />
                                {status === STATUS_PASS && !navParams?.jaEligResult && (
                                    <>
                                        <Typo
                                            lineHeight={20}
                                            fontWeight="600"
                                            textAlign="left"
                                            text={` ${state.jointApplicantInfo.customerName}`}
                                        />

                                        <Typo
                                            lineHeight={20}
                                            textAlign="left"
                                            text={ELIGIBLE_FOR_HOME_FINANCING}
                                        />
                                    </>
                                )}
                            </Typo>

                            {/* View offer disclaimer */}
                            <Typo
                                lineHeight={18}
                                textAlign="left"
                                text={VIEW_OFFER_CONDITIONS}
                                fontWeight="bold"
                                style={Style.textUnderline}
                                onPress={onViewOfferDisclaimer}
                            />
                            {/* Sub Text 2 */}
                            <Typo
                                lineHeight={22}
                                textAlign="left"
                                style={state.subText2 ? Style.subText2 : Style.subText2Hide}
                                text={state.subText2 ? state.subText2 : ""}
                            />
                        </View>
                        <View style={Platform.OS === "ios" ? Style.shadow : {}}>
                            <View
                                style={[
                                    Platform.OS === "ios" ? {} : Style.shadow,
                                    Style.loanDetailsContainer,
                                    Style.horizontalMargin,
                                ]}
                            >
                                {/* Property Name */}
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={state.propertyName}
                                    style={Style.propertyName}
                                />

                                {/* Financing Amount Label */}
                                <Typo
                                    lineHeight={19}
                                    style={Style.loanAmountLabel}
                                    text={PROPERTY_FIANANCING_AMOUNT}
                                />

                                {/* Financing Amount value */}
                                <Typo
                                    fontSize={24}
                                    lineHeight={29}
                                    fontWeight="bold"
                                    style={Style.loanAmount}
                                    text={state.loanAmountFormatted}
                                />

                                {/* Info container */}
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
                                        text={ADDITIONAL_FINANCING_INFO}
                                        color={DARK_GREY}
                                        style={Style.infoText}
                                    />
                                </View>

                                {/* Gray separator line */}
                                <View style={Style.graySeparator} />

                                {/* profit Rate */}
                                <DetailField
                                    label={EFFECTIVE_PROFIT_RATE}
                                    value={state.interestRateFormatted}
                                    valueSubText1={state.baseRateFormatted}
                                    valueSubText2={state.spreadRateFormatted}
                                />

                                {/* Tenure */}
                                <DetailField
                                    label={state.tenureLabel}
                                    value={state.tenureFormatted}
                                    isEditable={state.tenureEditable}
                                    onValuePress={state.tenureEditable && onTenurePress}
                                />

                                {/* Monthly Instalment */}
                                <DetailField
                                    label={MONTHLY_INSTALLMENT}
                                    value={state.monthlyInstalmentFormatted}
                                    infoNote={MONTHLY_INSTALMENT_INFO}
                                />

                                {/* Gray separator line */}
                                <View style={Style.graySeparator} />

                                {/* Property Price */}
                                <DetailField
                                    label={PROPERTY_PRICE}
                                    value={state.propertyPriceFormatted}
                                />

                                {/* Downpayment */}
                                <DetailField
                                    label={DOWNPAYMENT}
                                    value={state.downpaymentFormatted}
                                    isEditable={state.downpaymentEditable}
                                    onValuePress={state.downpaymentEditable && onDownpaymentPress}
                                    infoNote={state.downpaymentInfoNote}
                                />
                            </View>
                            {state.isMainApplicant && state.isJointApplicantAdded && (
                                <View style={[Style.paddingLeft_15, Style.horizontalMargin]}>
                                    {/* Joint Applicant */}
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
                                        removeOpenJointApplicant={onOpenRemoveJointApplicantPopup}
                                    />
                                    {/* Gray separator line */}
                                    <View style={Style.graySeparator} />
                                </View>
                            )}
                        </View>

                        {/* Button Container */}
                        <View style={Style.horizontalMargin}>
                            <ActionButton
                                fullWidth
                                backgroundColor={WHITE}
                                borderStyle="solid"
                                borderWidth={1}
                                borderColor={GREY}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={VIEW_OTHER_PROPERTIES}
                                    />
                                }
                                onPress={onPressViewOtherProperties}
                                style={Style.viewOtherBtn}
                            />
                            {/*proceed with application btn*/}
                            <ActionButton
                                fullWidth
                                backgroundColor={YELLOW}
                                style={Style.applyBtn}
                                componentCenter={
                                    <Typo
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={PROCEED_WITH_APPLICATION}
                                    />
                                }
                                onPress={
                                    navParams?.isAccepted &&
                                    navParams?.statusMessage === "JA_ELIG_RECM"
                                        ? onApplyLoan
                                        : onMainApplyLoan
                                }
                            />
                        </View>
                        {/*sales rep btn*/}
                        {state.isRFASwitchEnabled && (
                            <ActionTile
                                header={REQ_ASSISTANCE_TEXT}
                                description={REQUEST_FOR_ASSISTANCE_DESC}
                                icon={Assets.addAssistanceIcon}
                                style={Style.additionalIncomeTile}
                                onPress={onPressRequestForAssistance}
                            />
                        )}
                    </View>
                </>
            ) : (
                <></>
            )}
        </>
    );
}

export default CEResultApplicantTemplate;

const Style = StyleSheet.create({
    JATile: {
        marginTop: 24,
    },
    TileBtn: {
        marginTop: 10,
    },
    addPromoContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        flexDirection: "row",
        height: 56,
        justifyContent: "space-between",
        marginBottom: 25,
        marginHorizontal: 24,
        marginTop: 6,
        padding: 18,
    },
    addPromoInnerCont: {
        flexDirection: "row",
    },
    additionalIncomeTile: {
        marginTop: 16,
    },
    applyBtn: {
        marginBottom: 24.1,
    },
    bottomMargin: {
        marginBottom: 30,
    },
    closeBtnCont: {
        alignItems: "center",
        height: 45,
        justifyContent: "center",
        width: 45,
    },
    graySeparator: {
        borderColor: SEPARATOR,
        borderTopWidth: 1,
        flex: 1,
        height: 1,
        marginVertical: 15,
    },
    horizontalMargin: {
        marginHorizontal: 24,
        marginTop: 15,
    },
    horizontalMarginBig: {
        marginHorizontal: 36,
    },
    imageCls: {
        height: "100%",
        width: "100%",
    },
    imageContainer: (imageHeight) => ({
        alignItems: "center",
        height: imageHeight,
    }),
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
        marginHorizontal: 12,
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
        marginVertical: 25,
        paddingVertical: 25,
    },
    optionHeader: {
        marginTop: 10,
    },
    paddingLeft_15: {
        paddingLeft: 15,
    },
    propertyName: {
        marginHorizontal: 16,
    },
    shadow: {
        ...getShadow({
            elevation: 8,
        }),
    },
    subText1: {
        marginTop: 10,
    },
    subText2: {
        marginTop: 20,
    },
    subText2Hide: {
        height: 0,
        width: 0,
    },
    textUnderline: {
        textDecorationLine: "underline",
    },
    viewOtherBtn: {
        marginBottom: 16,
    },
});
