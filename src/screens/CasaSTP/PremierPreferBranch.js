import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, ScrollView, Platform, Image, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector } from "react-redux";

import { PREMIER_PREFER_BRANCH, PREMIER_ACCOUNT_DETAILS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

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

import {
    NEAREST_BRANCH,
    SELECTED_NEAREST_BRANCH,
    PREFER_OTHER_BRANCH,
} from "@constants/casaStrings";
import { YELLOW, WHITE, ROYAL_BLUE } from "@constants/colors";
import { CONFIRM } from "@constants/strings";

import assets from "@assets";

import { getAnalyticScreenName } from "./helpers/CasaSTPHelpers";

const PremierPreferBranch = (props) => {
    const { navigation } = props;
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);

    function onConfirmTap() {
        navigation.goBack();
    }

    function nextScreen() {
        props.updateConfirmationScreenStatusForAccountDetails(true);
        navigation.push(PREMIER_ACCOUNT_DETAILS, {
            isFromPreferredBranch: true,
        });
    }

    function preferBranchBodyWrapper() {
        return (
            <View>
                <SpaceFiller height={24} />
                <Typo lineHeight={21} textAlign="left" text={NEAREST_BRANCH} />
                <SpaceFiller height={12} />
                <View style={Style.preferBranchContainer}>
                    <Image source={assets.iconGreyLocation} style={Style.pinPointStyle} />
                    <Typo
                        fontWeight="600"
                        lineHeight={18}
                        textAlign="left"
                        text={props?.branchValue?.name}
                    />
                </View>
            </View>
        );
    }
    const analyticScreenName = getAnalyticScreenName(
        entryReducer?.productName,
        PREMIER_PREFER_BRANCH,
        ""
    );
    return (
        <ScreenContainer backgroundType="color" analyticScreenName={analyticScreenName}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerRightElement={<HeaderCloseButton onPress={onConfirmTap} />}
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
                                    text={SELECTED_NEAREST_BRANCH}
                                />
                                {preferBranchBodyWrapper()}
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>
                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <ActionButton
                            activeOpacity={1}
                            backgroundColor={YELLOW}
                            fullWidth
                            componentCenter={
                                <Typo lineHeight={18} fontWeight="600" text={CONFIRM} />
                            }
                            onPress={onConfirmTap}
                        />
                        <SpaceFiller height={24} />
                        <TouchableOpacity style={Style.newButton} onPress={nextScreen}>
                            <Typo
                                lineHeight={18}
                                fontWeight="600"
                                text={PREFER_OTHER_BRANCH}
                                color={ROYAL_BLUE}
                            />
                        </TouchableOpacity>
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};
export const PremierPreferBranchTypes = (PremierPreferBranch.propTypes = {
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
        width: "100%",
    },
    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 40,
    },
    preferBranchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: WHITE,
        height: 50,
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    pinPointStyle: {
        marginRight: 11,
    },
});
export default masterDataServiceProps(
    downTimeServiceProps(
        scorePartyServiceProps(entryProps(accountDetailsProps(PremierPreferBranch)))
    )
);
