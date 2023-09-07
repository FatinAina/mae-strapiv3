import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useSelector, useDispatch } from "react-redux";

import {
    callGetAccountsListService,
    identifyUserStatusPremier,
} from "@screens/CasaSTP/helpers/CasaSTPHelpers";
import {
    identifyUserStatus as zestIdentifyUserStatus,
    handleOnboardedUser,
} from "@screens/ZestCASA/helpers/ZestHelpers";

import {
    PREMIER_ACTIVATION_PENDING,
    ON_BOARDING_M2U_USERNAME,
    ON_BOARDING_MODULE,
    MAE_M2U_USERNAME,
    ACCOUNTS_SCREEN,
    PREMIER_ACCOUNT_NOT_FOUND,
    ZEST_CASA_LOGIN_ENTRY,
    ZEST_CASA_STACK,
    ZEST_CASA_ACCOUNT_NOT_FOUND,
    PREMIER_MODULE_STACK,
    MAE_MODULE_STACK,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInputWithReturnType";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { bankingGetDataMayaM2u, invokeL3 } from "@services";
import { GACasaSTP } from "@services/analytics/analyticsCasaSTP";

import {
    ACTIVATE_ACCOUNT_ID_NUMBER_ACTION,
    ACTIVATE_ACCOUNT_IDENTITY_CONTINUE_BUTTON_DISABLED_ACTION,
    IDENTITY_DETAILS_CLEAR,
} from "@redux/actions/ZestCASA/identityDetailsAction";
import { PREPOSTQUAL_UPDATE_USER_STATUS } from "@redux/actions/services/prePostQualAction";
import entryProps from "@redux/connectors/ZestCASA/entryConnector";
import { getMasterDataPremier } from "@redux/services/CasaSTP/apiMasterData";
import { prePostQualPremier } from "@redux/services/CasaSTP/apiPrePostQual";
import { getMasterData as zestGetMasterData } from "@redux/services/apiMasterData";
import { prePostQual as zestPrePostQual } from "@redux/services/apiPrePostQual";
import { onBoardDetails, onBoardDetails3, onBoardDetails4 } from "@redux/utilities/actionUtilities";

import {
    MYKAD_CODE,
    PRE_QUAL_PRE_LOGIN_FLAG,
    MYKAD_ID_TYPE,
    CASA_STP_NTB_USER,
    PREMIER_PRE_QUAL_POST_LOGIN_FLAG,
    CASA_STP_FULL_ETB_USER,
    CASA_STP_DRAFT_USER,
    CASA_STP_WITHOUT_M2U_USER,
} from "@constants/casaConfiguration";
import {
    PREMIER_ACCOUNT_ACTIVATION_ENTER_MYKAD,
    M2U_REGISTRATION,
    M2U_REGISTRATION_DESC,
    M2U_REGISTRATION_BUTTON,
    PRODUCT_NAME_KAWANKU,
    PRODUCT_NAME_SAI,
    PRODUCT_NAME_PMA,
    PRODUCT_NAME_PM1,
    PM1_PRODUCT_NAME,
    PMA_PRODUCT_NAME,
    KAWANKU_SAVINGS_PRODUCT_NAME,
    KAWANKU_SAVINGSI_PRODUCT_NAME,
    PRODUCT_NAME_ZESTI,
    PRODUCT_NAME_M2U_PREMIER,
} from "@constants/casaStrings";
import {
    PREMIER_RESUME_CUSTOMER_INQUIRY_NTB,
    PREMIER_RESUME_CUSTOMER_INQUIRY_ETB,
} from "@constants/casaUrl";
import { DISABLED, YELLOW } from "@constants/colors";
import {
    CONTINUE,
    MYKAD_NUMBER,
    MYKAD_NUMBER_PLACEHOLDER,
    ACCOUNT_LIST_NOT_FOUND_MESSAGE,
} from "@constants/strings";
import { ZEST_CASA_RESUME_CUSTOMER_INQUIRY_NTB } from "@constants/url";
import { ZEST_DRAFT_USER } from "@constants/zestCasaConfiguration";

import { retrieveuserDOB } from "@utils/momentUtils";

import { entryPropTypes } from "./PremierIntroScreen";
import {
    APPLY_ACTIVATEACCOUNT_MYKADID,
    APPLY_ETB_REGISTERM2U,
} from "./helpers/AnalyticsEventConstants";

const PremierActivateAccountIdentityDetails = (props) => {
    const { navigation } = props;
    const { getModel } = useModelController();

    const casaWithoutM2UUsers = [CASA_STP_WITHOUT_M2U_USER];
    const casaDraftUsers = [CASA_STP_DRAFT_USER];

    // Hooks for access reducer data
    const identityDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.identityDetailsReducer
    );
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);

    const [isM2UIdPopupVisible, setIsM2UIdPopupVisible] = useState(false);
    const [productName, setProductName] = useState();
    // Hooks for dispatch reducer action
    const dispatch = useDispatch();
    const successStatusCodes = ["4400", "6600", "3300"];

    useEffect(() => {
        dispatch({ type: IDENTITY_DETAILS_CLEAR });
        init();
    }, []);

    const init = async () => {
        console.log("[PremierActivateAccountIdentityDetails] >> [init]");
        dispatch(getMasterDataPremier());
    };

    function onCloseTap() {
        console.log("[PremierActivateAccountIdentityDetails] >> [onCloseTap]");
        // Clear all data from PM1 reducers
        dispatch({ type: IDENTITY_DETAILS_CLEAR });
        navigation.goBack();
    }

    function onBackTap() {
        console.log("[PremierActivateAccountIdentityDetails] >> [onBackTap]");
        dispatch({ type: IDENTITY_DETAILS_CLEAR });
        navigation.goBack();
    }

    function createFilledUserDetailsObject(reducer) {
        const fullName = reducer?.customerName;

        const onBoardDetails2 = {
            idNo: reducer.idNo,
            userDOB: retrieveuserDOB(reducer.idNo?.substring(0, 6)),
            maeCustomerInquiry: reducer.data,
            selectedIDCode: reducer.idNo,
            selectedIDType: MYKAD_ID_TYPE,
            from: CASA_STP_NTB_USER,
            isPM1: true,
            m2uStatus: prePostQualReducer.userStatus,
            navigation,
        };

        const details = {
            entryScreen: ACCOUNTS_SCREEN,
            onBoardDetails: onBoardDetails(reducer),
            onBoardDetails2,
            onBoardDetails3: onBoardDetails3(reducer),
            onBoardDetails4: onBoardDetails4(reducer),
        };

        const onBoardDetailsWithoutFullName = details.onBoardDetails;

        const onBoardDetailsWithFullName = {
            ...onBoardDetailsWithoutFullName,
            fullName,
        };

        return {
            ...details,
            onBoardDetails: onBoardDetailsWithFullName,
        };
    }

    function onNextTap() {
        // navigation.navigate('PM1ActivationPending')
        if (identityDetailsReducer.isActivationAccountIdentityContinueButtonEnabled) {
            const { isPostLogin } = getModel("auth");
            const url = isPostLogin
                ? PREMIER_RESUME_CUSTOMER_INQUIRY_ETB
                : PREMIER_RESUME_CUSTOMER_INQUIRY_NTB;
            const body = {
                idType: MYKAD_CODE,
                birthDate: "",
                preOrPostFlag: isPostLogin
                    ? PREMIER_PRE_QUAL_POST_LOGIN_FLAG
                    : PRE_QUAL_PRE_LOGIN_FLAG,
                icNo: identityDetailsReducer.identityNumber,
            };
            callPreQualService(url, body, async (result) => {
                if (result) {
                    const { isOnboard } = getModel("user");
                    const { productName } = result;
                    if (
                        productName === PRODUCT_NAME_ZESTI ||
                        productName === PRODUCT_NAME_M2U_PREMIER
                    ) {
                        if (isOnboard) {
                            dispatch(zestGetMasterData());
                            try {
                                const path = `/summary?type=A`;

                                const response = await bankingGetDataMayaM2u(path, false);

                                if (response && response.data && response.data.code === 0) {
                                    const { accountListings } = response.data.result;

                                    if (accountListings && accountListings.length) {
                                        handleOnboardedUser(
                                            dispatch,
                                            navigation,
                                            accountListings,
                                            identityDetailsReducer.identityNumber
                                        );
                                    }
                                }
                            } catch (error) {
                                return showErrorToast({
                                    message: ACCOUNT_LIST_NOT_FOUND_MESSAGE,
                                });
                            }
                        } else {
                            handleZest();
                        }
                    } else {
                        props.updateIsCasaStp(true);
                        switch (productName) {
                            case PRODUCT_NAME_PM1: {
                                props.updateIsPM1(true);
                                props.updateIsProductName(PM1_PRODUCT_NAME);
                                break;
                            }
                            case PRODUCT_NAME_PMA: {
                                props.updateIsPMA(true);
                                props.updateIsProductName(PMA_PRODUCT_NAME);
                                break;
                            }
                            case PRODUCT_NAME_KAWANKU: {
                                props.updateIsKawanku(true);
                                props.updateIsProductName(KAWANKU_SAVINGS_PRODUCT_NAME);
                                break;
                            }
                            case PRODUCT_NAME_SAI: {
                                props.updateIsKawankuSavingsI(true);
                                props.updateIsProductName(KAWANKU_SAVINGSI_PRODUCT_NAME);
                                break;
                            }
                        }
                        if (isOnboard) {
                            if (isPostLogin) {
                                callGetAccountsListService(
                                    true,
                                    dispatch,
                                    () => {
                                        navigation.navigate(PREMIER_MODULE_STACK, {
                                            screen: PREMIER_ACTIVATION_PENDING,
                                        });
                                    },
                                    CASA_STP_FULL_ETB_USER
                                );
                            } else {
                                const httpResp = await invokeL3(true);
                                const result = httpResp.data;
                                const { code } = result;

                                if (code !== 0) return;
                                callGetAccountsListService(
                                    true,
                                    dispatch,
                                    () => {
                                        navigation.navigate(PREMIER_MODULE_STACK, {
                                            screen: PREMIER_ACTIVATION_PENDING,
                                        });
                                    },
                                    CASA_STP_FULL_ETB_USER
                                );
                            }
                        } else {
                            // branch activation
                            navigation.navigate(ON_BOARDING_MODULE, {
                                screen: ON_BOARDING_M2U_USERNAME,
                                params: {
                                    filledUserDetails: {
                                        userTypeSend: CASA_STP_DRAFT_USER,
                                    },
                                    screenName: PREMIER_ACTIVATION_PENDING,
                                },
                            });
                        }
                    }
                }
            });
        }
    }

    function handleZest() {
        if (identityDetailsReducer.isActivationAccountIdentityContinueButtonEnabled) {
            const body = {
                idType: MYKAD_CODE,
                birthDate: "",
                preOrPostFlag: PRE_QUAL_PRE_LOGIN_FLAG,
                icNo: identityDetailsReducer.identityNumber,
            };
            callZestPreQualService(ZEST_CASA_RESUME_CUSTOMER_INQUIRY_NTB, body, (result) => {
                if (result) {
                    navigation.navigate(ZEST_CASA_STACK, {
                        screen: ZEST_CASA_LOGIN_ENTRY,
                    });
                }
            });
        }
    }

    async function callZestPreQualService(extendedUrl, body, callback) {
        dispatch(
            zestPrePostQual(
                extendedUrl,
                body,
                (result, userStatus) => {
                    const { statusCode } = result;
                    if (userStatus === ZEST_DRAFT_USER) {
                        callback(result);
                    } else if (statusCode === 400) {
                        navigation.navigate(ZEST_CASA_STACK, {
                            screen: ZEST_CASA_ACCOUNT_NOT_FOUND,
                            params: {
                                isVisitBranchMode: false,
                            },
                        });
                    } else {
                        navigation.navigate(ZEST_CASA_STACK, {
                            screen: ZEST_CASA_ACCOUNT_NOT_FOUND,
                            params: {
                                isVisitBranchMode: true,
                            },
                        });
                    }
                },
                true
            )
        );
    }

    async function callPreQualService(extendedUrl, body, callback) {
        dispatch(
            prePostQualPremier(
                extendedUrl,
                body,
                (result, userStatus) => {
                    const {
                        statusCode,
                        custStatus,
                        branchApprovalStatusCode,
                        m2uIndicator,
                        productName,
                        onboardingIndicatorCode,
                    } = result;
                    let updatedUserStatus = "";
                    setProductName(productName);
                    GACasaSTP.onPremierIdentityDetailsNext(getAnalyticScreenName(), productName);
                    if (
                        productName === PRODUCT_NAME_ZESTI ||
                        productName === PRODUCT_NAME_M2U_PREMIER
                    ) {
                        updatedUserStatus = zestIdentifyUserStatus(
                            custStatus,
                            branchApprovalStatusCode,
                            m2uIndicator
                        );
                        dispatch({
                            type: PREPOSTQUAL_UPDATE_USER_STATUS,
                            userStatus: updatedUserStatus,
                        });
                        callback(result);
                        return;
                    } else {
                        updatedUserStatus = identifyUserStatusPremier(
                            custStatus,
                            branchApprovalStatusCode,
                            m2uIndicator,
                            productName,
                            onboardingIndicatorCode
                        );
                        dispatch({
                            type: PREPOSTQUAL_UPDATE_USER_STATUS,
                            userStatus: updatedUserStatus,
                        });
                    }

                    if (casaWithoutM2UUsers.includes(updatedUserStatus)) {
                        setIsM2UIdPopupVisible(true);
                        GACasaSTP.onPremierActivation(APPLY_ETB_REGISTERM2U);
                    } else if (casaDraftUsers.includes(updatedUserStatus)) {
                        callback(result);
                    } else if (successStatusCodes.includes(statusCode)) {
                        navigation.navigate(PREMIER_ACCOUNT_NOT_FOUND, {
                            isVisitBranchMode: true,
                        });
                    } else {
                        navigation.navigate(PREMIER_ACCOUNT_NOT_FOUND, {
                            isVisitBranchMode: false,
                        });
                    }
                },
                true
            )
        );
    }

    function onM2UIdPopupCloseButtonDidTap() {
        setIsM2UIdPopupVisible(false);
        getAnalyticScreenName();
    }

    function registerM2U() {
        setIsM2UIdPopupVisible(false);
        GACasaSTP.onregisterM2U(getAnalyticScreenName(), productName);
        navigation.navigate(MAE_MODULE_STACK, {
            screen: MAE_M2U_USERNAME,
            params: { filledUserDetails: createFilledUserDetailsObject(prePostQualReducer) },
        });
    }

    function onMyKadInputDidChange(value) {
        dispatch({ type: ACTIVATE_ACCOUNT_ID_NUMBER_ACTION, identityNumber: value });
        dispatch({ type: ACTIVATE_ACCOUNT_IDENTITY_CONTINUE_BUTTON_DISABLED_ACTION });
    }

    function getAnalyticScreenName() {
        return isM2UIdPopupVisible ? APPLY_ETB_REGISTERM2U : APPLY_ACTIVATEACCOUNT_MYKADID;
    }
    return (
        <ScreenContainer backgroundType="color" analyticScreenName={getAnalyticScreenName()}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={Style.formContainer}>
                        <View style={Style.contentContainer}>
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={24}
                                textAlign="left"
                                text={PREMIER_ACCOUNT_ACTIVATION_ENTER_MYKAD}
                            />
                            <SpaceFiller height={36} />
                            {buildMyKadDetailsView()}
                        </View>
                    </View>
                </ScrollView>

                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <ActionButton
                            activeOpacity={
                                identityDetailsReducer.isActivationAccountIdentityContinueButtonEnabled
                                    ? 1
                                    : 0.5
                            }
                            backgroundColor={
                                identityDetailsReducer.isActivationAccountIdentityContinueButtonEnabled
                                    ? YELLOW
                                    : DISABLED
                            }
                            fullWidth
                            componentCenter={
                                <Typo lineHeight={18} fontWeight="600" text={CONTINUE} />
                            }
                            onPress={onNextTap}
                        />
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
            {isM2UIdPopupVisible && (
                <Popup
                    visible={isM2UIdPopupVisible}
                    onClose={onM2UIdPopupCloseButtonDidTap}
                    title={M2U_REGISTRATION}
                    description={M2U_REGISTRATION_DESC}
                    primaryAction={{
                        text: M2U_REGISTRATION_BUTTON,
                        onPress: registerM2U,
                    }}
                />
            )}
        </ScreenContainer>
    );

    function buildMyKadDetailsView() {
        return (
            <>
                <Typo lineHeight={18} textAlign="left" text={MYKAD_NUMBER} />
                <SpaceFiller height={16} />
                <TextInput
                    errorMessage={identityDetailsReducer.identityNumberErrorMessage}
                    isValid={identityDetailsReducer.identityNumberErrorMessage === null}
                    isValidate
                    maxLength={12}
                    keyboardType="number-pad"
                    placeholder={MYKAD_NUMBER_PLACEHOLDER}
                    onChangeText={onMyKadInputDidChange}
                    returnKeyType="done"
                />
                <SpaceFiller height={16} />
            </>
        );
    }
};

PremierActivateAccountIdentityDetails.propTypes = {
    ...entryPropTypes,
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

    formContainer: {
        marginBottom: 40,
    },
});

export default entryProps(PremierActivateAccountIdentityDetails);
