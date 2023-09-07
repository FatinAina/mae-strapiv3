import {
    ARMY_POLICE_ID2,
    BUSINESS_REGISTRATION_NUMBER,
    CANCEL_REQUEST,
    ENTER_BUSINESS_REG_NO,
    ENTER_PASSPORT_NUMBER,
    FORWARD_REQUEST,
    MARK_AS_PAID,
    REJECT_REQUEST,
    PASSPORTID_LBL,
    ARMY_POLICE_ID,
    ENTER_ARMY_POLICE_ID,
    NRIC_NUMBER,
    MOBNUM_LBL,
} from "@constants/strings";

export const idMapProxy = [
    {
        code: "01",
        name: "NWIC",
    },
    {
        code: "02",
        name: "AMIC" || "PLIC",
    },
    {
        code: "03",
        name: "PASS",
    },
    {
        code: "04",
        name: "BRNO",
    },
];

export const VALID_ACC_NUMBER = "Please input valid account number.";
export const serviceCodeList = ["801", "802", "821", "803", "804", "822"];

export const menuArray = [
    {
        menuLabel: CANCEL_REQUEST,
        menuParam: "CANCEL_REQUEST",
    },
    {
        menuLabel: MARK_AS_PAID,
        menuParam: "MARK_AS_PAID",
    },
];

export const menuArrayReceiver = [
    {
        menuLabel: REJECT_REQUEST,
        menuParam: "REJECT_REQUEST",
    },
    {
        menuLabel: FORWARD_REQUEST,
        menuParam: "FORWARD_REQUEST",
    },
    {
        menuLabel: "Block Requestor",
        menuParam: "BLOCK_REQUEST",
    },
];

export const menuArrayReceiverSoleProp = [
    {
        menuLabel: REJECT_REQUEST,
        menuParam: "REJECT_REQUEST",
    },
    {
        menuLabel: "Block Requestor",
        menuParam: "BLOCK_REQUEST",
    },
];
export const menuArrayAutoDebit = [
    {
        menuLabel: REJECT_REQUEST,
        menuParam: "REJECT_REQUEST",
    },
    {
        menuLabel: "Block Request",
        menuParam: "BLOCK_REQUEST",
    },
];
export const menuArrayReceiverSolePropAD = [
    {
        menuLabel: REJECT_REQUEST,
        menuParam: "REJECT_REQUEST",
    },
];

export const getAllAccountSubUrl = "/summary?type=A";
export const duitNowPasspostCodeSubUrl = "/duitnow/passportcodes";
export const fundTransferInquirySubUrl = "/fundTransfer/inquiry";

export const modelType = {
    user: "user",
    misc: "misc",
};

export const paymentMethodsList = [
    { key: "01", title: "Saving & current account", isSelected: true },
    { key: "02", title: "Credit card", isSelected: true },
    { key: "03", title: "E-Wallet", isSelected: true },
];

export const termsAndConditionUrl = {
    sendDuitnowRequest:
        "https://www.maybank2u.com.my/iwov-resources/pdf/personal/digital_banking/duitnow-request_tnc.pdf",
    sendDuitNowAutoDebit:
        "https://www.maybank2u.com.my/iwov-resources/pdf/personal/digital_banking/duitnow-autodebit_tnc.pdf",
    onlineBanking:
        "https://www.maybank2u.com.my/iwov-resources/pdf/personal/digital_banking/duitnow-ob-wallet-tnc.pdf",
};

export const duitnowProxyList = [
    {
        no: 0,
        selected: true,
        code: "CASA",
        name: "Account Number",
        const: "CASA",
        isSelected: false,
        index: 0,
        maxLength: 99,
        minLength: 5,
        isDisableSubmitBtnOnMin: true,
        minErrorMessage: "",
        maxErrorMessage: "",
        idLabel: "Account number",
        idPlaceHolder: "Enter account number",
    },
    {
        no: 1,
        selected: true,
        code: "MBNO",
        name: MOBNUM_LBL,
        const: "MBNO",
        isSelected: false,
        index: 1,
        minLength: 8,
        maxLength: 20,
        isDisableSubmitBtnOnMin: true,
        minErrorMessage: "Please input a valid mobile number.",
        maxErrorMessage: "Mobile number cannot be greater than 20.",
        idLabel: "",
        idPlaceHolder: "",
    },
    {
        no: 2,
        selected: false,
        code: "NRIC",
        name: NRIC_NUMBER,
        const: "NRIC",
        isSelected: false,
        index: 2,
        minLength: 8,
        maxLength: 12,
        isDisableSubmitBtnOnMin: true,
        minErrorMessage: "Please input a valid NRIC Number.",
        maxErrorMessage: "NRIC number cannot be greater than 12.",
        idLabel: "",
        idPlaceHolder: "",
    },
    {
        no: 3,
        selected: false,
        code: "PSPT",
        name: PASSPORTID_LBL,
        const: "PSPT",
        isSelected: false,
        index: 3,
        minLength: 6,
        maxLength: 20,
        isDisableSubmitBtnOnMin: true,
        minErrorMessage: "Please input a valid Passport Number.",
        maxErrorMessage: "Passport number cannot be greater than 20.",
        idLabel: PASSPORTID_LBL,
        idPlaceHolder: ENTER_PASSPORT_NUMBER,
    },
    {
        no: 4,
        selected: false,
        code: "ARMN",
        name: ARMY_POLICE_ID2,
        const: "ARMN",
        isSelected: false,
        index: 4,
        minLength: 5,
        maxLength: 20,
        isDisableSubmitBtnOnMin: true,
        minErrorMessage: "Please input a valid Army/Police Number.",
        maxErrorMessage: "Army/Police number cannot be greater than 20.",
        idLabel: ARMY_POLICE_ID,
        idPlaceHolder: ENTER_ARMY_POLICE_ID,
    },
    {
        no: 5,
        selected: false,
        code: "BREG",
        name: BUSINESS_REGISTRATION_NUMBER,
        const: "BREG",
        isSelected: false,
        index: 5,
        minLength: 8,
        maxLength: 20,
        isDisableSubmitBtnOnMin: true,
        minErrorMessage: "Please input a valid Business Registration Number.",
        maxErrorMessage: "Business Registration number cannot be greater than 20.",
        idLabel: BUSINESS_REGISTRATION_NUMBER,
        idPlaceHolder: ENTER_BUSINESS_REG_NO,
    },
];
