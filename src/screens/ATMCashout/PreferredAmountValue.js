import _ from "lodash";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";

import {
    ADD_PREFERRED_AMOUNT,
    ATM_AMOUNT_SCREEN,
    ATM_PREFERRED_AMOUNT,
    ATM_CASHOUT_STACK,
} from "@navigation/navigationConstant";

import Typo from "@components/Text";
import { showSuccessToast } from "@components/Toast";

import { withModelContext } from "@context";

import { WHITE, GREY, BLACK } from "@constants/colors";
import { ADD_AMOUNT_ATMCASHOUT } from "@constants/strings";

import Images from "@assets";

import { PreferredAmountList } from "./PreferredAmountList";

const PreferredAmountValue = ({
    route,
    navigation,
    onItemPressed,
    selectedItemId,
    setSelectedItemId,
}) => {
    const [preferredAmountList, setPreferredAmountList] = useState([]);
    const [didPerformAddOrUpdate, setDidPerformAddOrUpdate] = useState(false);

    useEffect(() => {
        if (route?.params?.fromPNS) {
            // Handle fromPNS case if needed
        } else if (
            route?.params?.didPerformAddOrUpdate === "update" &&
            route?.params?.preferredAmountList &&
            route?.params?.routeFrom === ATM_AMOUNT_SCREEN
        ) {
            const checkArray = _.isEqual(preferredAmountList, route?.params?.preferredAmountList);
            if (!checkArray) {
                setPreferredAmountList(route?.params?.preferredAmountList);
                setDidPerformAddOrUpdate(true);

                if (route?.params?.disableToast) {
                    showSuccessToast({
                        message: "Preferred amount successfully added.",
                    });
                }

                navigation.setParams({
                    disableToast: false,
                    didPerformAddOrUpdate: "delete",
                });
            }
        } else if (
            !route?.params?.preferredAmountList?.length &&
            route?.params?.routeFrom === ATM_AMOUNT_SCREEN &&
            route?.params?.didPerformAddOrUpdate === "delete"
        ) {
            setPreferredAmountList([]);
        }
    }, [route, navigation]);

    useEffect(() => {
        if (route?.params?.preferredAmountList !== []) {
            setPreferredAmountList(route?.params?.preferredAmountList);
        }
    }, [route?.params?.preferredAmountList]);

    const renderPreferredAmount = () => {
        navigation.navigate(ATM_CASHOUT_STACK, {
            screen: ADD_PREFERRED_AMOUNT,
            params: {
                ...route?.params,
                preferredAmountList: [],
                currentList: preferredAmountList,
                textInputPrefix: "RM",
                textInputMaxLength: 8,
                routeFrom: ATM_PREFERRED_AMOUNT,
            },
        });
    };

    return (
        <View>
            {!preferredAmountList?.length ? (
                <TouchableOpacity activeOpacity={0.9} onPress={renderPreferredAmount}>
                    <View style={styles.addIconBtn}>
                        <View style={styles.addAmount}>
                            <Typo
                                fontSize={16}
                                lineHeight={24}
                                fontWeight="600"
                                text={ADD_AMOUNT_ATMCASHOUT}
                                textAlign="left"
                                color={BLACK}
                            />
                            <Image style={styles.iconAdd} source={Images.icon32BlackAdd} />
                        </View>
                    </View>
                </TouchableOpacity>
            ) : (
                <View style={styles.list}>
                    {preferredAmountList.length && didPerformAddOrUpdate && (
                        <PreferredAmountList
                            onItemPressed={onItemPressed}
                            items={preferredAmountList}
                            textKey="preferredList"
                            hasRadio={true}
                            selectedItemId={selectedItemId}
                            setSelectedItemId={setSelectedItemId}
                        />
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    list: {
        width: "100%",
        paddingRight: 6,
    },
    addIconBtn: {
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 24,
        borderWidth: 1,
        display: "flex",
        flexDirection: "row",
        height: 50,
        justifyContent: "space-between",
        alignItems: "center",
        paddingLeft: 15,
    },
    addAmount: {
        flexDirection: "row",
        width: "100%",
        paddingRight: 24,
        paddingLeft: 24,
        justifyContent: "space-between",
    },
    iconAdd: {
        height: 16,
        marginRight: 10,
        marginTop: 5,
        width: 16,
    },
});

PreferredAmountValue.propTypes = {
    route: PropTypes.object.isRequired,
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        goBack: PropTypes.func,
        navigate: PropTypes.func,
        pop: PropTypes.func,
        setParams: PropTypes.func,
    }),
    onItemPressed: PropTypes.func,
    selectedItemId: PropTypes.number,
    setSelectedItemId: PropTypes.number,
};

export default withModelContext(PreferredAmountValue);
