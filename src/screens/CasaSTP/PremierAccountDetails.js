import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import {
    updatedViewPartyBody,
    isNTBUser,
    isETBUser,
    getAnalyticScreenName,
} from "@screens/CasaSTP/helpers/CasaSTPHelpers";

import {
    PREMIER_DECLARATION,
    PREMIER_ADDITIONAL_DETAILS,
    PREMIER_ACCOUNT_DETAILS,
    PREMIER_CONFIRMATION,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";

import { PREPOSTQUAL_CLEAR } from "@redux/actions/services/prePostQualAction";
import { SCORE_PARTY_ERROR } from "@redux/actions/services/scorePartyAction";
import accountDetailsProps from "@redux/connectors/ZestCASA/accountDetailsConnector";
import entryProps from "@redux/connectors/ZestCASA/entryConnector";
import downTimeServiceProps, {
    downTimeServicePropTypes,
} from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/services/masterDataConnector";
import scorePartyServiceProps, {
    scorePartyServicePropTypes,
} from "@redux/connectors/services/scorePartyConnector";

import { HIGH_RISK_CUSTOMER_CODE, PREMIER_CLEAR_ALL } from "@constants/casaConfiguration";
import {
    FILL_IN_PREFERRED_BRANCH,
    FILL_IN_PREFERRED_BRANCH2,
    STEP4OF4,
    STEP3OF3,
} from "@constants/casaStrings";
import { DARK_GREY, YELLOW, DISABLED } from "@constants/colors";
import {
    NEXT_SMALL_CAPS,
    PLEASE_SELECT,
    STEPUP_MAE_BRANCH,
    DISTRICT,
    STEPUP_MAE_ADDRESS_STATE,
    DONE,
    CANCEL,
    CONFIRM,
} from "@constants/strings";

const PremierAccountDetails = (props) => {
    const { navigation, route } = props;
    const params = route?.params ?? {};

    // Hooks to access reducer data
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const scorePartyReducer = useSelector((state) => state.scorePartyReducer);
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
    const identityDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.identityDetailsReducer
    );
    const { userStatus, viewPartyResult } = prePostQualReducer;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const {
        accountPurposeIndex,
        purpose,
        branchStatesList,
        branchStateIndex,
        branchDistrictIndex,
        branchIndex,
        branchDistrictDropdownItems,
        branchDropdownItems,
    } = props;

    const scrollPickerInitialState = {
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    };

    const [accountPurposeScrollPicker, setAccountPurposeScrollPicker] =
        useState(scrollPickerInitialState);

    const [branchStateScrollPicker, setBranchStateScrollPicker] =
        useState(scrollPickerInitialState);

    const [branchDistrictScrollPicker, setBranchDistrictScrollPicker] =
        useState(scrollPickerInitialState);

    const [branchScrollPicker, setBranchScrollPicker] = useState(scrollPickerInitialState);

    const [accountDetailsObject, setaccountDetailsObject] = useState({});

    useEffect(() => {
        init();
        setaccountDetailsObject({
            accountPurposeIndex,
            purpose,
            branchStatesList,
            branchStateIndex,
            branchDistrictIndex,
            branchIndex,
            branchDistrictDropdownItems,
            branchDropdownItems,
        });

        if (props.isFromConfirmationScreenForAccountDetails) {
            setBackupData();
        }
    }, []);

    const setBackupData = async () => {
        props.updateBackupValue(
            props.branchStateIndex,
            props.branchStateValue,
            props.branchDistrictIndex,
            props.branchDistrictValue,
            props.branchIndex,
            props.branchValue
        );
        await props.getBranchDistrictDropdownItems(
            props?.branchStateValue?.name,
            props.branchDistrictsList
        );
        await props.getBranchDropdownItems(props?.branchDistrictValue?.name, props.branchList);
    };

    useEffect(() => {
        props.checkButtonEnabled();
    }, [accountPurposeIndex, branchStateIndex, branchDistrictIndex, branchIndex]);

    useEffect(() => {
        props.checkBranchDistrictDropdownEnabled();
    }, [branchDistrictDropdownItems]);

    useEffect(() => {
        props.checkBranchDropdownEnabled();
    }, [branchDropdownItems]);

    const init = async () => {
        console.log("[PmaAccountDetails] >> [init]");
        dispatch({ type: SCORE_PARTY_ERROR, error: false });
        if (!isNTBUser(userStatus)) callScorePartyService();
    };

    async function callScorePartyService() {
        console.log("[PmaAccountDetails] >> [callScorePartyService]");

        await props.getScorePartyPremier(
            updatedViewPartyBody(
                viewPartyResult,
                personalDetailsReducer,
                residentialDetailsReducer,
                employmentDetailsReducer,
                prePostQualReducer,
                entryReducer?.productName
            )
        );
    }

    async function onBackTap() {
        console.log("[PmaAccountDetails] >> [onBackTap]");
        if (props.isFromConfirmationScreenForAccountDetails) {
            await resetData();
        }
        navigation.goBack();
    }

    async function resetData() {
        if (accountPurposeIndex !== accountDetailsObject.accountPurposeIndex) {
            props.updateAccountPurpose(
                accountDetailsObject.accountPurposeIndex,
                accountDetailsObject.purpose[accountDetailsObject.accountPurposeIndex]
            );
        }
        props.updateBranchState(
            accountDetailsReducer.stateIndexBackup,
            accountDetailsReducer.stateValueBackup
        );
        await props.getBranchDistrictDropdownItems(
            accountDetailsReducer?.stateValueBackup?.name,
            props.branchDistrictsList
        );

        props.updateBranchDistrict(
            accountDetailsReducer.districtIndexBackup,
            accountDetailsReducer.districtValueBackup
        );
        await props.getBranchDropdownItems(
            accountDetailsReducer?.districtValueBackup?.name,
            props.branchList
        );

        props.updateBranch(
            accountDetailsReducer.branchIndexBackup,
            accountDetailsReducer.branchValueBackup
        );
    }

    function onCloseTap() {
        console.log("[PmaAccountDetails] >> [onCloseTap]");

        if (
            identityDetailsReducer.identityType === 1 &&
            props.isFromConfirmationScreenForAccountDetails
        ) {
            resetData();
            navigation.navigate(PREMIER_CONFIRMATION);
        } else {
            // Clear all data from PMA reducers
            dispatch({ type: PREMIER_CLEAR_ALL });
            props.clearDownTimeReducer();
            props.clearMasterDataReducer();
            dispatch({ type: PREPOSTQUAL_CLEAR });
            navigation.popToTop();
            navigation.goBack();
        }
    }

    function onNextTap() {
        console.log("[PmaAccountDetails] >> [onNextTap]");
        const { customerRiskRatingCode } = scorePartyReducer;

        if (
            (props.isAccountDetailsContinueButtonEnabled ||
                (isNTBUser(userStatus) !== null &&
                    props?.branchStateIndex !== null &&
                    props?.branchDistrictIndex !== null &&
                    props?.branchIndex !== null)) &&
            !props.errorScoreParty
        ) {
            if (props.isFromConfirmationScreenForAccountDetails) {
                navigation.goBack();
            } else {
                if (customerRiskRatingCode === HIGH_RISK_CUSTOMER_CODE) {
                    navigation.navigate(PREMIER_ADDITIONAL_DETAILS);
                } else {
                    navigation.navigate(PREMIER_DECLARATION);
                }
            }
        }
    }

    const stepCount = () => {
        if (props.identityType !== 1 && !isETBUser(userStatus)) {
            return STEP4OF4;
        } else {
            return isNTBUser(userStatus) ? params?.step ?? STEP4OF4 : STEP3OF3;
        }
    };

    function onBranchStateDropdownPillDidTap() {
        setBranchStateScrollPicker({
            isDisplay: true,
            selectedIndex: props.branchStateIndex,
            filterType: "",
            data: props.branchStatesList,
        });
    }

    function onBranchDistrictDropdownPillDidTap() {
        setBranchDistrictScrollPicker({
            isDisplay: true,
            selectedIndex: props.branchDistrictIndex,
            filterType: "",
            data: props.branchDistrictDropdownItems,
        });
    }

    function onBranchDropdownPillDidTap() {
        if (props.branchDropdownItems.length !== 0) {
            setBranchScrollPicker({
                isDisplay: true,
                selectedIndex: props.branchIndex,
                filterType: "",
                data: props.branchDropdownItems,
            });
        }
    }

    function onAccountPurposeScrollPickerDoneButtonDidTap(data, index) {
        props.updateAccountPurpose(index, data);
        setAccountPurposeScrollPicker(scrollPickerInitialState);
    }

    function onBranchStateScrollPickerDoneButtonDidTap(data, index) {
        props.clearDistrictData();
        props.clearBranchData();
        props.updateBranchState(index, data);
        props.getBranchDistrictDropdownItems(data.name, props.branchDistrictsList);
        setBranchStateScrollPicker(scrollPickerInitialState);
    }

    function onBranchDistrictScrollPickerDoneButtonDidTap(data, index) {
        props.clearBranchData();
        props.updateBranchDistrict(index, data);
        props.getBranchDropdownItems(data.name, props.branchList);
        setBranchDistrictScrollPicker(scrollPickerInitialState);
    }

    function onBranchListScrollPickerDoneButtonDidTap(data, index) {
        props.updateBranch(index, data);
        setBranchScrollPicker(scrollPickerInitialState);
    }

    function onScrollPickerCancelButtonDidTap() {
        setAccountPurposeScrollPicker(scrollPickerInitialState);
        setBranchStateScrollPicker(scrollPickerInitialState);
        setBranchDistrictScrollPicker(scrollPickerInitialState);
        setBranchScrollPicker(scrollPickerInitialState);
    }

    const analyticScreenName = getAnalyticScreenName(
        entryReducer?.productName,
        PREMIER_ACCOUNT_DETAILS,
        ""
    );

    return (
        <ScreenContainer backgroundType="color" analyticScreenName={analyticScreenName}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerCenterElement={
                            props.isFromConfirmationScreenForAccountDetails ? null : (
                                <Typo
                                    fontSize={12}
                                    fontWeight="600"
                                    lineHeight={15}
                                    text={stepCount()}
                                    color={DARK_GREY}
                                />
                            )
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
                                    text={
                                        props?.route?.params?.isFromPreferredBranch
                                            ? FILL_IN_PREFERRED_BRANCH2
                                            : FILL_IN_PREFERRED_BRANCH
                                    }
                                />
                                {buildAccountDetailsForm()}
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>

                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <ActionButton
                            activeOpacity={
                                (props.isAccountDetailsContinueButtonEnabled ||
                                    (isNTBUser(userStatus) !== null &&
                                        props?.branchStateIndex !== null &&
                                        props?.branchDistrictIndex !== null &&
                                        props?.branchIndex !== null)) &&
                                !props.errorScoreParty
                                    ? 1
                                    : 0.5
                            }
                            backgroundColor={
                                (props.isAccountDetailsContinueButtonEnabled ||
                                    (isNTBUser(userStatus) !== null &&
                                        props?.branchStateIndex !== null &&
                                        props?.branchDistrictIndex !== null &&
                                        props?.branchIndex !== null)) &&
                                !props.errorScoreParty
                                    ? YELLOW
                                    : DISABLED
                            }
                            fullWidth
                            componentCenter={
                                <Typo
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={
                                        props.isFromConfirmationScreenForAccountDetails
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
                showMenu={accountPurposeScrollPicker.isDisplay}
                list={accountPurposeScrollPicker.data}
                selectedIndex={accountPurposeScrollPicker.selectedIndex}
                onRightButtonPress={onAccountPurposeScrollPickerDoneButtonDidTap}
                onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <ScrollPickerView
                showMenu={branchStateScrollPicker.isDisplay}
                list={branchStateScrollPicker.data}
                selectedIndex={branchStateScrollPicker.selectedIndex}
                onRightButtonPress={onBranchStateScrollPickerDoneButtonDidTap}
                onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <ScrollPickerView
                showMenu={branchDistrictScrollPicker.isDisplay}
                list={branchDistrictScrollPicker.data}
                selectedIndex={branchDistrictScrollPicker.selectedIndex}
                onRightButtonPress={onBranchDistrictScrollPickerDoneButtonDidTap}
                onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <ScrollPickerView
                showMenu={branchScrollPicker.isDisplay}
                list={branchScrollPicker.data}
                selectedIndex={branchScrollPicker.selectedIndex}
                onRightButtonPress={onBranchListScrollPickerDoneButtonDidTap}
                onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
        </ScreenContainer>
    );

    function buildAccountDetailsForm() {
        return (
            <>
                <TitleAndDropdownPill
                    title={STEPUP_MAE_ADDRESS_STATE}
                    titleFontWeight="400"
                    dropdownTitle={props?.branchStateValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onBranchStateDropdownPillDidTap}
                />
                <TitleAndDropdownPill
                    title={DISTRICT}
                    titleFontWeight="400"
                    dropdownTitle={props?.branchDistrictValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onBranchDistrictDropdownPillDidTap}
                    isDisabled={!props.isBranchDistrictDropdownEnabled}
                />
                <TitleAndDropdownPill
                    title={STEPUP_MAE_BRANCH}
                    titleFontWeight="400"
                    dropdownTitle={props?.branchValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onBranchDropdownPillDidTap}
                    isDisabled={!props.isBranchDropdownEnabled}
                />
            </>
        );
    }
};

export const accountDetailsPropTypes = (PremierAccountDetails.propTypes = {
    ...masterDataServicePropTypes,
    ...downTimeServicePropTypes,
    ...scorePartyServicePropTypes,

    // State
    accountPurposeIndex: PropTypes.number,
    accountPurposeValue: PropTypes.object,
    branchStateIndex: PropTypes.number,
    branchStateValue: PropTypes.object,
    branchDistrictIndex: PropTypes.number,
    branchDistrictValue: PropTypes.object,
    branchIndex: PropTypes.number,
    branchValue: PropTypes.object,
    isAccountDetailsContinueButtonEnabled: PropTypes.bool,
    isBranchDistrictDropdownEnabled: PropTypes.bool,
    isBranchDropdownEnabled: PropTypes.bool,
    isFromConfirmationScreenForAccountDetails: PropTypes.bool,
    branchDistrictDropdownItems: PropTypes.array,
    branchDropdownItems: PropTypes.array,

    // Dispatch
    updateAccountPurpose: PropTypes.func,
    updateBranchState: PropTypes.func,
    updateBranchDistrict: PropTypes.func,
    updateBranch: PropTypes.func,
    checkButtonEnabled: PropTypes.func,
    checkBranchDistrictDropdownEnabled: PropTypes.func,
    checkBranchDropdownEnabled: PropTypes.func,
    clearAccountDetailsReducer: PropTypes.func,
    clearDistrictData: PropTypes.func,
    clearBranchData: PropTypes.func,
    updateConfirmationScreenStatusForAccountDetails: PropTypes.func,
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
});

export default masterDataServiceProps(
    downTimeServiceProps(
        scorePartyServiceProps(entryProps(accountDetailsProps(PremierAccountDetails)))
    )
);
