import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View } from "react-native";

import Typo from "@components/Text";

import { RED, GREEN, HONEYDEW, PALE_PINK } from "@constants/colors";

function CarbonAmountContainer({ carbonAmount }) {
    const carbonAmountFloat = parseFloat(carbonAmount).toFixed(1);
    const isCarbonOffset = Math.sign(carbonAmount) === -1;
    return (
        <View style={styles.containerAlignment}>
            <View style={styles.carbonAmtContainer(isCarbonOffset)}>
                <Typo
                    fontWeight="600"
                    fontSize={10}
                    lineHeight={16}
                    color={isCarbonOffset ? GREEN : RED}
                    text={`${isCarbonOffset ? "" : "+"}${carbonAmountFloat} Kg`}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    carbonAmtContainer: (isNegativeAmt) => ({
        alignItems: "center",
        marginTop: 5,
        borderRadius: 30,
        backgroundColor: isNegativeAmt ? HONEYDEW : PALE_PINK,
        paddingHorizontal: 8,
        paddingVertical: 3,
    }),
    containerAlignment: { alignItems: "flex-end" },
});

CarbonAmountContainer.propTypes = {
    carbonAmount: PropTypes.number,
};

CarbonAmountContainer.defaultProps = {
    carbonAmount: 0,
};
export default React.memo(CarbonAmountContainer);
