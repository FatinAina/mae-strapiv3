import React from "react";
import Typo from "@components/Text";
import PropTypes from "prop-types";
import { Platform, StyleSheet, View, Image } from "react-native";
import { getShadow } from "@utils/dataModel/utility";
import {
    WHITE,
    IRISBLUE,
    BLACK,
} from "@constants/colors";
import Assets from "@assets";
import { REMIND_JOINT_APPLICANT, REMOVE_JOINT_TITLE } from "@constants/strings";
import { ELGCFAIL, ELIGCOMP, INPROGRESS } from "@constants/data";

function JointApplicantDetail({
    jointApplicantInfo,
    removeOpenJointApplicant,
    remindOpenJointApplicant,
    isAccepted,
    status,
    isCancelled,
    jaStatus,
}) {
    const applicantName = jointApplicantInfo?.customerName ?? "";
    const profileImage = jointApplicantInfo?.profilePicBase64
        ? `data:jpeg;base64,${jointApplicantInfo?.profilePicBase64}`
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
                    {(status === ELIGCOMP ||
                        status === INPROGRESS ||
                        status === ELGCFAIL ||
                        jaStatus === INPROGRESS ||
                        jaStatus === ELIGCOMP) &&
                        isAccepted &&
                        !isCancelled && (
                            <Typo
                                lineHeight={18}
                                fontWeight="600"
                                text={REMOVE_JOINT_TITLE}
                                style={Style.jointApplicantStyle}
                                onPressText={removeOpenJointApplicant}
                            />
                        )}

                    {!isAccepted && !isCancelled && (
                        <Typo
                            lineHeight={18}
                            fontWeight="600"
                            text={REMIND_JOINT_APPLICANT}
                            style={Style.jointApplicantStyle}
                            onPressText={remindOpenJointApplicant}
                        />
                    )}
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
    jointApplicantStyle: {
        fontSize: 14,
        marginBottom: 5,
        marginLeft: 20,
        textDecorationColor: BLACK,
        textDecorationLine: "underline",
        textDecorationStyle: "solid",
    },
});

JointApplicantDetail.propTypes = {
    jointApplicantInfo: PropTypes.object,
    removeOpenJointApplicant: PropTypes.func,
    remindOpenJointApplicant: PropTypes.func,
    isAccepted: PropTypes.bool,
    status: PropTypes.string,
    jaStatus: PropTypes.string,
    isCancelled: PropTypes.bool,
};
export default JointApplicantDetail;
