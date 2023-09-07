import PropTypes from "prop-types";
import React from "react";
import { Dimensions, Platform, ScrollView, StyleSheet } from "react-native";

const SPACING_FOR_CARD_INSET = Dimensions.get("window").width * 0.1 - 10;

const SnapBanner = ({ renderList, cardWidth }) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate={0} // Disable deceleration
            snapToInterval={cardWidth} // size for a card including marginLeft and marginRight
            snapToAlignment="center" // Snap to the center
            contentInset={{
                // iOS ONLY
                top: 0,
                left: 24, // Left spacing for the very first card
                bottom: 0,
                right: SPACING_FOR_CARD_INSET, // Right spacing for the very last card
            }}
            contentOffset={{
                x: -24,
            }}
            contentContainerStyle={styles.container}
            onScrollBeginDrag={() => {}}
        >
            {renderList()}
        </ScrollView>
    );
};

SnapBanner.propTypes = {
    renderList: PropTypes.func,
    cardWidth: PropTypes.number,
};

const styles = StyleSheet.create({
    container: {
        // contentInset alternative for Android
        paddingHorizontal: Platform.OS === "android" ? SPACING_FOR_CARD_INSET : 0, // Horizontal spacing before and after the ScrollView
    },
});

export default React.memo(SnapBanner);
