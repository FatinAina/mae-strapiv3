import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import LinearGradient from "react-native-linear-gradient";
import { useDispatch, useSelector } from "react-redux";

import { RECEIVED_DOCUMENT_SCREEN, APPLY_LOANS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { getdocumentUploadURL, asbDocumentUpload } from "@services";
import { logEvent } from "@services/analytics";

import { doneWithDataPush } from "@redux/reducers/ASBFinance/SingleApplicantbookingform";

import {
    MEDIUM_GREY,
    GHOST_WHITE,
    YELLOW,
    BLUE,
    APPROX_SUVA_GREY,
    TRANSPARENT,
    DISABLED,
} from "@constants/colors";
import {
    FA_ACTION_NAME,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_SCREEN,
    UNSAVED_CHANGES,
    UNSAVED_CHANGES_DEC,
    LEAVE,
    CANCEL,
    GUARANTOR,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    LEAVE_DES,
    ASB_COPY_OF_NRIC_BACK,
    ASB_COPY_OF_NRIC_FRONT_AND_BACK,
    ASB_FINANCING,
    ASB_PREPARE_YOUR_LATEST_THREE_MONTH_SALARY,
    PLSTP_UD_DESC,
    PLSTP_UD_HEADER,
    PLSTP_UD_LATER,
    SNAP_A_PIC,
    SUBMIT_DOC,
} from "@constants/strings";

import Assets from "@assets";

import { goBackHomeScreen } from "../helpers/ASBHelpers";

const JointApplicantScreen = ({ navigation, route }) => {
    const isGuarantor = route?.params?.isGuarantor;
    const guarantorStpReferenceNumber = route?.params?.guarantorStpReferenceNumber;

    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const prePostQualReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    const resumeReducer = useSelector((state) => state.resumeReducer);
    const stpReferenceNumber = isGuarantor
        ? guarantorStpReferenceNumber
        : prePostQualReducer?.data?.stpreferenceNo ?? resumeReducer?.stpDetails?.stpReferenceNo;
    const asbApplicationDetailsReducer = useSelector(
        (state) => state.asbServicesReducer.asbApplicationDetailsReducer
    );
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    logEvent(FA_VIEW_SCREEN, {
        [FA_SCREEN_NAME]: "Apply_ASBFinancing_UploadDocuments",
    });

    const hardCoded = {
        salesforceOthers: {
            objectStore: "WOLOCOS",
            documentClass: "WOLOC",
            mdip: {
                scc: "salesforceOthers",
                fpt: "fpt",
                aud: "MDIP",
                exp: 1209600,
                source: "uploader",
            },
            upload: {
                header: "",
                preface: "",
                title: "Add any relevant documents",
                info: "",
                label: "Please ensure your documents' file size is less than 10MB.",
                expiryTitle: "This page has expired due to inactivity. Please try again.",
                expiryMessage:
                    "Please login to the salesforce app to upload the required documents.",
                submitButtonTemplate:
                    '<button class="btn" style="background-color: #FFDE00; color: black; box-shadow: none; border-radius: 48px; font-weight: bold;">Submit</button>',
                successLabel:
                    '<div><h4>In Progress</h4></div><div class="text-secondary">Please wait while your documents are being uploaded. Click on the button after a few seconds.</div>',
                successButtonTemplate:
                    '<div><a class="btn App-upload-success-link mt-4" style="background-color: #FFDE00; color: black; box-shadow: none; border-radius: 48px; font-weight: bold" href="<%-misc.closeLink%>">Check Document Status</a></div>',
                uploadButtonTemplate:
                    '<button class="btn" style="background-color: #FFDE00; color: black; font-size: 12px; border-radius: 48px; font-weight: bold;">Add Document</button>',
                uploadErrorMessage:
                    "We're currently facing a connection time out. Please try again later.",
                maxFileSizeBytes: 10485760,
                mimeTypes: ["image/png", "image/jpeg", "application/pdf"],

                files: {
                    bookingforms: {
                        title: ASB_PREPARE_YOUR_LATEST_THREE_MONTH_SALARY,
                        label: "",
                        min: 0,
                        max: 10,
                        properties: {
                            DocumentType: "Misc",
                        },
                    },
                    nric: {
                        title: ASB_COPY_OF_NRIC_FRONT_AND_BACK,
                        label: "",
                        min: 2,
                        max: 2,
                        capture: "environment",
                        properties: {
                            DocumentType: "Identification",
                        },
                    },
                    nricJoint: {
                        title: ASB_COPY_OF_NRIC_BACK,
                        label: "",
                        min: 2,
                        max: 2,
                        capture: "environment",
                        properties: {
                            DocumentType: "Identification",
                        },
                    },
                },
                sharedProperties: {},
            },
        },
    };

    const { salesforceOthers } = hardCoded;
    const { bookingforms, nric } = salesforceOthers.upload.files;

    const filesContent = [{ ...nric }, { ...bookingforms }];

    const { Data: Singleapplicantbooking } = useSelector(
        (state) => state.SingleApplicantbookingform
    );

    const Jointapplicant = {
        images: [
            {
                id: 1,
            },
            {
                id: 2,
            },
        ],
        statusSuccessfull: false,
    };

    const NricjointApplicant = {
        images: [
            {
                id: 1,
            },
            {
                id: 2,
            },
        ],
        statusSuccessfull: false,
    };

    const JointApplicantbookingform = Singleapplicantbooking;

    const handleSingleBooking = (title, max, min) => {
        if (title === ASB_PREPARE_YOUR_LATEST_THREE_MONTH_SALARY) {
            navigation.navigate("OtherApplicantSingle", {
                Max: `${max}`,
                Min: `${min}`,
                Keytype: "bookingforms",
            });
        } else if (title === ASB_COPY_OF_NRIC_FRONT_AND_BACK) {
            navigation.navigate("ApplicantSingle", {
                Max: `${max}`,
                Min: `${min}`,
                Keytype: "nric",
            });
        } else if (title === ASB_COPY_OF_NRIC_BACK) {
            navigation.navigate("KYCApplicant", {
                Max: `${max}`,
                Min: `${min}`,
                Keytype: "nricJoint",
            });
        }
    };

    async function submit() {
        try {
            console.log(
                "FINAL CHECK==>",
                asbApplicationDetailsReducer?.data?.stpRoleType ? "G" : "A"
            );

            const images = [...Singleapplicantbooking.images];

            const nricImages = [...Singleapplicantbooking.nricFrontImages];

            setLoading(true);

            const body = {
                data: {
                    stpId: stpReferenceNumber,
                    stpRoleType: asbApplicationDetailsReducer?.data?.stpRoleType ? "G" : "A",
                },
            };
            const response = await getdocumentUploadURL(body);
            const race = response?.data;

            const formdata = new FormData();
            if (images.length > 0) {
                images.forEach((item) => {
                    formdata.append("income", {
                        name: item.Filename,
                        uri: item.path,
                        type: item.mime,
                    });
                });

                nricImages.forEach((item) => {
                    formdata.append("nric", {
                        uri: item.path,
                        type: item.mime,
                        name: item.Filename,
                    });
                });

                const url = race.uploadUrl;
                const result = await asbDocumentUpload(formdata, url);
                if (result) {
                    const isSuccess = result.data;
                    if (isSuccess) {
                        navigation.navigate(RECEIVED_DOCUMENT_SCREEN, {
                            isGuarantor,
                        });
                    }
                }
            }
        } catch (error) {
            console.log("error, ", error);
        } finally {
            setLoading(false);
        }
    }

    const handleCount = (title, count) => {
        if (title === ASB_PREPARE_YOUR_LATEST_THREE_MONTH_SALARY) {
            return `${JointApplicantbookingform.images.length} out of ${count} documents uploaded`;
        } else if (title === ASB_COPY_OF_NRIC_FRONT_AND_BACK) {
            return `${JointApplicantbookingform?.nricFrontImages?.length} out of ${count} documents uploaded`;
        } else if (title === ASB_COPY_OF_NRIC_BACK) {
            return `${JointApplicantbookingform?.nricBackImages?.length} out of ${count} documents uploaded`;
        }
    };

    const executeFunction = () => {
        if (Jointapplicant.images.length === 2 && NricjointApplicant.images.length === 2) {
            return (
                <View style={styles.bottomBtnContCls}>
                    <LinearGradient colors={[GHOST_WHITE, MEDIUM_GREY]} />
                    <ActionButton
                        fullWidth
                        onPress={submit}
                        backgroundColor={
                            JointApplicantbookingform.nricFrontImages.length === 2 &&
                            JointApplicantbookingform.images.length !== 0
                                ? YELLOW
                                : DISABLED
                        }
                        isLoading={loading}
                        componentCenter={
                            <Typo fontWeight="600" lineHeight={18} text={SUBMIT_DOC} />
                        }
                        disabled={
                            JointApplicantbookingform.nricFrontImages.length !== 2 ||
                            JointApplicantbookingform.images.length === 0
                        }
                    />
                    <ActionButton
                        style={styles.laterBtn}
                        fullWidth
                        onPress={onCloseTap}
                        backgroundColor={TRANSPARENT}
                        isLoading={loading}
                        componentCenter={
                            <Typo
                                fontWeight="600"
                                lineHeight={18}
                                color={BLUE}
                                text={PLSTP_UD_LATER}
                            />
                        }
                    />
                </View>
            );
        } else {
            return (
                <View style={styles.bottomBtnContCls}>
                    <LinearGradient colors={[GHOST_WHITE, MEDIUM_GREY]} />
                    <ActionButton
                        fullWidth
                        backgroundColor={YELLOW}
                        componentCenter={
                            <Typo fontWeight="600" lineHeight={18} text="Submit Documents" />
                        }
                    />
                </View>
            );
        }
    };
    const handleLeaveBtn = async () => {
        setShowPopupConfirm(false);
        dispatch(doneWithDataPush());
        if (isGuarantor) {
            goBackHomeScreen(navigation);
        } else {
            navigation.navigate(APPLY_LOANS);
        }
    };
    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }
    function onCloseTap() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Apply_ASBFinancing_UploadDocuments",
            [FA_ACTION_NAME]: "Upload Later",
        });
        setShowPopupConfirm(true);
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                useSafeArea
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typo
                                text={PLSTP_UD_HEADER}
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={19}
                            />
                        }
                        headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                    />
                }
                neverForceInset={["bottom"]}
                paddingLeft={0}
                paddingRight={0}
            >
                <ScrollView>
                    <View style={styles.mainSection}>
                        <Typo
                            text={isGuarantor ? GUARANTOR : ASB_FINANCING}
                            lineHeight={20}
                            textAlign="left"
                        />
                        <Typo
                            text={PLSTP_UD_DESC}
                            fontWeight="600"
                            fontSize={16}
                            lineHeight={20}
                            textAlign="left"
                            style={styles.uploadTitle}
                        />
                        <Typo
                            text={`Reference ID: ${stpReferenceNumber}`}
                            lineHeight={18}
                            textAlign="left"
                            color={APPROX_SUVA_GREY}
                        />
                        <Typo
                            text={SNAP_A_PIC}
                            fontWeight="600"
                            lineHeight={17}
                            textAlign="left"
                            style={styles.snapText}
                        />
                        {filesContent.map((data, key) => (
                            <TouchableOpacity
                                key={key}
                                onPress={() => handleSingleBooking(data.title, data.max, data.min)}
                            >
                                <View style={styles.uploadRow}>
                                    <View style={styles.uCol1}>
                                        <Image source={Assets.NRIC} />
                                    </View>
                                    <View style={styles.uCol2}>
                                        <Typo
                                            text={data.title}
                                            lineHeight={17}
                                            textAlign="left"
                                            style={styles.uCol2Title}
                                        />
                                        <Typo
                                            text={handleCount(data.title, data.max)}
                                            fontSize={12}
                                            lineHeight={15}
                                            textAlign="left"
                                        />
                                    </View>
                                    <View>
                                        <Image source={Assets.Right} />
                                    </View>
                                </View>
                                <View style={styles.uCol3}>
                                    <Image source={Assets.RectangleManagerseparator} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
                <View style={styles.container}>{executeFunction()}</View>
                <Popup
                    visible={showPopupConfirm}
                    onClose={onPopupCloseConfirm}
                    title={isGuarantor ? UNSAVED_CHANGES : ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE}
                    description={isGuarantor ? UNSAVED_CHANGES_DEC : LEAVE_DES}
                    primaryAction={{
                        text: `${LEAVE}`,
                        onPress: handleLeaveBtn,
                    }}
                    secondaryAction={{
                        text: `${CANCEL}`,
                        onPress: onPopupCloseConfirm,
                    }}
                />
            </ScreenLayout>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 25,
        paddingVertical: 25,
    },
    laterBtn: {
        marginTop: 10,
    },
    mainSection: {
        paddingHorizontal: 25,
        paddingTop: 20,
        width: "100%",
    },
    snapText: {
        paddingTop: 35,
    },
    uCol1: {
        padding: 1,
    },
    uCol2: {
        alignContent: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    uCol2Title: {
        paddingBottom: 5,
    },
    uCol3: {
        padding: 0,
    },
    uploadRow: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginTop: 25,
        paddingVertical: 25,
    },
    uploadTitle: {
        paddingBottom: 15,
        paddingTop: 10,
    },
});

JointApplicantScreen.propTypes = {
    route: PropTypes.any,
    navigation: PropTypes.any,
};

export default JointApplicantScreen;
