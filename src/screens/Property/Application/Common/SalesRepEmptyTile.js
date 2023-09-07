import React from "react";
import { Platform, View, Image, StyleSheet } from "react-native";
import { getShadow } from "@utils/dataModel/utility";
import Typo from "@components/Text";
import {
    WHITE,
} from "@constants/colors";
import Assets from "@assets";
import { CONNECT_SALES_REP_TEXT } from "@constants/strings";

function SalesRepEmptyTile() {
    return (
        <View
            style={[
                Platform.OS === "ios" ? Style.shadow : {},
                Style.salesRepEmptyCont,
                Style.horizontalMargin,
            ]}
        >
            <View style={[Platform.OS === "ios" ? {} : Style.shadow, Style.salesRepEmptyInnerCont]}>
                <View style={Style.salesRepEmptyTextCont}>
                    <Typo fontSize={13} lineHeight={18} text={CONNECT_SALES_REP_TEXT} />
                </View>
                <Image style={Style.salesRepEmptyImgCls} source={Assets.salesRepEmpty} />
            </View>
        </View>
    );
}
const Style = StyleSheet.create({

    salesRepEmptyCont: {
        marginBottom: 40,
        marginTop: 20,
    },
    salesRepEmptyImgCls: {
        height: 180,
        width: "100%",
    },
    salesRepEmptyInnerCont: {
        backgroundColor: WHITE,
        borderRadius: 8,
        flex: 1,
        overflow: "hidden",
    },
    salesRepEmptyTextCont: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    shadow: {
        ...getShadow({
            elevation: 8,
        }),
    },
    horizontalMargin: {
        marginHorizontal: 24,
    },
});

export default SalesRepEmptyTile;
