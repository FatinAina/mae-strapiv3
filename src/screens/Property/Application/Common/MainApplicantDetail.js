import React from "react";
import Typo from "@components/Text";
import PropTypes from "prop-types";
import { Platform, StyleSheet, View, Image } from "react-native";
import { getShadow } from "@utils/dataModel/utility";
import {
    WHITE,
    IRISBLUE,
} from "@constants/colors";
import Assets from "@assets";

function MainApplicantDetail({ mainApplicantInfo }) {
    const applicantName = mainApplicantInfo?.customerName ?? "";
    const profileImage = mainApplicantInfo?.profilePicBase64
        ? `data:jpeg;base64,${mainApplicantInfo?.profilePicBase64}`
        : null;

    return (
        <View
            style={[
                Platform.OS === "ios" ? Style.shadow : {},
                Style.mainApplicantHeader,
                Style.mainApplicanthorizontalMargin,
            ]}
        >
            <View style={Style.jointApplicantRow}>
                {/* Profile Logo */}

                <Image
                    source={profileImage ? { uri: profileImage } : Assets.emptyProfile}
                    style={Style.profileLogo}
                />
                {/* Main Applicant Name */}
                <View>
                    <Typo
                        lineHeight={17}
                        text={applicantName}
                        textAlign="left"
                        style={Style.applicantInfoName}
                    />
                </View>
            </View>
        </View>
    );
}

const Style = StyleSheet.create({

    shadow: {
        ...getShadow({
            elevation: 8,
        }),
    },
    mainApplicantHeader: {
        marginLeft: 40,
        marginTop: 5,
    },

    mainApplicanthorizontalMargin: {
        marginHorizontal: 10,
    },

    profileLogo: {
        backgroundColor: IRISBLUE,
        borderColor: WHITE,
        borderRadius: 150 / 2,
        borderWidth: 2,
        height: 48,
        width: 48,
    },
    applicantInfoName: {
        marginBottom: 5,
        paddingLeft: 20,
    },
    jointApplicantRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 25,
        width: "100%",
    },
});

MainApplicantDetail.propTypes = {
    mainApplicantInfo: PropTypes.object,
};
export default MainApplicantDetail;
