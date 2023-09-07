import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import {
    isM2UOnlyUser,
    isNTBUser,
    isETBUser,
    getAnalyticScreenName,
} from "@screens/CasaSTP/helpers/CasaSTPHelpers";
import { maskAddress, maskEmail, maskMobile } from "@screens/PLSTP/PLSTPController";
import {
    getAccountDetails,
    getAdditionalDetails,
    getEmploymentDetails,
    getPersonalDetails,
    getPersonalDetailsETB,
    getResidentialDetails,
} from "@screens/ZestCASA/helpers/ZestHelpers";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import { InfoDetails } from "@components/FormComponents/InfoDetails";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { ZEST_CASA_CREATE_ACCOUNT_BODY } from "@redux/actions/services/createAccountAction";
import {
    PREPOSTQUAL_CLEAR,
    PREPOSTQUAL_FINANICAL_OBJECTIVE,
    UPDATE_PRE_QUAL_REDUCER,
} from "@redux/actions/services/prePostQualAction";
import accountDetailsProps from "@redux/connectors/ZestCASA/accountDetailsConnector";
import additionalDetailsProps from "@redux/connectors/ZestCASA/additionalDetailsConnector";
import declarationProps from "@redux/connectors/ZestCASA/declarationConnector";
import employmentDetailsProps from "@redux/connectors/ZestCASA/employmentDetailsConnector";
import entryProps from "@redux/connectors/ZestCASA/entryConnector";
import identityDetailsProps from "@redux/connectors/ZestCASA/identityDetailsConnector";
import personalDetailsProps from "@redux/connectors/ZestCASA/personalDetailsConnector";
import residentialDetailsProps from "@redux/connectors/ZestCASA/residentialDetailsConnector";
import downTimeServiceProps, {
    downTimeServicePropTypes,
} from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/services/masterDataConnector";

import {
    PREMIER_CLEAR_ALL,
    PRE_QUAL_PRE_LOGIN_FLAG,
    MYKAD_CODE,
    PASSPORT_CODE,
    MYKAD_ID_TYPE,
    PASSPORT_ID_TYPE,
} from "@constants/casaConfiguration";
import {
    FITNESS_VIEW_READY,
    CONFIRMATION,
    YES,
    NO,
    AGREE,
    MALE,
    FEMALE,
    ZEST_CASA_PERSONAL_DETAILS,
    ZEST_CASA_EMPLOYMENT_DETAILS,
    ZEST_CASA_ADDITIONAL_DETAILS,
    ZEST_CASA_RESIDENTIAL_DETAILS,
    PREFERRED_BRANCH_DETAILS,
    DEBIT_CARD_DELIVERY_ADD,
    ZEST_CASA_ADDITIONAL_INCOME_DETAILS,
    PREMIER_CONFIRMATION_TITLE,
    MOB_CODE,
} from "@constants/strings";

import { apiToMhDateLocalServer, retrieveuserDOB } from "@utils/momentUtils";

import { accountDetailsPropTypes } from "./PremierAccountDetails";
import { additionalDetailsPropTypes } from "./PremierAdditionalDetails";
import { declarationPropTypes } from "./PremierDeclaration";
import { employmentDetailsPropTypes } from "./PremierEmploymentDetails";
import { identityDetailsPropTypes } from "./PremierIdentityDetails";
import { personalDetailsPropTypes } from "./PremierPersonalDetails";
import { residentialDetailsPropTypes } from "./PremierResidentialDetails";

