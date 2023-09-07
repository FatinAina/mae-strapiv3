import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { handleOnboardedUserActivation } from "@screens/CasaSTP/helpers/CasaSTPHelpers";
import {
    ACCOUNT_TAB_NAME,
    ACTIVATE_GA,
    APPLY_M2U_PREMIER,
    APPLY_SCREEN_NANME,
    APPLY_ZESTI,
} from "@screens/ZestCASA/helpers/AnalyticsEventConstants";
import { checkDownTimeAndGetMasterData } from "@screens/ZestCASA/helpers/ZestHelpers";

import { GACasaSTP } from "@services/analytics/analyticsCasaSTP";

import {
    MAE_MODULE_STACK,
    MAE_INTRODUCTION,
    ZEST_CASA_STACK,
    ZEST_CASA_ENTRY,
    STP_PRODUCT_APPLY_SCREEN,
    BANKINGV2_MODULE,
    PREMIER_MODULE_STACK,
    PREMIER_ACTIVATE_ACCOUNT_IDENTITY_DETAILS,
    PREMIER_INTRO_SCREEN,
} from "@navigation/navigationConstant";

import ProductApplyItem from "@components/Cards/ProductApplyItem";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { logEvent } from "@services/analytics";
import { GAOnboarding } from "@services/analytics/analyticsSTPMae";

import { CASA_SERVICE_TYPES } from "@constants/casaStrings";
import { MEDIUM_GREY } from "@constants/colors";
import {
    ACTIVATE_ACCOUNT,
    FA_ACTION_NAME,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_TAB_NAME,
    PLSTP_CARD_INTRO_HEADER,
} from "@constants/strings";
import { PREMIER_NTB_URL } from "@constants/url";

import * as DataModel from "@utils/dataModel";

