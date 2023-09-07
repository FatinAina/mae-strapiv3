import React from "react";
import Typo from "@components/Text";
import PropTypes from "prop-types";
import { getShadow } from "@utils/dataModel/utility";
import { Platform, StyleSheet, View, } from "react-native";
import {
    WHITE,
} from "@constants/colors";

import VerticalStepper from "../VerticalStepper";

function StatusIndicator({ data }) {
    return (
        <View style={Platform.OS === "ios" ? Style.shadow : {}}>
            <View
                style={[
                    Platform.OS === "ios" ? {} : Style.shadow,
                    Style.statusDetailsContainer,
                    Style.horizontalMargin,
                ]}
            >
                <Typo
                    fontSize={16}
                    fontWeight="600"
                    lineHeight={20}
                    text="Status"
                    textAlign="left"
                    style={Style.statusLabel}
                />
                <>
                    {data.map((item, index) => {
                        return (
                            <VerticalStepper
                                key={index}
                                number={item.number}
                                color={item.color}
                                title={item.title}
                                titleColor={item.titleColor}
                                description={item.description}
                                isLastItem={item.isLastItem}
                            />
                        );
                    })}
                </>
            </View>
        </View>
    );
}

StatusIndicator.propTypes = {
    data: PropTypes.array,
};
const Style = StyleSheet.create({
shadow: {
    ...getShadow({
        elevation: 8,
    }),
},
statusDetailsContainer: {
    backgroundColor: WHITE,
    borderRadius: 8,
    marginTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 24,
    paddingTop: 24,
},

statusLabel: {
    marginBottom: 15,
},
horizontalMargin: {
    marginHorizontal: 24,
},
});

export default StatusIndicator;
