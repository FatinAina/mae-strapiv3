import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import {
    isNTBUser,
    isETBUser,
    updatedViewPartyBody,
    getAnalyticScreenName,
} from "@screens/CasaSTP/helpers/CasaSTPHelpers";

import {
    PREMIER_EMPLOYMENT_DETAILS,
    ZEST_CASA_STACK,
    ZEST_CASA_SELECT_DEBIT_CARD,
    PREMIER_ACCOUNT_DETAILS,
    PREMIER_MODULE_STACK,
    PREMIER_ADDITIONAL_DETAILS,
    PREMIER_CONFIRMATION,
    PREMIER_DECLARATION,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SearchableList from "@components/FormComponents/SearchableList";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { MASTERDATA_UPDATE_SOURCE_OF_FUND_COUNTRY } from "@redux/actions/services/masterDataAction";
import { PREPOSTQUAL_CLEAR } from "@redux/actions/services/prePostQualAction";
import employmentDetailsProps from "@redux/connectors/ZestCASA/employmentDetailsConnector";
import entryProps from "@redux/connectors/ZestCASA/entryConnector";
import downTimeServiceProps, {
    downTimeServicePropTypes,
} from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/services/masterDataConnector";
import { scorePartyServicePropTypes } from "@redux/connectors/services/scorePartyConnector";
import { scorePartyForETB } from "@redux/services/CasaSTP/apiScoreParty";
import { getDebitCards } from "@redux/services/apiGetDebitCards";

import { PREMIER_CLEAR_ALL } from "@constants/casaConfiguration";
import { MINIMUM_INCOME_TEXT } from "@constants/casaStrings";
import { DARK_GREY, DISABLED, YELLOW } from "@constants/colors";
import { INELGIBLE_OCCUPATION_LIST } from "@constants/data";
import {
    NEXT_SMALL_CAPS,
    FILL_IN_EMPLOYMENT_DETAILS,
    PLEASE_SELECT,
    PLSTP_EMPLOYER_NAME,
    MAYBANK,
    STEPUP_MAE_OCUPATION,
    STEPUP_MAE_SECTOR,
    ZEST_EMPLOYMENT_TYPE,
    ZEST_MONTHLY_INCOME,
    INCOME_SOURCE,
    DONE,
    CANCEL,
    STEP2OF3,
    STEP3OF4,
    CONFIRM,
    STEP2OF2,
} from "@constants/strings";

const PremierEmploymentDetails = (props) => {
    const { getModel } = useModelController();
    const { navigation, route } = props;
    const params = route?.params ?? {};

    // Hooks to access reducer data
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);

    const identityDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.identityDetailsReducer
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
    const masterDataReducer = useSelector((state) => state.masterDataReducer);

    const { userStatus, viewPartyResult } = prePostQualReducer;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const {
        employerName,
        occupationIndex,
        occupation,
        sectorIndex,
        sector,
        employmentTypeIndex,
        employmentType,
        monthlyIncomeIndex,
        incomeRange,
        incomeSourceIndex,
        sourceOfFundCountry,
    } = props;

    const scrollPickerInitialState = {
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    };

    const [employmentTypeScrollPicker, setEmploymentTypeScrollPicker] =
        useState(scrollPickerInitialState);

    const [monthlyIncomeScrollPicker, setMonthlyIncomeScrollPicker] =
        useState(scrollPickerInitialState);

    const [incomeSourceScrollPicker, setIncomeSourceScrollPicker] =
        useState(scrollPickerInitialState);

    const [employementDetailsObject, setemployementDetailsObject] = useState({});

    const [isOccupationSearchOn, setIsOccupationSearchOn] = useState(false);

    const [isSectorSearchOn, setIsSectorSearchOn] = useState(false);

    const [occupationSelectedCount, setOccupationSelectedCount] = useState(0);

    const noEmployerExistID = INELGIBLE_OCCUPATION_LIST;

    const [isMasterData, setIsMasterData] = useState(false);

    const { exceedLimitScreen } = getModel("isFromMaxTry") || false;
    const [isFromMaxTry] = useState(exceedLimitScreen);

    useEffect(() => {
        init();
        setemployementDetailsObject({
            employerName,
            occupationIndex,
            occupation,
            sectorIndex,
            sector,
            employmentTypeIndex,
            employmentType,
            monthlyIncomeIndex,
            incomeRange,
            incomeSourceIndex,
            sourceOfFundCountry,
        });
    }, []);

    useEffect(() => {
        const pageDesc = masterDataReducer.casaPageDescriptionValue;
        if (pageDesc !== null) {
            setIsMasterData(pageDesc);
        }
    }, [masterDataReducer]);

    useEffect(() => {
        props.checkButtonEnabled();
    }, [
        employerName,
        occupationIndex,
        sectorIndex,
        employmentTypeIndex,
        monthlyIncomeIndex,
        incomeSourceIndex,
    ]);

    const init = async () => {
        let position = -1;
        const malaysiaItem = props.sourceOfFundCountry?.find((item, index) => {
            const { name } = item;
            if (name.toLowerCase() === "malaysia") {
                position = index;
                return item;
            }
        });

        let sourceOfFundCountry = props.sourceOfFundCountry?.filter(
            (item) => item.name.toLowerCase() !== "malaysia"
        );
        sourceOfFundCountry = [malaysiaItem, ...sourceOfFundCountry];
        dispatch({
            type: MASTERDATA_UPDATE_SOURCE_OF_FUND_COUNTRY,
            sourceOfFundCountry,
        });

        if (position !== -1 && props.incomeSourceValue?.name?.toLowerCase() === "malaysia") {
            props.updateIncomeSource(0, malaysiaItem);
        }
        console.log("[PremierEmploymentDetails] >> [init]");

        if (
            !props.isFromConfirmationScreenForEmploymentDetails &&
            props.incomeSourceValue === null
        ) {
            // To get the value of MYS(Malaysia) in the occupation list
            const findMalaysiaData = props.sourceOfFundCountry.filter(
                (rowData) => rowData.value === "MYS"
            );
            props.updateIncomeSource(0, findMalaysiaData[0]);
        }
        if (isNTBUser(userStatus) && props.occupationIndex !== null) {
            setOccupationSelectedCount(2);
        }
    };

    function onBackTap() {
        console.log("[PremierEmploymentDetails] >> [onBackTap]");
        if (props.isFromConfirmationScreenForEmploymentDetails) {
            if (employerName !== employementDetailsObject.employerName) {
                props.updateEmployerName(employementDetailsObject.employerName);
            }
            if (occupationIndex !== employementDetailsObject.occupationIndex) {
                props.updateOccupation(
                    employementDetailsObject.occupationIndex,
                    employementDetailsObject.occupation[employementDetailsObject.occupationIndex]
                );
            }
            if (sectorIndex !== employementDetailsObject.sectorIndex) {
                props.updateSector(
                    employementDetailsObject.sectorIndex,
                    employementDetailsObject.sector[employementDetailsObject.sectorIndex]
                );
            }
            if (employmentTypeIndex !== employementDetailsObject.employmentTypeIndex) {
                props.updateEmploymentType(
                    employementDetailsObject.employmentTypeIndex,
                    employementDetailsObject.employmentType[
                        employementDetailsObject.employmentTypeIndex
                    ]
                );
            }
            if (monthlyIncomeIndex !== employementDetailsObject.monthlyIncomeIndex) {
                props.updateMonthlyIncome(
                    employementDetailsObject.monthlyIncomeIndex,
                    employementDetailsObject.incomeRange[
                        employementDetailsObject.monthlyIncomeIndex
                    ]
                );
            }
            if (incomeSourceIndex !== employementDetailsObject.incomeSourceIndex) {
                props.updateIncomeSource(
                    employementDetailsObject.incomeSourceIndex,
                    employementDetailsObject.sourceOfFundCountry[
                        employementDetailsObject.incomeSourceIndex
                    ]
                );
            }
        }
        navigation.goBack();
    }

    function prePopulateSectorAndEmploymentType(item) {
        if (noEmployerExistID.includes(item?.value)) {
            let sectorIndex;
            let sectorValue;
            props.sector.forEach((ele, index) => {
                if (ele.value === "8888800") {
                    sectorIndex = index;
                    sectorValue = ele;
                }
            });
            props.updateSector(sectorIndex, sectorValue);

            let employmentTypeIndex;
            let employmentTypeIndexValue;
            props.employmentType.forEach((ele, index) => {
                if (ele.value === "OLF") {
                    employmentTypeIndex = index;
                    employmentTypeIndexValue = ele;
                }
            });
            props.updateEmploymentType(employmentTypeIndex, employmentTypeIndexValue);
        } else {
            props.updateSector(null);
            props.updateEmploymentType(null);
        }
        //Clear monthly income and source of Income for 1st time in ETB or Clear monthly income and source of Income for 2nd time in NTB/passport
        if (
            isETBUser(userStatus) ||
            ((isNTBUser(userStatus) || identityDetailsReducer?.identityType === 2) &&
                occupationSelectedCount > 0)
        ) {
            props.updateMonthlyIncome(null);
            props.updateIncomeSource(null);
        }
        props.updateEmployerName("");
    }

    function onCloseTap() {
        // Clear all data from Premier reducers
        dispatch({ type: PREMIER_CLEAR_ALL });
        props.clearDownTimeReducer();
        props.clearMasterDataReducer();
        dispatch({ type: PREPOSTQUAL_CLEAR });
        navigation.popToTop();
        navigation.goBack();
    }

    //Check whether is ETB user and is from edit click and is there any changed value in sector
    function checkScorePartyForETB() {
        return (
            props.isFromConfirmationScreenForEmploymentDetails &&
            isETBUser(userStatus) &&
            shouldButtonEnable() &&
            monthlyIncomeIndex >= 6
        );
    }

    async function onNextTap() {
        if (isNTBUser(userStatus) && !isFromMaxTry) {
            dispatch(getDebitCards({}));
        }
        if (checkScorePartyForETB()) {
            //Score party api call
            const respFromScoreParty = await scorePartyForETB(
                updatedViewPartyBody(
                    viewPartyResult,
                    personalDetailsReducer,
                    residentialDetailsReducer,
                    employmentDetailsReducer,
                    prePostQualReducer,
                    entryReducer?.productName
                )
            );
            //Check whether the user is high risk or not
            if (respFromScoreParty?.customerRiskRatingCode === "HR") {
                navigation.navigate(PREMIER_MODULE_STACK, {
                    screen: PREMIER_ADDITIONAL_DETAILS,
                    params: {
                        isFromConfirmation: true,
                    },
                });
            } else {
                navigation.navigate(PREMIER_CONFIRMATION);
            }
        } else {
            if (entryReducer.isKawanku || entryReducer.isKawankuSavingsI) {
                // For Kawanku & SavingsI
                if (shouldButtonEnable()) {
                    pageNavigate();
                }
            } else {
                // For PM1 & PMA
                if (monthlyIncomeIndex >= 6 && shouldButtonEnable()) {
                    pageNavigate();
                } else {
                    if (monthlyIncomeIndex < 6 && shouldButtonEnable()) {
                        return showErrorToast({
                            message: isMasterData
                                ? MINIMUM_INCOME_TEXT(isMasterData[0]?.display)
                                : "",
                        });
                    }
                }
            }
        }
    }

    const pageNavigate = () => {
        if (props.isFromConfirmationScreenForEmploymentDetails) {
            navigation.goBack();
        } else if (
            identityDetailsReducer?.identityType === 1 &&
            !isETBUser(userStatus) &&
            !isFromMaxTry
        ) {
            navigation.navigate(ZEST_CASA_STACK, {
                screen: ZEST_CASA_SELECT_DEBIT_CARD,
                params: {
                    from: PREMIER_EMPLOYMENT_DETAILS,
                },
            });
        } else if (isFromMaxTry && !isETBUser(userStatus)) {
            navigation.navigate(PREMIER_DECLARATION);
        } else {
            navigation.navigate(PREMIER_MODULE_STACK, {
                screen: PREMIER_ACCOUNT_DETAILS,
                params: {
                    ...params,
                    step: "Step 3 of 3",
                },
            });
        }
    };

    const stepCount = () => {
        if (identityDetailsReducer?.identityType !== 1 && !isETBUser(userStatus)) {
            return STEP3OF4;
        } else {
            if (isFromMaxTry) {
                return STEP2OF2;
            }
            return STEP2OF3;
        }
    };

    function onCloseModal() {
        setIsOccupationSearchOn(false);
        setIsSectorSearchOn(false);
    }

    async function onCallbackModalOccupation(item) {
        setIsOccupationSearchOn(false);
        await props.updateOccupation(
            props.occupation.map((ele) => ele.value).indexOf(item.value),
            item
        );
        prePopulateSectorAndEmploymentType(item);
        setOccupationSelectedCount(occupationSelectedCount + 1);
    }
    function onCallbackModalSector(item) {
        setIsSectorSearchOn(false);
        props.updateSector(props.sector.map((ele) => ele.value).indexOf(item.value), item);
    }

    function onEmployerInputDidChange(value) {
        props.updateEmployerName(value);
    }

    function onEmploymentTypeDropdownPillDidTap() {
        setEmploymentTypeScrollPicker({
            isDisplay: true,
            selectedIndex: props.employmentTypeIndex,
            filterType: "",
            data: props.employmentType,
        });
    }

    function onMonthlyIncomeDropdownPillDidTap() {
        setMonthlyIncomeScrollPicker({
            isDisplay: true,
            selectedIndex: props.monthlyIncomeIndex,
            filterType: "",
            data: props.incomeRange,
        });
    }

    function onIncomeSourceDropdownPillDidTap() {
        setIncomeSourceScrollPicker({
            isDisplay: true,
            selectedIndex: props.incomeSourceIndex,
            filterType: "",
            data: props.sourceOfFundCountry,
        });
    }

    function onEmploymentTypeScrollPickerDoneButtonDidTap(data, index) {
        props.updateEmploymentType(index, data);
        setEmploymentTypeScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onMonthlyIncomeScrollPickerDoneButtonDidTap(data, index) {
        props.updateMonthlyIncome(index, data);
        setMonthlyIncomeScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onIncomeSourceScrollPickerDoneButtonDidTap(data, index) {
        props.updateIncomeSource(index, data);
        setIncomeSourceScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onScrollPickerCancelButtonDidTap() {
        setMonthlyIncomeScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });

        setIncomeSourceScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });

        setEmploymentTypeScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function shouldButtonEnable() {
        if (noEmployerExistID.includes(props?.occupationValue?.value)) {
            return !(
                occupationIndex == null ||
                sectorIndex == null ||
                employmentTypeIndex == null ||
                monthlyIncomeIndex == null ||
                incomeSourceIndex == null
            );
        } else {
            return props.isEmploymentContinueButtonEnabled;
        }
    }

    const analyticScreenName = getAnalyticScreenName(
        entryReducer?.productName,
        PREMIER_EMPLOYMENT_DETAILS,
        ""
    );
    return (
        <ScreenContainer backgroundType="color" analyticScreenName={analyticScreenName}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={
                            props.isFromConfirmationScreenForEmploymentDetails &&
                            identityDetailsReducer?.identityType === 1 ? null : (
                                <HeaderBackButton onPress={onBackTap} />
                            )
                        }
                        headerCenterElement={
                            props.isFromConfirmationScreenForEmploymentDetails ? null : (
                                <Typo
                                    fontSize={12}
                                    fontWeight="600"
                                    lineHeight={15}
                                    text={stepCount()}
                                    color={DARK_GREY}
                                />
                            )
                        }
                        headerRightElement={
                            <HeaderCloseButton
                                onPress={
                                    identityDetailsReducer?.identityType === 1 &&
                                    props.isFromConfirmationScreenForEmploymentDetails
                                        ? onBackTap
                                        : onCloseTap
                                }
                            />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <View style={Style.scrollWrapper}>
                    <KeyboardAwareScrollView
                        behavior={Platform.OS === "ios" ? "padding" : ""}
                        enabled
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={Style.formContainer}>
                            <View style={Style.contentContainer}>
                                <Typo
                                    lineHeight={21}
                                    textAlign="left"
                                    text={entryReducer?.productTile}
                                />
                                <SpaceFiller height={4} />
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={24}
                                    textAlign="left"
                                    text={FILL_IN_EMPLOYMENT_DETAILS}
                                />
                                <SpaceFiller height={24} />
                                {buildEmploymentDetailsFormMyKad()}
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </View>

                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <ActionButton
                            activeOpacity={shouldButtonEnable() ? 1 : 0.5}
                            backgroundColor={shouldButtonEnable() ? YELLOW : DISABLED}
                            fullWidth
                            componentCenter={
                                <Typo
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={
                                        props.isFromConfirmationScreenForEmploymentDetails
                                            ? CONFIRM
                                            : NEXT_SMALL_CAPS
                                    }
                                />
                            }
                            onPress={onNextTap}
                        />
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
            <ScrollPickerView
                showMenu={employmentTypeScrollPicker.isDisplay}
                list={employmentTypeScrollPicker.data}
                selectedIndex={employmentTypeScrollPicker.selectedIndex}
                onRightButtonPress={onEmploymentTypeScrollPickerDoneButtonDidTap}
                onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <ScrollPickerView
                showMenu={monthlyIncomeScrollPicker.isDisplay}
                list={monthlyIncomeScrollPicker.data}
                selectedIndex={monthlyIncomeScrollPicker.selectedIndex}
                onRightButtonPress={onMonthlyIncomeScrollPickerDoneButtonDidTap}
                onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <ScrollPickerView
                showMenu={incomeSourceScrollPicker.isDisplay}
                list={incomeSourceScrollPicker.data}
                selectedIndex={incomeSourceScrollPicker.selectedIndex}
                onRightButtonPress={onIncomeSourceScrollPickerDoneButtonDidTap}
                onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            {isOccupationSearchOn && props.occupation && (
                <SearchableList
                    onCallback={onCallbackModalOccupation}
                    onClose={onCloseModal}
                    data={props.occupation}
                    type="occupation"
                    noResultMsg="Please select the category that is the closest match to your occupation."
                />
            )}
            {isSectorSearchOn && props.sector && (
                <SearchableList
                    onCallback={onCallbackModalSector}
                    onClose={onCloseModal}
                    data={props.sector}
                    type="sector"
                    noResultMsg="Please select the category that is the closest match to your sector."
                />
            )}
        </ScreenContainer>
    );

    function buildEmploymentDetailsFormMyKad() {
        return (
            <>
                <TitleAndDropdownPill
                    title={STEPUP_MAE_OCUPATION}
                    titleFontWeight="400"
                    dropdownTitle={props?.occupationValue?.name || PLEASE_SELECT}
                    dropdownOnPress={() => setIsOccupationSearchOn(true)}
                />
                {props?.occupationValue?.name && (
                    <>
                        {!noEmployerExistID.includes(props?.occupationValue?.value) ? (
                            <View>
                                <SpaceFiller height={24} />
                                <Typo lineHeight={18} textAlign="left" text={PLSTP_EMPLOYER_NAME} />
                                <SpaceFiller height={12} />
                                <TextInput
                                    errorMessage={props.employerNameErrorMessage}
                                    isValid={props.employerNameErrorMessage === null}
                                    isValidate
                                    maxLength={50}
                                    value={props.employerName}
                                    placeholder={`e.g ${MAYBANK}`}
                                    onChangeText={onEmployerInputDidChange}
                                />
                            </View>
                        ) : null}
                        <TitleAndDropdownPill
                            title={STEPUP_MAE_SECTOR}
                            titleFontWeight="400"
                            dropdownTitle={props?.sectorValue?.name || PLEASE_SELECT}
                            dropdownOnPress={() => setIsSectorSearchOn(true)}
                            isDisabled={noEmployerExistID.includes(props?.occupationValue?.value)}
                        />
                        <TitleAndDropdownPill
                            title={ZEST_EMPLOYMENT_TYPE}
                            titleFontWeight="400"
                            dropdownTitle={props?.employmentTypeValue?.name ?? PLEASE_SELECT}
                            dropdownOnPress={onEmploymentTypeDropdownPillDidTap}
                            isDisabled={noEmployerExistID.includes(props?.occupationValue?.value)}
                        />
                    </>
                )}
                {/* <SpaceFiller height={8} /> */}
                <TitleAndDropdownPill
                    title={ZEST_MONTHLY_INCOME}
                    titleFontWeight="400"
                    dropdownTitle={props?.monthlyIncomeValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onMonthlyIncomeDropdownPillDidTap}
                />
                <TitleAndDropdownPill
                    title={INCOME_SOURCE}
                    titleFontWeight="400"
                    dropdownTitle={props?.incomeSourceValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onIncomeSourceDropdownPillDidTap}
                />
            </>
        );
    }
};

export const employmentDetailsPropTypes = (PremierEmploymentDetails.propTypes = {
    ...masterDataServicePropTypes,
    ...downTimeServicePropTypes,
    ...scorePartyServicePropTypes,
    // State
    employerName: PropTypes.string,
    occupationIndex: PropTypes.number,
    occupationValue: PropTypes.object,
    sectorIndex: PropTypes.number,
    sectorValue: PropTypes.object,
    employmentTypeIndex: PropTypes.number,
    employmentTypeValue: PropTypes.object,
    monthlyIncomeIndex: PropTypes.number,
    monthlyIncomeValue: PropTypes.object,
    incomeSourceIndex: PropTypes.number,
    incomeSourceValue: PropTypes.object,
    isEmploymentContinueButtonEnabled: PropTypes.bool,
    isFromConfirmationScreenForEmploymentDetails: PropTypes.bool,
    employerNameErrorMessage: PropTypes.string,
    occupationDropdownItems: PropTypes.array,
    sectorDropdownItems: PropTypes.array,
    employmentTypeDropdownItems: PropTypes.array,
    monthlyIncomeDropdownItems: PropTypes.array,
    incomeSourceDropdownItems: PropTypes.array,

    // Dispatch
    getOccupationDropdownItems: PropTypes.func,
    updateEmployerName: PropTypes.func,
    updateOccupation: PropTypes.func,
    updateSector: PropTypes.func,
    updateEmploymentType: PropTypes.func,
    updateMonthlyIncome: PropTypes.func,
    updateIncomeSource: PropTypes.func,
    checkButtonEnabled: PropTypes.func,
    clearEmploymentReducer: PropTypes.func,
    updateConfirmationScreenStatusForEmploymentDetails: PropTypes.func,
});

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 40,
    },
    scrollWrapper: {
        height: "86%",
    },
});

export default masterDataServiceProps(
    downTimeServiceProps(entryProps(employmentDetailsProps(PremierEmploymentDetails)))
);