const AccountsScreen = ({ navigation, productList, activateProductList }) => {
    // Hooks to dispatch reducer action
    const dispatch = useDispatch();
    const getAccountListReducer = useSelector((state) => state.getAccountListReducer);
    const { accountListings } = getAccountListReducer ?? [];
    const { getModel } = useModelController();
    const { isOnboard } = getModel("user");
    const { isM2uPremierEnable } = getModel("zestModule");

    const onProductListTap = useCallback(
        async (serviceType) => {
            console.log("[AccountsScreen] >> [onProductListTap]");
            switch (serviceType) {
                case "MAE": {
                    GAOnboarding.onApplyMAE();
                    const result = await DataModel.checkServerOperationTime("accountCreation");
                    if (result.statusCode === "0000") {
                        navigation.navigate(MAE_MODULE_STACK, {
                            screen: MAE_INTRODUCTION,
                            params: {
                                entryStack: "More",
                                entryScreen: "Apply",
                            },
                        });
                    } else {
                        showErrorToast({ message: result.statusDesc });
                    }
                    break;
                }
                case "M2UP": {
                    // assuming "M2UP" is serviceType code for Apply M2U Premier
                    if (isM2uPremierEnable) {
                        logEvent(FA_SELECT_ACTION, {
                            [FA_SCREEN_NAME]: APPLY_SCREEN_NANME,
                            [FA_TAB_NAME]: ACCOUNT_TAB_NAME,
                            [FA_ACTION_NAME]: APPLY_M2U_PREMIER,
                        });

                        checkDownTimeAndGetMasterData(dispatch, false);
                        navigation.navigate(ZEST_CASA_STACK, {
                            screen: ZEST_CASA_ENTRY,
                            params: {
                                isZest: false,
                            },
                        });
                    } else {
                        navigation.navigate(BANKINGV2_MODULE, {
                            screen: STP_PRODUCT_APPLY_SCREEN,
                            params: {
                                url: PREMIER_NTB_URL,
                                headerText: "Apply Accounts",
                            },
                        });
                    }
                    break;
                }
                case "ZEST": {
                    logEvent(FA_SELECT_ACTION, {
                        [FA_SCREEN_NAME]: APPLY_SCREEN_NANME,
                        [FA_TAB_NAME]: ACCOUNT_TAB_NAME,
                        [FA_ACTION_NAME]: APPLY_ZESTI,
                    });

                    checkDownTimeAndGetMasterData(dispatch, true);
                    navigation.navigate(ZEST_CASA_STACK, {
                        screen: ZEST_CASA_ENTRY,
                        params: {
                            isZest: true,
                        },
                    });
                    break;
                }
                case CASA_SERVICE_TYPES[0]: {
                    onCasaProductTap(navigation, CASA_SERVICE_TYPES[0]);
                    break;
                }
                case CASA_SERVICE_TYPES[1]: {
                    onCasaProductTap(navigation, CASA_SERVICE_TYPES[1]);
                    break;
                }
                case CASA_SERVICE_TYPES[2]: {
                    onCasaProductTap(navigation, CASA_SERVICE_TYPES[2]);
                    break;
                }
                case CASA_SERVICE_TYPES[3]: {
                    onCasaProductTap(navigation, CASA_SERVICE_TYPES[3]);
                    break;
                }
                default:
                    break;
            }
        },
        [dispatch, isM2uPremierEnable, navigation]
    );

    function onCasaProductTap(navigation, type) {
        const list = productList.filter((value) => value?.serviceType === type);
        const params = list[0]?.params;
        const faActionName = params?.eventName;
        GACasaSTP.onProductTileSelect(APPLY_SCREEN_NANME, ACCOUNT_TAB_NAME, faActionName);
        navigation.navigate(PREMIER_MODULE_STACK, {
            screen: PREMIER_INTRO_SCREEN,
            params,
        });
    }

    const onActivateProductListTap = useCallback(
        async (serviceType) => {
            console.log("[AccountsScreen] >> [onActivateProductListTap]");

            if (serviceType === "CasaActivate") {
                if (isOnboard) {
                    const { icNumber } = getModel("user");
                    handleOnboardedUserActivation(dispatch, navigation, accountListings, icNumber);
                } else {
                    navigation.navigate(PREMIER_MODULE_STACK, {
                        screen: PREMIER_ACTIVATE_ACCOUNT_IDENTITY_DETAILS,
                    });
                }

                logEvent(FA_SELECT_ACTION, {
                    [FA_SCREEN_NAME]: APPLY_SCREEN_NANME,
                    [FA_TAB_NAME]: ACCOUNT_TAB_NAME,
                    [FA_ACTION_NAME]: ACTIVATE_GA,
                });
            } else {
                GAOnboarding.onActivateMAE();
            }
        },
        [accountListings, dispatch, isOnboard, navigation]
    );

    function renderList(heading, listData, onPress, isActivateList) {
        return (
            <View>
                {listData && listData.length > 0 ? (
                    <View style={styles.sectionHeaderContainer}>
                        <Typography
                            style={styles.sectionHeader}
                            fontSize={16}
                            lineHeight={15}
                            fontWeight="600"
                            textAlign="left"
                            text={heading}
                        />
                    </View>
                ) : null}

                {listData.map((item, index) => {
                    return <AccountFeaturesCard key={index} item={item} onDone={onPress} />;
                })}
            </View>
        );
    }

    return (
        <ScrollView>
            <View style={styles.containerBlue}>
                {renderList(ACTIVATE_ACCOUNT, activateProductList, onActivateProductListTap, true)}
                {renderList(PLSTP_CARD_INTRO_HEADER, productList, onProductListTap)}
            </View>
        </ScrollView>
    );
};

function AccountFeaturesCard({ item, onDone }) {
    function onDonePress() {
        onDone(item?.serviceType);
    }

    return (
        <View key={item?.id} style={styles.rowAccountItem}>
            <ProductApplyItem
                bgImage={item?.bgImage}
                text={{ header: item?.serviceTitle, subHeader: item?.description }}
                cardType="MEDIUM"
                onCardPressed={onDonePress}
            />
        </View>
    );
}

AccountFeaturesCard.propTypes = {
    item: PropTypes.shape({
        bgImage: PropTypes.any,
        description: PropTypes.any,
        icon: PropTypes.any,
        id: PropTypes.any,
        serviceTitle: PropTypes.any,
        serviceType: PropTypes.any,
    }),
    onDone: PropTypes.func,
};

AccountsScreen.propTypes = {
    activateProductList: PropTypes.arrayOf(PropTypes.object),
    isNTB: PropTypes.bool,
    navigation: PropTypes.shape({
        navigate: PropTypes.func,
    }),
    productList: PropTypes.any,
};

const styles = StyleSheet.create({
    containerBlue: {
        // alignItems: "center",
        backgroundColor: MEDIUM_GREY,
        flex: 1,
        width: "100%",
    },
    rowAccountItem: { flex: 1, marginHorizontal: 20, paddingTop: 12 },
    sectionHeader: { height: 20 },
    sectionHeaderContainer: { marginHorizontal: 24, marginTop: 12 },
});

export default AccountsScreen;
