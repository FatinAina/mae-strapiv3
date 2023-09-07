import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";

import { getAnalyticScreenName } from "@screens/CasaSTP/helpers/CasaSTPHelpers";

import {
    PREMIER_SELECT_FPX_BANK,
    PREMIER_ACTIVATE_ACCOUNT,
    MORE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { fetchBankList } from "@redux/services/CasaSTP/apiGetBankList";

import {
    PREMIER_CLEAR_ALL,
    CASA_STP_NTB_USER,
    CASA_STP_DEBIT_CARD_NTB_USER,
} from "@constants/casaConfiguration";
import { CASA_STP_PRODUCTS } from "@constants/casaStrings";
import { DISABLED, YELLOW } from "@constants/colors";
import {
    NEXT_SMALL_CAPS,
    NOTE_ZEST,
    ZEST_CASA_ACTIVATE_ACCOUNT_TITLE,
    ZEST_CASA_ACTIVATION_CHOICE_DESCRIPTION,
    ZEST_CASA_ACTIVATE_ACCOUNT_NOTE,
    ZEST_CASA_ACTIVATE_ACCOUNT_NOTE_CONTINUED,
} from "@constants/strings";

import { entryPropTypes } from "./PremierIntroScreen";

const PremierActivateAccount = (props) => {
    const { navigation } = props;

    // Hooks to access reducer data
    const masterDataReducer = useSelector((state) => state.masterDataReducer);
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const getBankListReducer = useSelector((state) => state.getBankListReducer);
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const draftUserAccountInquiryReducer = useSelector(
        (state) => state.draftUserAccountInquiryReducer
    );

    const accountActivationAmount = masterDataReducer?.pmaActivationAmountNTB;
    const kawankuamoutActivateAmount = masterDataReducer?.kawanKuActivationAmountNTB;
    const { userStatus } = prePostQualReducer;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    useEffect(() => {
        init();
    }, []);

    const init = () => {
        console.log("[PremierActivateAccount] >> [init]");
        callGetBankListService();
    };

    function callGetBankListService() {
        console.log("[PremierActivateAccount] >> [callGetBankListService]");
        const body = {
            acctNo:
                userStatus === CASA_STP_NTB_USER || userStatus === CASA_STP_DEBIT_CARD_NTB_USER
                    ? prePostQualReducer.acctNo
                    : draftUserAccountInquiryReducer.acctNo,
        };

        dispatch(fetchBankList(body, (result) => {}));
    }

    function onCloseTap() {
        console.log("[PremierActivateAccount] >> [onCloseTap]");
        dispatch({ type: PREMIER_CLEAR_ALL });
        navigation.navigate(MORE);
    }

    function onNextTap() {
        console.log("[PremierActivateAccount] >> [onNextTap]");
        if (getBankListReducer.status === "success") {
            navigation.navigate("PremierModuleStack", {
                screen: PREMIER_SELECT_FPX_BANK,
            });
        }
    }

    function productActivateAmount() {
        const premierProduct =
            CASA_STP_PRODUCTS[0] ||
            CASA_STP_PRODUCTS[1] ||
            CASA_STP_PRODUCTS[4] ||
            CASA_STP_PRODUCTS[5];
        const savingsProduct =
            CASA_STP_PRODUCTS[2] ||
            CASA_STP_PRODUCTS[3] ||
            CASA_STP_PRODUCTS[6] ||
            CASA_STP_PRODUCTS[7];
        if (premierProduct) {
            return accountActivationAmount;
        } else if (savingsProduct) {
            return kawankuamoutActivateAmount;
        }
    }

    const analyticScreenName = getAnalyticScreenName(
        entryReducer?.productName,
        PREMIER_ACTIVATE_ACCOUNT,
        ""
    );

    return (
        <ScreenContainer backgroundType="color" analyticScreenName={analyticScreenName}>
            <ScreenLayout
                header={
                    <HeaderLayout headerRightElement={<HeaderCloseButton onPress={onCloseTap} />} />
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
                                    text={ZEST_CASA_ACTIVATE_ACCOUNT_TITLE}
                                />
                                <SpaceFiller height={4} />
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={22}
                                    textAlign="left"
                                    text={ZEST_CASA_ACTIVATION_CHOICE_DESCRIPTION(
                                        productActivateAmount()
                                    )}
                                />
                                <SpaceFiller height={24} />
                                <Typo fontWeight="500" lineHeight={22} textAlign="left">
                                    {NOTE_ZEST}
                                    <Typo
                                        lineHeight={22}
                                        textAlign="left"
                                        text={ZEST_CASA_ACTIVATE_ACCOUNT_NOTE}
                                    />
                                </Typo>
                                <SpaceFiller height={16} />
                                <Typo
                                    lineHeight={22}
                                    textAlign="left"
                                    text={ZEST_CASA_ACTIVATE_ACCOUNT_NOTE_CONTINUED}
                                />
                                <SpaceFiller height={16} />
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>

                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <ActionButton
                            fullWidth
                            activeOpacity={getBankListReducer.status === "success" ? 1 : 0.5}
                            backgroundColor={
                                getBankListReducer.status === "success" ? YELLOW : DISABLED
                            }
                            componentCenter={
                                <Typo lineHeight={18} fontWeight="600" text={NEXT_SMALL_CAPS} />
                            }
                            onPress={onNextTap}
                        />
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

export const activateAccountPropTypes = (PremierActivateAccount.propTypes = {
    ...entryPropTypes,
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

export default PremierActivateAccount;
