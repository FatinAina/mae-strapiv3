import React from "react";
import Typo from "@components/Text";
import PropTypes from "prop-types";
import { Platform, StyleSheet, View } from "react-native";
import { getShadow } from "@utils/dataModel/utility";
import ActionButton from "@components/Buttons/ActionButton";
import {
    YELLOW,
    GREY,
    WHITE,
    DISABLED,
} from "@constants/colors";

function AgentInfoTile({ agentInfo, onPressCall, onPressMessage, isRemoved, isCancelled }) {
    const agentName = (agentInfo?.name || agentInfo?.display_name) ?? "";
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
                    <Typo lineHeight={18} fontWeight="600" text={agentName} />
                    <View style={Style.agentButtonRow}>
                        {/* Call */}
                        <ActionButton
                            width={120}
                            backgroundColor={WHITE}
                            borderStyle="solid"
                            borderWidth={1}
                            borderColor={GREY}
                            componentCenter={<Typo fontWeight="600" lineHeight={18} text="Call" />}
                            style={Style.call}
                            onPress={onPressCall}
                        />

                        {/* Message */}
                        <ActionButton
                            width={120}
                            backgroundColor={isRemoved || isCancelled ? DISABLED : YELLOW}
                            disabled={!!(isRemoved || isCancelled)}
                            componentCenter={
                                <Typo
                                    fontWeight="600"
                                    lineHeight={18}
                                    text="Message"
                                    style={
                                        isRemoved || isCancelled ? Style.disableMessageText : null
                                    }
                                />
                            }
                            onPress={onPressMessage}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
}
const Style = StyleSheet.create({
salesRepEmptyCont: {
    marginBottom: 40,
    marginTop: 20,
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
agentButtonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
    width: "100%",
},
shadow: {
    ...getShadow({
        elevation: 8,
    }),
},
horizontalMargin: {
    marginHorizontal: 24,
},
call: {
    marginRight: 7,
},
disableMessageText: {
    color: GREY,
},
});

AgentInfoTile.propTypes = {
    agentInfo: PropTypes.object,
    propertyId: PropTypes.number,
    onPressCall: PropTypes.func,
    onPressMessage: PropTypes.func,
    isRemoved: PropTypes.bool,
    isCancelled: PropTypes.bool,
};
export default AgentInfoTile;
