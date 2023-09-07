import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, ScrollView, Platform, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { getAnalyticScreenName } from "@screens/CasaSTP/helpers/CasaSTPHelpers";

import {
    PREMIER_DECLARATION,
    PREMIER_CONFIRMATION,
    PREMIER_ADDITIONAL_DETAILS,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";
import TitleAndDropdownPillWithIcon from "@components/TitleAndDropdownPillWithIcon";

import { PREPOSTQUAL_CLEAR } from "@redux/actions/services/prePostQualAction";
import additionalDetailsProps from "@redux/connectors/ZestCASA/additionalDetailsConnector";
import entryProps from "@redux/connectors/ZestCASA/entryConnector";
import downTimeServiceProps, {
    downTimeServicePropTypes,
} from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/services/masterDataConnector";

import { PREMIER_CLEAR_ALL } from "@constants/casaConfiguration";
import { DISABLED, YELLOW } from "@constants/colors";
import {
    ADDITIONAL_INFORMATION,
    NEXT_SMALL_CAPS,
    FILL_IN_ADDITIONAL_DETAILS,
    PLEASE_SELECT,
    PRIMARY_SOURCE_WEALTH,
    ZEST_CASA_PRIMARY_INCOME,
    ZEST_CASA_SOURCE_OF_WEALTH,
    CONFIRM,
    DONE,
    CANCEL,
} from "@constants/strings";

const PremierAdditionalDetails = (props) => {
    const { navigation } = props;

    const { primaryIncomeIndex, primaryWealthIndex } = props;

    const scrollPickerInitialState = {
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    };

    const [primaryIncomeScrollPicker, setPrimaryIncomeScrollPicker] =
        useState(scrollPickerInitialState);

    const [primarySourceOfWealthScrollPicker, setPrimarySourceOfWealthScrollPicker] =
        useState(scrollPickerInitialState);

    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const [additionalDetailsObject, setAdditionalDetailsObject] = useState({});
    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        props.checkButtonEnabled();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [primaryIncomeIndex, primaryWealthIndex]);

    const init = async () => {
        console.log("[PMAAdditionalDetails] >> [init]");
        setAdditionalDetailsObject({
            primaryIncomeIndex,
            primaryWealthIndex,
            sourceOfFundOrigin: props.sourceOfFundOrigin,
            sourceOfWealthOrigin: props.sourceOfWealthOrigin,
        });
    };

    function onBackTap() {
        console.log("[PMAAdditionalDetails] >> [onBackTap]");
        if (props.isAdditionalDetailsContinueButtonEnabled) {
            if (primaryIncomeIndex !== additionalDetailsObject.primaryIncomeIndex) {
                const data =
                    additionalDetailsObject.sourceOfFundOrigin[
                        additionalDetailsObject.primaryIncomeIndex
                    ];
                props.updatePrimaryIncome(additionalDetailsObject.primaryIncomeIndex, data);
            }
            if (primaryWealthIndex !== additionalDetailsObject.primaryWealthIndex) {
                const data =
                    additionalDetailsObject.sourceOfWealthOrigin[
                        additionalDetailsObject.primaryWealthIndex
                    ];
                props.updatePrimaryWealth(additionalDetailsObject.primaryWealthIndex, data);
            }
        }
        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[PMAAdditionalDetails] >> [onCloseTap]");
        // Clear all data from PMA reducers
        dispatch({ type: PREMIER_CLEAR_ALL });
        props.clearDownTimeReducer();
        props.clearMasterDataReducer();
        dispatch({ type: PREPOSTQUAL_CLEAR });
        navigation.popToTop();
        navigation.goBack();
    }

    function onNextTap() {
        console.log("[PMAAdditionalDetails] >> [onNextTap]");
        if (props.isAdditionalDetailsContinueButtonEnabled) {
            props.isFromConfirmationScreenForAdditionalDetails
                ? navigation.goBack()
                : props?.route?.params?.isFromConfirmation
                ? navigation.navigate(PREMIER_CONFIRMATION)
                : navigation.navigate(PREMIER_DECLARATION);
        }
    }

    function onInfoIconDidTap() {
        setIsPopupVisible(true);
    }

    function onPopupCrossButtonDidTap() {
        setIsPopupVisible(false);
    }

    function onPrimaryIncomeDropdownDidTap() {
        setPrimaryIncomeScrollPicker({
            isDisplay: true,
            selectedIndex: props.primaryIncomeIndex,
            filterType: "",
            data: props.sourceOfFundOrigin,
        });
    }

    function onPrimarySourceOfWealthDropdownDidTap() {
        setPrimarySourceOfWealthScrollPicker({
            isDisplay: true,
            selectedIndex: props.primaryWealthIndex,
            filterType: "",
            data: props.sourceOfWealthOrigin,
        });
    }

    function onPrimaryIncomeScrollPickerDoneButtonDidTap(data, index) {
        props.updatePrimaryIncome(index, data);
        setPrimaryIncomeScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onPrimarySourceOfWealthScrollPickerDoneButtonDidTap(data, index) {
        props.updatePrimaryWealth(index, data);
        setPrimarySourceOfWealthScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function scrollPickerOnPressCancel() {
        setPrimaryIncomeScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });

        setPrimarySourceOfWealthScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    const analyticScreenName = getAnalyticScreenName(
        entryReducer?.productName,
        PREMIER_ADDITIONAL_DETAILS,
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
                                text={ADDITIONAL_INFORMATION}
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
                                    text={FILL_IN_ADDITIONAL_DETAILS}
                                />
                                {buildAdditionalDetailsView()}
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>

                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <ActionButton
                            activeOpacity={props.isAdditionalDetailsContinueButtonEnabled ? 1 : 0.5}
                            backgroundColor={
                                props.isAdditionalDetailsContinueButtonEnabled ? YELLOW : DISABLED
                            }
                            fullWidth
                            componentCenter={
                                <Typo
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={
                                        props?.route?.params?.isFromConfirmation ||
                                        props?.isFromConfirmationScreenForAdditionalDetails
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
                showMenu={primaryIncomeScrollPicker.isDisplay}
                list={primaryIncomeScrollPicker.data}
                selectedIndex={primaryIncomeScrollPicker.selectedIndex}
                onRightButtonPress={onPrimaryIncomeScrollPickerDoneButtonDidTap}
                onLeftButtonPress={scrollPickerOnPressCancel}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <ScrollPickerView
                showMenu={primarySourceOfWealthScrollPicker.isDisplay}
                list={primarySourceOfWealthScrollPicker.data}
                selectedIndex={primarySourceOfWealthScrollPicker.selectedIndex}
                onRightButtonPress={onPrimarySourceOfWealthScrollPickerDoneButtonDidTap}
                onLeftButtonPress={scrollPickerOnPressCancel}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            {buildSourceOfWealthInfoPopupDialog()}
        </ScreenContainer>
    );

    function buildAdditionalDetailsView() {
        return (
            <>
                <TitleAndDropdownPill
                    title={ZEST_CASA_PRIMARY_INCOME}
                    titleFontWeight="400"
                    dropdownTitle={
                        props.primaryIncomeValue && props.primaryIncomeValue.name
                            ? props.primaryIncomeValue.name
                            : PLEASE_SELECT
                    }
                    dropdownOnPress={onPrimaryIncomeDropdownDidTap}
                />
                <TitleAndDropdownPillWithIcon
                    title={PRIMARY_SOURCE_WEALTH}
                    titleFontWeight="400"
                    dropdownOnInfoPress={onInfoIconDidTap}
                    dropdownTitle={
                        props.primaryWealthValue && props.primaryWealthValue.name
                            ? props.primaryWealthValue.name
                            : PLEASE_SELECT
                    }
                    dropdownOnPress={onPrimarySourceOfWealthDropdownDidTap}
                />
            </>
        );
    }

    function buildSourceOfWealthInfoPopupDialog() {
        return (
            <Popup
                visible={isPopupVisible}
                title={PRIMARY_SOURCE_WEALTH}
                description={ZEST_CASA_SOURCE_OF_WEALTH}
                onClose={onPopupCrossButtonDidTap}
            />
        );
    }
};

export const additionalDetailsPropTypes = (PremierAdditionalDetails.propTypes = {
    ...masterDataServicePropTypes,
    ...downTimeServicePropTypes,

    // States
    primaryIncomeIndex: PropTypes.string,
    primaryIncomeValue: PropTypes.string,
    primaryWealthIndex: PropTypes.string,
    primaryWealthValue: PropTypes.string,
    isFromConfirmationScreenForAdditionalDetails: PropTypes.bool,
    isAdditionalDetailsContinueButtonEnabled: PropTypes.bool,

    // Dispatch
    updatePrimaryIncome: PropTypes.func,
    updatePrimaryWealth: PropTypes.func,
    checkButtonEnabled: PropTypes.func,
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
    downTimeServiceProps(entryProps(additionalDetailsProps(PremierAdditionalDetails)))
);