const PremierConfirmation = (props) => {
    const { getModel } = useModelController();
    const { navigation } = props;
    const [personalDetails, setPersonalDetails] = useState([]);
    const [employmentDetails, setEmploymentDetails] = useState([]);
    const [accountDetails, setAccountDetails] = useState([]);
    const [additionalDetails, setAdditionalDetails] = useState([]);
    const [residentialDetails, setResidentialDetails] = useState([]);
    const [debitcardresidentialDetails, setDebitCardResidentialDetails] = useState([]);
    const [isEnableEdit, setIsEnableEdit] = useState(true);
    const { exceedLimitScreen } = getModel("isFromMaxTry") || false;
    const [isFromMaxTry] = useState(exceedLimitScreen);

    // Hooks to access reducer data
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const identityDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.identityDetailsReducer
    );
    const suitabilityAssessmentReducer = useSelector(
        (state) => state.zestCasaReducer.suitabilityAssessmentReducer
    );
    const personalDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.personalDetailsReducer
    );
    const residentialDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.residentialDetailsReducer
    );
    const employmentDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.employmentDetailsReducer
    );
    const accountDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.accountDetailsReducer
    );
    const additionalDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.additionalDetailsReducer
    );
    const declarationReducer = useSelector((state) => state.zestCasaReducer.declarationReducer);
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const debitCardResidentialDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.debitCardResidentialDetailsReducer
    );

    const { userStatus } = prePostQualReducer;

    const { isMobileNumberMaskingOn, isEmailMaskingOn } = personalDetailsReducer;
    const { isAddressLineOneMaskingOn, isAddressLineTwoMaskingOn, isAddressLineThreeMaskingOn } =
        residentialDetailsReducer;
    const { isPMA, isPM1, isKawanku, isKawankuSavingsI } = entryReducer;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    useEffect(() => {
        isNTBUser(userStatus)
            ? setPersonalDetails(
                  getPersonalDetails(
                      personalDetailsReducer.titleValue && personalDetailsReducer.titleValue.name
                          ? personalDetailsReducer.titleValue.name
                          : "",
                      personalDetailsReducer.fullName && identityDetailsReducer.identityType !== 2
                          ? personalDetailsReducer.fullName
                          : "",
                      personalDetailsReducer.gender && personalDetailsReducer.gender === "M"
                          ? MALE
                          : FEMALE,
                      personalDetailsReducer.raceValue && personalDetailsReducer.raceValue.name
                          ? personalDetailsReducer.raceValue.name
                          : "",
                      props.mobileNumberWithExtension
                          ? !isNTBUser(userStatus) && isMobileNumberMaskingOn
                              ? maskMobile(props.mobileNumberWithExtension)
                              : props.mobileNumberWithExtension
                          : "",
                      props.emailAddress
                          ? !isNTBUser(userStatus)
                              ? maskEmail(props.emailAddress)
                              : props.emailAddress?.replace(/\s+/g, " ")?.trim()
                          : "",
                      personalDetailsReducer.politicalExposure ? "Yes" : "No"
                  )
              )
            : setPersonalDetails(
                  getPersonalDetailsETB(
                      props.mobileNumberWithExtension
                          ? !isNTBUser(userStatus) && isMobileNumberMaskingOn
                              ? maskMobile(
                                    `${MOB_CODE.replace(/ /g, "")}${
                                        residentialDetailsReducer.numberWithoutExtensionBackup
                                    }`
                                )
                              : props.mobileNumberWithExtension
                          : "",
                      props.emailAddress
                          ? !isNTBUser(userStatus) && isEmailMaskingOn
                              ? maskEmail(props.emailAddress)
                              : props.emailAddress?.replace(/\s+/g, " ")?.trim()
                          : "",
                      residentialDetailsReducer.addressLineOne
                          ? !isNTBUser(userStatus) && isAddressLineOneMaskingOn
                              ? maskAddress(residentialDetailsReducer.addressLineOne)
                              : residentialDetailsReducer.addressLineOne
                                    ?.replace(/\s+/g, " ")
                                    ?.trim()
                          : "",

                      residentialDetailsReducer.addressLineTwo
                          ? !isNTBUser(userStatus) && isAddressLineTwoMaskingOn
                              ? maskAddress(residentialDetailsReducer.addressLineTwo)
                              : residentialDetailsReducer.addressLineTwo
                                    ?.replace(/\s+/g, " ")
                                    ?.trim()
                          : "",
                      residentialDetailsReducer.addressLineThree
                          ? !isNTBUser(userStatus) && isAddressLineThreeMaskingOn
                              ? maskAddress(residentialDetailsReducer.addressLineThree)
                              : addressLineThreeValidation(
                                    residentialDetailsReducer.addressLineThree
                                )
                          : "",
                      props.postalCode ? props.postalCode : "",
                      residentialDetailsReducer.stateValue &&
                          residentialDetailsReducer.stateValue.name
                          ? residentialDetailsReducer.stateValue.name
                          : "",
                      residentialDetailsReducer.city
                          ? residentialDetailsReducer.city?.replace(/\s+/g, " ")?.trim()
                          : ""
                  )
              );
    }, [
        isAddressLineOneMaskingOn,
        isAddressLineThreeMaskingOn,
        isAddressLineTwoMaskingOn,
        isMobileNumberMaskingOn,
        personalDetailsReducer.gender,
        personalDetailsReducer.politicalExposure,
        personalDetailsReducer.raceValue,
        personalDetailsReducer.titleValue,
        props.emailAddress,
        props.mobileNumberWithExtension,
        props.postalCode,
        residentialDetailsReducer.addressLineOne,
        residentialDetailsReducer.addressLineThree,
        residentialDetailsReducer.addressLineTwo,
        residentialDetailsReducer.city,
        residentialDetailsReducer.stateValue,
        userStatus,
        personalDetailsReducer.fullName,
    ]);

    useEffect(() => {
        setEmploymentDetails(
            getEmploymentDetails(
                props.employerName?.replace(/\s+/g, " ")?.trim(),
                props?.occupationValue?.name ?? "",
                props?.sectorValue?.name ?? "",
                props?.employmentTypeValue?.name ?? "",
                props?.monthlyIncomeValue?.name ?? "",
                props?.incomeSourceValue?.name ?? ""
            )
        );
    }, [
        props.employerName,
        props.employmentTypeValue,
        props.incomeSourceValue,
        props.monthlyIncomeValue,
        props.occupationValue,
        props.sectorValue,
    ]);

    useEffect(() => {
        //To filter only data on basis of Branch only
        if (isETBUser(userStatus) || identityDetailsReducer.identityType === 2) {
            const filterData = getAccountDetails(
                props?.accountPurposeValue?.name ?? "",
                props?.branchStateValue?.name ?? "",
                props?.branchDistrictValue?.name ?? "",
                props?.branchValue?.name ?? ""
            );
            setAccountDetails(filterData);
        } else {
            const filterData = getAccountDetails(
                props?.accountPurposeValue?.name ?? "",
                props?.branchStateValue?.name ?? "",
                props?.branchDistrictValue?.name ?? "",
                props?.branchValue?.name ?? ""
            ).filter((ele) => ele.displayKey === "Branch");
            setAccountDetails(filterData);
        }
    }, [
        props.accountPurposeValue,
        props.branchStateValue,
        props.branchDistrictValue,
        props.branchValue,
    ]);

    useEffect(() => {
        setAdditionalDetails(
            getAdditionalDetails(
                additionalDetailsReducer?.primaryIncomeValue?.name ?? "",
                additionalDetailsReducer?.primaryWealthValue?.name ?? ""
            )
        );
    }, [additionalDetailsReducer.primaryIncomeValue, additionalDetailsReducer.primaryWealthValue]);

    useEffect(() => {
        if (!isEnableEdit) {
            setTimeout(() => setIsEnableEdit(true), 1000);
        }
    }, [isEnableEdit]);

    useEffect(() => {
        setResidentialDetails(
            getResidentialDetails(
                props.addressLineOne
                    ? !isNTBUser(userStatus) && isAddressLineOneMaskingOn
                        ? maskAddress(props.addressLineOne)
                        : props.addressLineOne?.replace(/\s+/g, " ")?.trim()
                    : "",
                props.addressLineTwo
                    ? !isNTBUser(userStatus) && isAddressLineTwoMaskingOn
                        ? maskAddress(props.addressLineTwo)
                        : props.addressLineTwo?.replace(/\s+/g, " ")?.trim()
                    : "",

                props.addressLineThree
                    ? !isNTBUser(userStatus) && isAddressLineThreeMaskingOn
                        ? maskAddress(props.addressLineThree)
                        : addressLineThreeValidation(props.addressLineThree)
                    : "",

                props.postalCode ? props.postalCode : "",
                props?.stateValue?.name ?? "",
                props.city?.replace(/\s+/g, " ")?.trim()
            )
        );
        setDebitCardResidentialDetails(
            getResidentialDetails(
                debitCardResidentialDetailsReducer.addressLineOne
                    ? !isNTBUser(userStatus) && isAddressLineOneMaskingOn
                        ? maskAddress(debitCardResidentialDetailsReducer.addressLineOne)
                        : debitCardResidentialDetailsReducer.addressLineOne
                              ?.replace(/\s+/g, " ")
                              ?.trim()
                    : "",
                debitCardResidentialDetailsReducer.addressLineTwo
                    ? !isNTBUser(userStatus) && isAddressLineTwoMaskingOn
                        ? maskAddress(debitCardResidentialDetailsReducer.addressLineTwo)
                        : debitCardResidentialDetailsReducer.addressLineTwo
                              ?.replace(/\s+/g, " ")
                              ?.trim()
                    : "",

                debitCardResidentialDetailsReducer.addressLineThree
                    ? !isNTBUser(userStatus) && isAddressLineThreeMaskingOn
                        ? maskAddress(debitCardResidentialDetailsReducer.addressLineThree)
                        : addressLineThreeValidation(
                              debitCardResidentialDetailsReducer.addressLineThree
                          )
                    : "",

                debitCardResidentialDetailsReducer?.postalCode ?? "",
                debitCardResidentialDetailsReducer?.stateValue?.name ?? "",
                debitCardResidentialDetailsReducer.city?.replace(/\s+/g, " ")?.trim()
            )
        );
    }, [
        isAddressLineOneMaskingOn,
        isAddressLineThreeMaskingOn,
        isAddressLineTwoMaskingOn,
        props.addressLineOne,
        props.addressLineThree,
        props.addressLineTwo,
        props.city,
        props.postalCode,
        props.stateValue,
        userStatus,
        debitCardResidentialDetailsReducer.addressLineOne,
        debitCardResidentialDetailsReducer.addressLineThree,
        debitCardResidentialDetailsReducer.addressLineTwo,
        debitCardResidentialDetailsReducer.city,
        debitCardResidentialDetailsReducer.postalCode,
        debitCardResidentialDetailsReducer.stateValue,
    ]);

    function addressLineThreeValidation(value) {
        let formAddressLineThree = value;
        if (typeof formAddressLineThree === "string" && formAddressLineThree.trim !== "") {
            formAddressLineThree = formAddressLineThree.replace(/\s+/g, " ")?.trim();
        }
        return formAddressLineThree;
    }

    function onBackTap() {
        console.log("[PMAConfirmation] >> [onBackTap]");
        props.updateConfirmationScreenStatusForPersonalDetails(false);
        props.updateConfirmationScreenStatusForResidentialDetails(false);
        props.updateConfirmationScreenStatusForEmploymentDetails(false);
        props.updateConfirmationScreenStatusForAccountDetails(false);

        navigation.goBack();
    }

    function onCloseTap() {
        // Clear all data from PMACASA reducers
        dispatch({ type: PREMIER_CLEAR_ALL });
        props.clearDownTimeReducer();
        props.clearMasterDataReducer();
        dispatch({ type: PREPOSTQUAL_CLEAR });
        navigation.popToTop();
        navigation.goBack();
    }

    function onNextTap() {
        console.log("[PMAConfirmation] >> [onNextTap]");
        handleUserBasedOnUserStatus();
    }

    function handleUserBasedOnUserStatus() {
        if (isNTBUser(userStatus)) {
            dispatchCreateAccountBody();
            navigation.navigate(navigationConstant.PREMIER_OTP_VERIFICATION);
        } else if (isETBUser(userStatus)) {
            navigation.navigate(navigationConstant.PREMIER_SELECT_CASA);
        } else if (isM2UOnlyUser(userStatus)) {
            navigation.navigate(navigationConstant.PREMIER_ACTIVATE_ACCOUNT);
        }
    }

    function dispatchCreateAccountBody() {
        dispatch({
            type: ZEST_CASA_CREATE_ACCOUNT_BODY,
            state: {
                customerName:
                    identityDetailsReducer.identityType === 1
                        ? personalDetailsReducer.fullName
                        : identityDetailsReducer.fullName,
                idNo:
                    identityDetailsReducer.identityType === 1
                        ? identityDetailsReducer.identityNumber
                        : identityDetailsReducer.passportNumber,
                idType: identityDetailsReducer.identityType === 1 ? MYKAD_CODE : PASSPORT_CODE,
                birthDate:
                    identityDetailsReducer.identityType === 1
                        ? retrieveuserDOB(identityDetailsReducer.identityNumber.substring(0, 6))
                        : apiToMhDateLocalServer(identityDetailsReducer.dateOfBirthDateObject),
                nationality:
                    identityDetailsReducer.identityType === 1
                        ? ""
                        : identityDetailsReducer.nationalityValue?.name,

                passportExpiry:
                    identityDetailsReducer.identityType === 1
                        ? ""
                        : apiToMhDateLocalServer(identityDetailsReducer.passportExpiryDateObject),
                issuedCountry:
                    identityDetailsReducer.identityType === 1
                        ? ""
                        : identityDetailsReducer.nationalityValue?.value,

                issuedCountryValue:
                    identityDetailsReducer.identityType === 1
                        ? ""
                        : identityDetailsReducer.nationalityValue?.name,

                mobileNo: personalDetailsReducer.mobileNumberWithExtension,
                customerEmail: personalDetailsReducer.emailAddress,
                pep: personalDetailsReducer.politicalExposure ? YES : NO,
                gender: personalDetailsReducer.gender,
                genderValue: personalDetailsReducer.genderValue,
                title: personalDetailsReducer.titleValue?.value,
                titleValue: personalDetailsReducer.titleValue?.name,
                race: personalDetailsReducer.raceValue?.value,

                preOrPostFlag: PRE_QUAL_PRE_LOGIN_FLAG,
                pdpa: declarationReducer.privacyPolicy,
                transactionType: "",
                referalCode: "",

                addr1: residentialDetailsReducer.addressLineOne,
                addr2: residentialDetailsReducer.addressLineTwo,
                addr3: residentialDetailsReducer.addressLineThree,
                addr4: "",
                postCode: residentialDetailsReducer.postalCode,
                state: residentialDetailsReducer.stateValue?.value,
                stateValue: residentialDetailsReducer.stateValue?.name,
                city: residentialDetailsReducer.city,

                custStatus: prePostQualReducer.custStatus,
                m2uIndicator: prePostQualReducer.m2uIndicator,
                pan: "",
                gcif: prePostQualReducer.gcif,
                onBoardingStatusInfo: prePostQualReducer.onBoardingStatusInfo,
                riskRating: prePostQualReducer.customerRiskRating,
                staffInd: prePostQualReducer.staffInd,
                fatcaStateValue: declarationReducer.fatcaStateDeclaration,
                ekycRefId: "",
                empType: employmentDetailsReducer.employmentTypeValue?.value,
                empTypeValue: employmentDetailsReducer.employmentTypeValue?.name,
                employerName: employmentDetailsReducer.employerName,
                occupation: employmentDetailsReducer.occupationValue?.value,
                occupationValue: employmentDetailsReducer.occupationValue?.name,
                sector: employmentDetailsReducer.sectorValue?.value,
                sectorValue: employmentDetailsReducer.sectorValue?.name,
                monthlyIncomeRange: employmentDetailsReducer.monthlyIncomeValue?.value,
                monthlyIncomeRangeValue: employmentDetailsReducer.monthlyIncomeValue?.name,
                sourceOfFundCountry: employmentDetailsReducer.incomeSourceValue?.value,
                sourceOfFundCountryValue: employmentDetailsReducer.incomeSourceValue?.name,
                sourceOfFund: additionalDetailsReducer.primaryIncomeValue?.value,
                sourceOfFundValue: additionalDetailsReducer.primaryIncomeValue?.name,
                sourceOfWealth: additionalDetailsReducer.primaryWealthValue?.value,
                sourceOfWealthValue: additionalDetailsReducer.primaryWealthValue?.name,

                customerType: "",
                userId: "",

                declarePdpaPromotion: declarationReducer.isAgreeToBeContacted,
                tc: declarationReducer.termsAndConditions,

                purpose: accountDetailsReducer.accountPurposeValue?.value,
                purposeValue: accountDetailsReducer.accountPurposeValue?.name,
                preferredBRState: accountDetailsReducer.branchStateValue?.value,
                preferredBRStateValue: accountDetailsReducer.branchStateValue?.name,
                preferredBRDistrict: accountDetailsReducer.branchDistrictValue?.value,
                preferredBRDistrictValue: accountDetailsReducer.branchDistrictValue?.name,
                preferredBranch: accountDetailsReducer.branchValue?.branchCode,
                preferredBranchValue: accountDetailsReducer.branchValue?.name,

                financialObjective: suitabilityAssessmentReducer.financialObjectiveValue?.value,
                financialObjectiveValue: suitabilityAssessmentReducer.financialObjectiveValue?.name,
                saFormSecurities: suitabilityAssessmentReducer.hasDealtWithSecurities ? YES : NO,
                saFormInvestmentRisk: suitabilityAssessmentReducer.hasRelevantKnowledge ? YES : NO,
                saFormInvestmentExp: suitabilityAssessmentReducer.hasInvestmentExperience
                    ? YES
                    : NO,
                saFormInvestmentNature: suitabilityAssessmentReducer.hasUnderstoodInvestmentAccount
                    ? YES
                    : NO,
                saFormInvestmentTerm: suitabilityAssessmentReducer.hasUnderstoodAccountTerms
                    ? YES
                    : NO,
                saFormProductFeature: AGREE,
                saFormPIDM: AGREE,
                saFormSuitability: AGREE,
                isPMA,
                isPM1,
                isKawanku,
                isKawankuSavingsI,
                from: navigationConstant.APPLY_CARD_INTRO,
                onBoardDetails2From: userStatus,
                selectedIDType:
                    identityDetailsReducer.identityType === 1 ? MYKAD_ID_TYPE : PASSPORT_ID_TYPE,
            },
        });

        dispatch({
            type: PREPOSTQUAL_FINANICAL_OBJECTIVE,
            finanicalObjective: suitabilityAssessmentReducer.financialObjectiveValue?.value,
            finanicalObjectiveValue: suitabilityAssessmentReducer.financialObjectiveValue?.name,
        });

        dispatch({
            type: UPDATE_PRE_QUAL_REDUCER,
            idType: identityDetailsReducer.identityType === 1 ? MYKAD_CODE : PASSPORT_CODE,
            customerName: identityDetailsReducer.fullName,
            idNo:
                identityDetailsReducer.identityType === 1
                    ? identityDetailsReducer.identityNumber
                    : identityDetailsReducer.passportNumber,
            nationality:
                identityDetailsReducer.identityType === 1
                    ? ""
                    : identityDetailsReducer.nationalityValue?.name,
            passportExpiry:
                identityDetailsReducer.identityType === 1
                    ? ""
                    : apiToMhDateLocalServer(identityDetailsReducer.passportExpiryDateObject),
            issuedCountry:
                identityDetailsReducer.identityType === 1
                    ? ""
                    : identityDetailsReducer.nationalityValue?.value,
            issuedCountryValue:
                identityDetailsReducer.identityType === 1
                    ? ""
                    : identityDetailsReducer.nationalityValue?.name,
            customerEmail: personalDetailsReducer.emailAddress,
            mobileNo: personalDetailsReducer.mobileNumberWithExtension,
            gender: personalDetailsReducer.gender,
            genderValue: personalDetailsReducer.genderValue,
            title: personalDetailsReducer.titleValue?.value,
            titleValue: personalDetailsReducer.titleValue?.name,
            race: personalDetailsReducer.raceValue?.value,
            raceValue: personalDetailsReducer.raceValue?.name,
            pep: personalDetailsReducer.politicalExposure ? YES : NO,
            addr1: residentialDetailsReducer.addressLineOne,
            addr2: residentialDetailsReducer.addressLineTwo,
            addr3: residentialDetailsReducer.addressLineThree,
            addr4: "",
            postCode: residentialDetailsReducer.postalCode,
            state: residentialDetailsReducer.stateValue?.value,
            stateValue: residentialDetailsReducer.stateValue?.name,
            city: residentialDetailsReducer.city,
            custStatus: prePostQualReducer.custStatus,
            m2uIndicator: prePostQualReducer.m2uIndicator,
            riskRating: prePostQualReducer.customerRiskRating,
            onBoardingStatusInfo: prePostQualReducer.onBoardingStatusInfo,
            pdpa: declarationReducer.privacyPolicy,
            fatcaStateValue: declarationReducer.fatcaStateDeclaration,
            declarePdpaPromotion: declarationReducer.isAgreeToBeContacted,
            tc: declarationReducer.termsAndConditions,
            empType: employmentDetailsReducer.employmentTypeValue?.value,
            empTypeValue: employmentDetailsReducer.employmentTypeValue?.name,
            employerName: employmentDetailsReducer.employerName,
            occupation: employmentDetailsReducer.occupationValue?.value,
            occupationValue: employmentDetailsReducer.occupationValue?.name,
            sector: employmentDetailsReducer.sectorValue?.value,
            sectorValue: employmentDetailsReducer.sectorValue?.name,
            monthlyIncomeRange: employmentDetailsReducer.monthlyIncomeValue?.value,
            monthlyIncomeRangeValue: employmentDetailsReducer.monthlyIncomeValue?.name,
            sourceOfIncome: employmentDetailsReducer.incomeSourceValue?.value,
            sourceOfIncomeValue: employmentDetailsReducer.incomeSourceValue?.name,
            sourceOfFundCountry: employmentDetailsReducer.incomeSourceValue?.value,
            sourceOfFundCountryValue: employmentDetailsReducer.incomeSourceValue?.name,
            purpose: accountDetailsReducer.accountPurposeValue?.value,
            purposeValue: accountDetailsReducer.accountPurposeValue?.name,
            preferredBRState: accountDetailsReducer.branchStateValue?.value,
            preferredBRStateValue: accountDetailsReducer.branchStateValue?.name,
            preferredBRDistrict: accountDetailsReducer.branchDistrictValue?.value,
            preferredBRDistrictValue: accountDetailsReducer.branchDistrictValue?.name,
            preferredBranch: accountDetailsReducer.branchValue?.branchCode,
            preferredBranchValue: accountDetailsReducer.branchValue?.name,
            saFormInvestmentExp: suitabilityAssessmentReducer.hasInvestmentExperience ? YES : NO,
            saFormInvestmentNature: suitabilityAssessmentReducer.hasUnderstoodInvestmentAccount
                ? YES
                : NO,
            saFormInvestmentTerm: suitabilityAssessmentReducer.hasUnderstoodAccountTerms ? YES : NO,
            saFormInvestmentRisk: suitabilityAssessmentReducer.hasRelevantKnowledge ? YES : NO,
            saFormPIDM: AGREE,
            saFormSuitability: AGREE,
            isPMA,
            saFormProductFeature: AGREE,
            saFormSecurities: suitabilityAssessmentReducer.hasDealtWithSecurities ? YES : NO,
        });
    }

    function onPersonalDetailsEditDidTap() {
        if (isEnableEdit) {
            props.updateConfirmationScreenStatusForPersonalDetails(true);
            setIsEnableEdit(false);
            return !isNTBUser(userStatus)
                ? navigation.push(navigationConstant.PREMIER_RESIDENTIAL_DETAILS)
                : navigation.push(navigationConstant.PREMIER_PERSONAL_DETAILS);
        }
    }

    function onResidentialDetailsEditDidTap() {
        if (isEnableEdit) {
            props.updateConfirmationScreenStatusForResidentialDetails(true);
            navigation.push(navigationConstant.PREMIER_RESIDENTIAL_DETAILS);
            setIsEnableEdit(false);
        }
    }

    function onEmploymentDetailsEditDidTap() {
        if (isEnableEdit) {
            props.updateConfirmationScreenStatusForEmploymentDetails(true);
            navigation.push(navigationConstant.PREMIER_EMPLOYMENT_DETAILS);
            setIsEnableEdit(false);
        }
    }

    function onAccountDetailsEditDidTap() {
        if (isEnableEdit) {
            props.updateConfirmationScreenStatusForAccountDetails(true);
            if (isETBUser(userStatus) || identityDetailsReducer.identityType === 2) {
                navigation.push(navigationConstant.PREMIER_ACCOUNT_DETAILS);
            } else {
                navigation.push(navigationConstant.PREMIER_PREFER_BRANCH);
            }
            setIsEnableEdit(false);
        }
    }

    function onAdditionalDetailsEditDidTap() {
        if (isEnableEdit) {
            props.updateConfirmationScreenStatusForAdditionalDetails(true);
            navigation.push(navigationConstant.PREMIER_ADDITIONAL_DETAILS);
            setIsEnableEdit(false);
        }
    }

    function onDebitCardResidentialDetailsEditDidTap() {
        if (isEnableEdit) {
            navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
                screen: navigationConstant.ZEST_CASA_DEBIT_CARD_RESIDENTIAL_DETAILS,
                params: {
                    isFromConfirmationScreenForResidentialDetails: true,
                },
            });
            setIsEnableEdit(false);
        }
    }

    // To check whether to render Additional details component or not
    function showAdditionalDetails(arr) {
        if (arr === []) {
            return false;
        }
        let flag = false;
        arr.map((ele) => {
            if (ele.displayValue !== "") {
                flag = true;
            }
            return ele;
        });
        return flag;
    }
    const analyticScreenName = getAnalyticScreenName(
        entryReducer?.productName,
        navigationConstant.PREMIER_CONFIRMATION,
        ""
    );
    return (
        <ScreenContainer backgroundType="color" analyticScreenName={analyticScreenName}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={20}
                                text={CONFIRMATION}
                            />
                        }
                        headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    <KeyboardAwareScrollView
                        behavior={Platform.OS === "ios" ? "padding" : ""}
                        enabled
                    >
                        <View style={Style.contentContainer}>
                            <Typo
                                lineHeight={21}
                                textAlign="left"
                                text={PREMIER_CONFIRMATION_TITLE}
                            />
                        </View>
                        <SpaceFiller height={24} />
                        <InfoDetails
                            title={ZEST_CASA_PERSONAL_DETAILS}
                            info={personalDetails}
                            handlePress={
                                isNTBUser(userStatus)
                                    ? onPersonalDetailsEditDidTap
                                    : onResidentialDetailsEditDidTap
                            }
                            buttonValue={ZEST_CASA_PERSONAL_DETAILS}
                        />
                        {isNTBUser(userStatus) && (
                            <InfoDetails
                                title={ZEST_CASA_RESIDENTIAL_DETAILS}
                                info={residentialDetails}
                                handlePress={onResidentialDetailsEditDidTap}
                                buttonValue={ZEST_CASA_RESIDENTIAL_DETAILS}
                            />
                        )}
                        {isNTBUser(userStatus) &&
                            identityDetailsReducer.identityType === 1 &&
                            !isFromMaxTry && (
                                <InfoDetails
                                    title={DEBIT_CARD_DELIVERY_ADD}
                                    info={debitcardresidentialDetails}
                                    handlePress={onDebitCardResidentialDetailsEditDidTap}
                                    buttonValue={DEBIT_CARD_DELIVERY_ADD}
                                />
                            )}
                        <InfoDetails
                            title={ZEST_CASA_EMPLOYMENT_DETAILS}
                            info={employmentDetails}
                            handlePress={onEmploymentDetailsEditDidTap}
                            buttonValue={ZEST_CASA_EMPLOYMENT_DETAILS}
                        />
                        {showAdditionalDetails(accountDetails) ? (
                            <InfoDetails
                                title={
                                    isETBUser(userStatus) ||
                                    identityDetailsReducer.identityType === 2
                                        ? ZEST_CASA_ADDITIONAL_DETAILS
                                        : PREFERRED_BRANCH_DETAILS
                                }
                                info={accountDetails}
                                handlePress={onAccountDetailsEditDidTap}
                                buttonValue={ZEST_CASA_ADDITIONAL_DETAILS}
                            />
                        ) : null}
                        {additionalDetailsReducer?.primaryIncomeIndex !== null &&
                        additionalDetailsReducer?.primaryIncomeValue !== null ? (
                            <InfoDetails
                                title={ZEST_CASA_ADDITIONAL_INCOME_DETAILS}
                                info={additionalDetails}
                                handlePress={onAdditionalDetailsEditDidTap}
                                buttonValue={ZEST_CASA_ADDITIONAL_INCOME_DETAILS}
                            />
                        ) : null}
                    </KeyboardAwareScrollView>
                </ScrollView>

                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <ActionButton
                            fullWidth
                            componentCenter={
                                <Typo lineHeight={18} fontWeight="600" text={FITNESS_VIEW_READY} />
                            }
                            onPress={onNextTap}
                        />
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

PremierConfirmation.propTypes = {
    ...masterDataServicePropTypes,
    ...downTimeServicePropTypes,
    ...identityDetailsPropTypes,
    ...personalDetailsPropTypes,
    ...residentialDetailsPropTypes,
    ...employmentDetailsPropTypes,
    ...declarationPropTypes,
    ...accountDetailsPropTypes,
    ...additionalDetailsPropTypes,
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },
});

export default masterDataServiceProps(
    downTimeServiceProps(
        entryProps(
            identityDetailsProps(
                personalDetailsProps(
                    residentialDetailsProps(
                        employmentDetailsProps(
                            declarationProps(
                                additionalDetailsProps(accountDetailsProps(PremierConfirmation))
                            )
                        )
                    )
                )
            )
        )
    )
);
