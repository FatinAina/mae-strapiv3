import { StyleSheet } from "react-native";
import { Platform } from "react-native";

export default StyleSheet.create({
    container: { width: "100%", flex: 1, alignItems: "center", backgroundColor: "#f8f5f3" },
    containerBlue: { width: "100%", flex: 1, alignItems: "center", backgroundColor: "#efeff3" },
    subContainer: { width: "100%", flex: 1, alignItems: "flex-start", backgroundColor: "#f8f5f3" },
    leftContainer: { flex: 1, width: "100%", alignItems: "flex-start", height: "100%" },
    centerContainer: { flex: 1, width: "100%", alignItems: "center", height: "100%" },
    topTextContainer: { marginTop: 1, marginLeft: 50, marginRight: 50 },
    topTextContainer1: { marginTop: 20, marginLeft: 50, marginRight: 50 },
    containerBlue1: { width: "100%", flex: 1, alignItems: "center"  },
    topText: {
        color: "#7c7c7d",
        marginRight: 10,
        fontWeight: "100",
        textAlign: "center",
        fontSize: 13,
    },
    topHeaderText: { color: "#000000", marginRight: 10, fontWeight: "700" },
    titleTextContainer: {
        marginTop: 2,
        width: "80%",
        alignItems: "flex-start",
        alignContent: "flex-start",
        flexDirection: "row",
        marginLeft: 25,
    },
    titleText: { color: "#000000", marginRight: 10, fontWeight: "900", fontSize: 18 },
    subTitleTextContainer: {
        marginTop: 2,
        width: "60%",
        alignItems: "flex-start",
        alignContent: "flex-start",
        flexDirection: "row",
        marginLeft: 25,
    },
    subTitleTextContainer1: {
        marginTop: 2,
        width: "80%",
        alignItems: "flex-start",
        alignContent: "flex-start",
        flexDirection: "row",
        marginLeft: 25,
    },
    subTitleText: { color: "#000000", marginRight: 10, fontWeight: "100", fontSize: 20 },
    smallTitleTextContainer: {
        marginTop: 5,
        width: "80%",
        alignItems: "flex-start",
        alignContent: "flex-start",
        flexDirection: "row",
        marginLeft: 25,
    },
    smallTitleText: { color: "#8f8f8f", marginRight: 10, fontWeight: "100", fontSize: 12 },
    tabTextContainer: { marginTop: 20, alignItems: "center", flexDirection: "row" },
    selectTextContainer: { marginTop: 5, alignItems: "center", flexDirection: "row" },
    tabSelect: { color: "#000000", margin: 10, marginBottom: 5, fontWeight: "900", fontSize: 14 },
    tabUnselect: { color: "#8f8f8f", margin: 10, marginBottom: 5, fontWeight: "900", fontSize: 12 },
    selectText: { color: "#8f8f8f", margin: 5, fontWeight: "100", fontSize: 12 },
    hisContainer: { flex: 1, width: "100%", alignItems: "flex-start", height: "100%" },
    scrollContainer: {
        width: "92%",
        flex: 1,
        alignItems: "center",
        backgroundColor: "#ffffff",
        marginTop: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    scrollContainer1: {
        width: "100%",
        height: "100%",
        flex: 1,
        alignItems: "center",
        marginTop: 0,
    },
    scrollContainerView: {
        width: "100%",
        height: "100%",
        flex: 1,
        marginTop: 0,
        paddingEnd: 24,
        paddingStart: 24,
    },
    scrollContainerBlue: {
        width: "100%",
        flex: 1,
        alignItems: "center",
        backgroundColor: "#f8f5f3",
        marginTop: 0,
    },
    scrollHistoryContainer: {
        width: "100%",
        flex: 1,
        alignItems: "center",
        backgroundColor: "#f8f5f3",
        marginTop: 10,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    chartTextContainer: {
        position: "absolute",
        width: 160,
        height: 160,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
    },
    hisSelect: { color: "#000000", margin: 10, marginBottom: 5, fontWeight: "900", fontSize: 13 },
    hisUnselect: { color: "#8f8f8f", margin: 10, marginBottom: 5, fontWeight: "900", fontSize: 13 },
    catSelect: { color: "#000000", margin: 2, marginBottom: 2, fontWeight: "500", fontSize: 12 },
    catUnselect: { color: "#8f8f8f", margin: 2, marginBottom: 2, fontWeight: "500", fontSize: 12 },
    scrollWidth: { width: "100%", flex: 1 },
    scrollWidthTrn: { width: "100%", flex: 1, marginTop: 10, alignContent: "center" },
    calContainer: {
        marginTop: 2,
        width: "90%",
        alignItems: "flex-start",
        alignContent: "flex-start",
        flexDirection: "row",
        marginLeft: 20,
    },
    hisCenterContainer: { flex: 1, width: "100%", alignItems: "center", height: "100%" },
    hisTextContainer: { marginTop: 2, alignItems: "center", flexDirection: "row" },
    nextBlock: {
        marginTop: 10,
        height: 45,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "flex-end",
    },
    nextContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        backgroundColor: "transparent",
    },
    next: {
        height: 70,
        width: 70,
    },
    floatContainer: {
        width: 60,
        height: 60,
        borderRadius: 10,
        position: "absolute",
        bottom: 10,
        right: 10,
    },
    qrTitleContainer: {
        marginLeft: 50,
        marginTop: 10,
        justifyContent: "flex-start",
        flexDirection: "row",
    },
    addedTitleContainer: {
        marginLeft: 50,
        marginTop: 30,
        justifyContent: "flex-start",
    },
    addedDescriptionContainer: {
        marginLeft: 50,
        justifyContent: "flex-start",
        width: 300,
        marginTop: 10,
    },
    addedContainer: {},
    addedBlock: {},
    addedTitle: { color: "#000000", fontWeight: "700", fontSize: 20 },
    addedDescription: { color: "#000000", fontWeight: "100", fontSize: 22 },
    mobileNumberVerify: {
        color: "#000000",
        fontWeight: "100",
        fontSize: 23,
        lineHeight: 33,
        letterSpacing: 0.4,
    },
    longDescription: { color: "#000000", fontWeight: "100", fontSize: 16 },
    addedSetupContainer: {},
    addedSetupTop: { marginTop: 20, marginLeft: 40, justifyContent: "flex-start" },
    addedSetupTop1: { marginTop: 50, marginLeft: 40, justifyContent: "flex-start" },
    addedSetupDown: { marginLeft: 40, justifyContent: "flex-start" },
    qrSetupDown: { marginLeft: 40, justifyContent: "flex-start", marginTop: "5%" },
    blurContainer: {
        flex: 1,
        alignItems: "center",
        position: "absolute",
        justifyContent: "center",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.88)",
    },
});
