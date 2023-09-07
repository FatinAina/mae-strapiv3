import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native";
import { RNCamera } from "react-native-camera";
import ImagePicker from "react-native-image-crop-picker";
import Permissions from "react-native-permissions";
import QRCodeScanner from "react-native-qrcode-scanner";
import RNQRGenerator from "rn-qr-generator";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ErrorMessage } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { BLACK, MEDIUM_GREY, ROYAL_BLUE, TRANSPARENT, WHITE } from "@constants/colors";
import * as Strings from "@constants/strings";

import { getQRParams } from "@utils/dataModel/utility";
import withFestive from "@utils/withFestive";

const { width, height } = Dimensions.get("window");
class SSLScanner extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.shape({
            addListener: PropTypes.func,
            goBack: PropTypes.func,
            navigate: PropTypes.func,
            pop: PropTypes.func,
            setParams: PropTypes.func,
        }),
        route: PropTypes.object,
        updateModel: PropTypes.func,
        festiveAssets: PropTypes.object,
    };
    static pullRefList = [];

    constructor(props) {
        super(props);
        this.camera = null;
        this.state = this.getInitialState();
        this.hasScanned = false;
        this.checkPermission = this.checkPermission.bind(this);
        this.getQrErrorScreen = this.getQrErrorScreen.bind(this);
    }

    componentDidMount() {
        this.initData();
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            if (this.hasScanned) {
                this.hasScanned = false;
            }
        });
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
        this.checkPermission();
    }

    componentWillUnmount() {
        clearInterval(this.state.loop);

        this.clearLoops();
        this.focusSubscription();
        this.blurSubscription();
    }

    async checkPermission() {
        const permissionResult = await Permissions.request("camera").then((response) => {
            console.log("R", response);
            return response;
        });

        if (
            permissionResult === "denied" ||
            permissionResult === "undetermined" ||
            permissionResult === "restricted"
        ) {
            showErrorToast({ message: "Required camera permission" });
        } else {
            this.setState({ permissionCheck: true });
        }
    }

    initData = () => {
        const { route } = this.props;
        const primary = route.params?.primary ?? false;
        const screen = route.params?.screen ?? 1;
        const resetState = route.params?.resetState ?? false;
        const setup = route.params?.setup ?? false;
        const quickAction = route.params?.quickAction ?? false; //false
        if (resetState) {
            const state = route.params?.qrState ?? {};
            console.log("State > ", state);
            this.setState(state);
        } else {
            this.setState({
                currentScreen: screen,
                primary,
                setup,
                pullRefreshed: false,
                qrActive: true,
                quickAction,
            });
        }
        this.props.navigation.setParams({
            data: {},
            qrState: {},
            resetState: false,
            validateAccount: false,
            refresh: false,
        });
    };

    getInitialState = () => {
        this.pullRefList = [];
        return {
            camera: {
                type: RNCamera.Constants.Type.back,
                flashMode: RNCamera.Constants.FlashMode.auto,
                barcodeFinderVisible: true,
            },
        };
    };

    handleClose = () => {
        this.props.navigation.goBack();
    };

    showLoader = (visible) => {
        this.props.updateModel({
            ui: {
                showLoader: visible,
            },
        });
    };

    onScan = async (e) => {
        try {
            if (!this.state.qrActive) {
                return;
            }
            if (Platform.OS === "ios") {
                if (e === null) {
                    this.setState({ loader: false });
                    this.hasScanned = false;
                    return;
                }
            } else {
                e.data = e?.barcodes?.length > 0 ? e?.barcodes[0]?.data || e?.data : e?.data;
                if (e?.data !== null) {
                    if (e?.data?.length === 0) {
                        this.hasScanned = false;
                        return;
                    }
                    this.setState({
                        qrActive: false,
                    });
                    this.startTime = new Date();
                }
                Vibration?.vibrate();
            }

            const qrParams = getQRParams(e.data);

            if (qrParams?.module === "SSL") {
                this.handleSSLTableOrderLink({ params: qrParams });
            } else {
                showErrorToast({
                    message:
                        "Dine-In feature is not available for this merchant yet. Kindly view our latest merchants list on Maybank's website.",
                });
            }
        } catch (ex) {
            console.log("### [QRPayMainScreen] >> [onScan]: ", ex);
            if (ex?.error?.error?.message) {
                showErrorToast({ message: ex?.error?.error?.message });
            }
            this.showLoader(false);
            this.hasScanned = false;
        } finally {
            this.setState({
                loader: false,
                qrActive: true,
            });
            this.showLoader(false);
        }
    };

    handleSSLTableOrderLink = ({ params }) => {
        const { updateModel, navigation } = this.props;
        if (params?.merchant_id && params?.table_no) {
            updateModel({
                ssl: {
                    redirect: {
                        screen: navigationConstant.SSL_MERCHANT_DETAILS,
                        merchantId: params?.merchant_id,
                        tableNo: params?.table_no,
                    },
                },
            });
        }
        if (params?.chain_id && params?.table_no) {
            updateModel({
                ssl: {
                    redirect: {
                        screen: navigationConstant.SSL_MERCHANT_LISTING_V2,
                        chainId: params?.chain_id,
                        tableNo: params?.table_no,
                    },
                },
            });
        }

        navigation.navigate(navigationConstant.SSL_STACK, {
            screen: navigationConstant.SSL_START,
        });
    };

    /**
     * there's a bug onGoogleMLscan
     * starting on Google Play Services 20.21.17 where it
     * seems to be triggering the callback all the time
     *
     * to limit this, we check for
     * 1) the barcodes entry to exists
     * 2) we also check so that the type are not an unknown format
     * 3) and since its always scanning, we use a static flag to keep track scanned status
     *
     * Does not seems to be resolve yet and not on the library AFAIK.
     *
     * https://github.com/react-native-camera/react-native-camera/issues/2875
     */
    handleOnBarcodesDetected = async (data) => {
        if (Platform.OS === "ios" || !this.state.qrActive) {
            return;
        }
        if (
            data?.barcodes?.length &&
            data?.barcodes[0].type !== "UNKNOWN_FORMAT" &&
            !this.hasScanned
        ) {
            this.hasScanned = true;
            await this.onScan(data, data?.barcodes[0]?.data?.includes("01ATMCC"));
        }
    };

    clearLoops = () => {
        for (const l in this.state.loopList) {
            console.log("Clear > " + l);
            clearInterval(l);
        }
    };

    takePicture = async () => {
        try {
            this.setState({ loader: true }, async () => {
                const image = await ImagePicker.openPicker({
                    cropping: false,
                    includeBase64: true,
                    compressImageQuality: 1,
                    includeExif: true,
                    freeStyleCropEnabled: false,
                    mediaType: "photo",
                    cropperCircleOverlay: false,
                    showCropGuidelines: false,
                    hideBottomControls: false,
                });
                if (image) {
                    const path = image?.path;
                    const base64Data = image?.data ?? "";
                    const response = await RNQRGenerator.detect({
                        uri: path,
                        base64: base64Data,
                        useMLKit: true,
                    });
                    console.log(`### qr scan response ====> `, JSON.stringify(response));
                    if (response?.values.length > 0) {
                        this.onScan({ data: response.values[0], barcodes: null }, false);
                    } else {
                        showErrorToast({
                            message: "Unable to identify the image. Please try again.",
                        });
                    }
                }
            });
        } catch (err) {
            this.setState({ loader: false });
            if (err?.message !== "User cancelled image selection") {
                showErrorToast({ message: err.message });
            }
        } finally {
            this.setState({ loader: false });
        }
    };

    handleOnRead = async (barcode) => {
        if (Platform.OS !== "ios") return;

        if (barcode?.type !== "UNKNOWN_FORMAT" && barcode?.data && !this?.hasScanned) {
            this.hasScanned = true;
            await this.onScan(barcode, barcode?.data?.includes("01ATMCC"));
        }
    };

    renderUI = () => {
        return (
            <View style={{ width, height }}>
                <QRCodeScanner
                    onRead={this.handleOnRead}
                    reactivate={this.state.reactivate}
                    showMarker={true}
                    flashMode={RNCamera.Constants.FlashMode.on}
                    cameraProps={{
                        autoFocus: RNCamera.Constants.AutoFocus.on,
                        barCodeTypes: [RNCamera.Constants.BarCodeType.qr],
                        googleVisionBarcodeType:
                            Platform.OS === "ios"
                                ? null
                                : RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType
                                      .QR_CODE,
                        googleVisionBarcodeMode:
                            Platform.OS === "ios"
                                ? null
                                : RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeMode
                                      .ALTERNATE,
                        flashMode: this.state.flashOn
                            ? RNCamera.Constants.FlashMode.torch
                            : RNCamera.Constants.FlashMode.off,
                        onGoogleVisionBarcodesDetected:
                            Platform.OS !== "ios" && this.handleOnBarcodesDetected,
                    }}
                    vibrate={false}
                    customMarker={
                        <View style={styles.qrCodeScanner}>
                            <HeaderCloseButton
                                style={styles.closeButton}
                                onPress={this.handleClose}
                                isWhite={true}
                            />
                            <View style={styles.pushMainView0}>
                                <View style={styles.pushMainView1}>
                                    <View style={styles.pushMainView2}>
                                        <Image
                                            style={styles.qrBorder}
                                            source={require("@assets/icons/ic_qr_border.png")}
                                            resizeMode="stretch"
                                        />
                                    </View>
                                </View>

                                <View style={styles.pushTopView1}>
                                    <View style={styles.valueContainer}>
                                        <Typo
                                            fontSize={18}
                                            fontWeight="300"
                                            color={WHITE}
                                            lineHeight={18}
                                            text="Place QR code in the scan area"
                                        />
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={async () => {
                                        this.setState({
                                            flashOn: !this.state.flashOn,
                                        });
                                    }}
                                >
                                    <View style={styles.pushImageView}>
                                        <Image
                                            style={styles.torchIcon}
                                            source={
                                                this.state.flashOn
                                                    ? require("@assets/icons/ic_qr_torch_off.png")
                                                    : require("@assets/icons/ic_qr_torch_on.png")
                                            }
                                        />
                                    </View>
                                </TouchableOpacity>
                                <View style={styles.pushTopImageView}>
                                    <View style={styles.pushBottomView}>
                                        <TouchableOpacity onPress={this.takePicture}>
                                            <Typo
                                                fontSize={16}
                                                fontWeight="600"
                                                color={ROYAL_BLUE}
                                                lineHeight={20}
                                                text="Scan QR Code from Gallery"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    }
                    cameraStyle={styles.cameraContainerView}
                    containerStyle={styles.cameraContainerView}
                />
            </View>
        );
    };

    getQrErrorScreen = () => {
        const errMsg =
            this.state.errorMessage !== "" ||
            this.state.errorMessage !== undefined ||
            this.state.errorMessage !== null ||
            this.state.errorMessage.length !== 0
                ? this.state.errorMessage
                : Strings.QR_ISSUE;
        return this.state.qrError === true ? (
            <ErrorMessage
                onClose={() => {
                    this.setState({ qrError: false, reactivate: true });
                }}
                title={Strings.APP_NAME_ALERTS}
                description={errMsg}
                showOk
                onOkPress={() => {
                    this.setState({ qrError: false, reactivate: true });
                }}
            />
        ) : null;
    };

    render() {
        return (
            <ScreenContainer
                backgroundColor={MEDIUM_GREY}
                backgroundType="color"
                showLoaderModal={this.state.loader}
            >
                {this.state.permissionCheck && this.renderUI()}
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    qrCodeScanner: { paddingTop: 50, backgroundColor: BLACK, opacity: 0.8 },
    cameraContainerView: { height: "100%", width: "100%" },
    closeButton: {
        alignSelf: "flex-end",
        marginRight: 24,
        height: 24,
        width: 24,
    },
    torchIcon: {
        height: 40,
        width: 40,
        resizeMode: "contain",
        margin: 30,
    },
    pushImageView: {
        alignItems: "flex-start",
        height: 40,
        justifyContent: "flex-start",
        width: 40,
    },
    pushMainView0: {
        flex: 1,
        height,
        width,
        marginTop: 50,
    },
    pushMainView1: {
        backgroundColor: TRANSPARENT,
        alignItems: "center",
        flex: 2,
        justifyContent: "center",
        marginBottom: 10,
        marginTop: 10,
    },
    pushMainView2: {
        borderRadius: width / 15,
        height: width / 1.4,
        overflow: "hidden",
        width: width / 1.4,
    },
    pushTopImageView: {
        flexDirection: "row",
        marginBottom: 10,
        height: 100,
        justifyContent: "center",
    },
    pushTopView1: {
        alignItems: "center",
        flex: 0.5,
        justifyContent: "center",
    },
    qrBorder: {
        backgroundColor: TRANSPARENT,
        flex: 1,
        height: undefined,
        overflow: "hidden",
        width: undefined,
    },
    valueContainer: { alignItems: "flex-end", flex: 1, marginRight: 10 },
});

export default withModelContext(withFestive(SSLScanner));
