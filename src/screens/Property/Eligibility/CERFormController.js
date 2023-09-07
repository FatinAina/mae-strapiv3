import {
    DT_ELG,
    DT_NOTELG,
    DT_RECOM,
    PROP_ELG_RESULT,
    STATUS_PASS,
    STATUS_SOFT_FAIL,
    STATUS_HARD_FAIL,
} from "@constants/data";
import {
    INC_DOWNPAYNT_SHORTLOAN_PERIOD,
    INFO_NOTE,
    TOBE_ELIGIBLE_INC_DOWNPAYMENT,
} from "@constants/strings";

import { getEncValue } from "../Common/PropertyController";

async function getEligibilityRequestParams(data, state) {
    const navParams = data ?? {};

    const resultDataParams = getResultScreenParams(state, data);
    const encSyncId = await getEncValue(navParams?.syncId);

    return {
        // MDM Data
        customerName: navParams?.customerName,

        // Property Data
        propertyId: navParams?.propertyDetails?.property_id ?? "",
        propertyName: navParams?.propertyName,

        // Input Data
        staffPfNo: navParams?.staffPfNo,
        staffName: navParams?.staffName,
        unitId: navParams?.unitId,
        unitTypeName: navParams?.unitTypeName,
        propertyAddress1: navParams?.propertyAddress1,
        propertyAddress2: navParams?.propertyAddress2,
        propertyAddress3: navParams?.propertyAddress3,
        propertyPostcode: navParams?.propertyPostcode,
        propertyState: navParams?.propertyState,
        propertyPrice: navParams?.propertyPrice,
        downPaymentAmount: navParams?.origDownPaymentAmount
            ? navParams?.origDownPaymentAmount
            : navParams?.downPaymentAmount,
        downPaymentPercent: navParams?.downPaymentPercent,
        loanAmount: state?.loanAmount || navParams?.loanAmount,
        tenure: navParams?.tenure,
        residentStatus: navParams?.residentStatus,
        education: navParams?.education,
        maritalStatus: navParams?.maritalStatus,
        religion: navParams?.religion,
        spouseIncome: navParams?.spouseIncome,
        isFirstTimeBuyHomeIndc: navParams?.isFirstTimeBuyHomeIndc,
        employmentStatus: navParams?.employmentStatus,
        businessType: navParams?.businessType,
        occupation: navParams?.occupation,
        publicSectorNameFinance: navParams?.publicSectorNameFinance,
        title: navParams?.title,
        grossIncome: navParams?.grossIncome,
        houseLoan: navParams?.houseLoan,
        housingLoan: navParams?.housingLoan,
        personalLoan: navParams?.personalLoan,
        ccRepayments: navParams?.ccRepayments,
        carLoan: navParams?.carLoan,
        overdraft: navParams?.overdraft,
        nonBankCommitments: navParams?.nonBankCommitments,
        ccrisLoanCount: navParams?.ccrisLoanCount,
        propertyPurchase: navParams?.propertyPurchase,
        ongoingLoan: navParams?.ongoingLoan,

        // Common
        syncId: encSyncId,
        screenNo: navParams?.screenNo,
        saveData: "Y",
        isPropertyListed: navParams?.isPropertyListed,
        progressStatus: PROP_ELG_RESULT,

        // Result Data
        ...resultDataParams,
    };
}
function getResultScreenParams(state, data) {
    const navParams = data ?? {};

    return {
        dataType: state.dataType,
        interestRate: state.interestRate,
        spreadRate: state.spreadRate,
        baseRate: state.baseRate,
        monthlyInstalment: state.monthlyInstalment,
        recommendedTenure: state.tenure,
        recommendedDownpayment: state.downpayment,
        salesRepRequest: state.isAssistanceRequested ? "Y" : "N",
        stpApplicationId: navParams?.stpApplicationId,
        eligibilityStatus: navParams?.eligibilityStatus,
        minTenure: state.tenureMin,
        maxTenure: state.tenureMax,
    };
}

function getTenure(navParams, eligibilityResult, tempStatus) {
    console.log("[CEResult] >> [getTenure]");

    // 12/08/2021: Commented old code to accomodate new changes from WOLOC response
    // const age = navParams?.age ?? 0;
    // const maxTenure = Math.min(70 - age, 35);
    // const inputTenure = navParams?.tenure;
    // const recommendedTenure =
    //     eligibilityResult?.tenure > maxTenure ? maxTenure : eligibilityResult?.tenure;
    // const resultTenure = tempStatus === STATUS_SOFT_FAIL ? recommendedTenure : inputTenure;
    // const tenureEditable = tempStatus === STATUS_SOFT_FAIL && resultTenure < maxTenure;
    try {
        const Five = 5;
        const ThirtyFive = 35;
        const minTenure =
            eligibilityResult?.minTenure && eligibilityResult?.minTenure < Five
                ? Five
                : eligibilityResult?.minTenure;
        const maxTenure =
            eligibilityResult?.maxTenure && eligibilityResult?.maxTenure > ThirtyFive
                ? ThirtyFive
                : eligibilityResult?.maxTenure;
        const inputTenure = navParams?.tenure;
        const recommendedTenure = eligibilityResult?.tenure;
        const resultTenure =
            tempStatus === STATUS_SOFT_FAIL || tempStatus === STATUS_PASS
                ? recommendedTenure
                : inputTenure;
        const tenureEditable = tempStatus === STATUS_SOFT_FAIL || tempStatus === STATUS_PASS;

        return {
            resultTenure,
            tenureEditable:
                recommendedTenure === maxTenure && maxTenure === minTenure ? false : tenureEditable,
            maxTenure,
            minTenure: minTenure === maxTenure ? Five : minTenure,
        };
    } catch (err) {
        console.log("[CEResult][getTenure] >> Exception: ", err);

        // Note: This is only for an exception case. Refer to logic in try block for Tenure calculation.
        return {
            resultTenure:
                tempStatus === STATUS_SOFT_FAIL ? eligibilityResult?.maxTenure : navParams?.tenure,
            tenureEditable: tempStatus === STATUS_SOFT_FAIL,
            maxTenure: eligibilityResult?.maxTenure,
            minTenure: eligibilityResult?.minTenure,
        };
    }
}

function getDownpayment(tempStatus, navParams, eligibilityResult, tenureEditable, maxDownPayment) {
    console.log("[CEResult] >> [getDownpayment]");
    try {
        const inputDowmpayment = parseFloat(navParams?.downPaymentAmount);
        const recommendedDownpayment =
            eligibilityResult?.recommendedDownPayment &&
            parseFloat(eligibilityResult.recommendedDownPayment) < parseFloat(maxDownPayment)
                ? eligibilityResult.recommendedDownPayment
                : maxDownPayment;
        const downpaymentEditable =
            tempStatus === STATUS_SOFT_FAIL &&
            parseFloat(recommendedDownpayment) < parseFloat(maxDownPayment);
        const resultDownpayment =
            tempStatus === STATUS_SOFT_FAIL ? recommendedDownpayment : inputDowmpayment;
        const downpaymentInfoNote1 = INC_DOWNPAYNT_SHORTLOAN_PERIOD;
        const downpaymentInfoNote2 = TOBE_ELIGIBLE_INC_DOWNPAYMENT;
        const downpaymentInfoNote3 = INFO_NOTE;
        let downpaymentInfoNote =
            tenureEditable && downpaymentEditable ? downpaymentInfoNote1 : downpaymentInfoNote2;

        downpaymentInfoNote = tempStatus === STATUS_PASS ? null : downpaymentInfoNote;
        downpaymentInfoNote =
            navParams?.eligibilityResult?.dataType === DT_NOTELG && navParams?.isJointApplicantAdded
                ? downpaymentInfoNote3
                : downpaymentInfoNote;
        return {
            downpaymentEditable,
            recommendedDownpayment,
            resultDownpayment,
            downpaymentInfoNote,
        };
    } catch (err) {
        console.log("[CEResult][getDownpayment] >> Exception: ", err);

        // Note: This is only for an exception case. Refer to logic in try block for Downpayment calculation.
        return {
            downpaymentEditable: false,
            recommendedDownpayment: eligibilityResult?.recommendedDownPayment,
            resultDownpayment: navParams?.downPaymentAmount,
            downpaymentInfoNote: null,
        };
    }
}

function getPropertyPrice(navParams) {
    console.log("[CEResult] >> [getPropertyPrice]");

    const propertyPrice = navParams?.propertyPrice;
    const halfPropertyPrice = !isNaN(parseFloat(propertyPrice))
        ? (propertyPrice / 2).toFixed(2)
        : "";

    return { propertyPrice, maxDownPayment: halfPropertyPrice };
}

function getResultStatus(dataType) {
    console.log("[CEResult] >> [getResultStatus]");

    switch (dataType) {
        case DT_ELG:
            return STATUS_PASS;
        case DT_RECOM:
            return STATUS_SOFT_FAIL;
        case DT_NOTELG:
            return STATUS_HARD_FAIL;
        default:
            return null;
    }
}

function getFormData(data) {
    console.log("[CEResult] >> [getFormData]");
    const navParams = data ?? {};

    return {
        grossIncome: navParams?.grossIncome ?? "",
        houseLoan: navParams?.houseLoan ?? "",
        housingLoan: navParams?.housingLoan ?? "",
        personalLoan: navParams?.personalLoan ?? "",
        ccRepayments: navParams?.ccRepayments ?? "",
        carLoan: navParams?.carLoan ?? "",
        overdraft: navParams?.overdraft ?? "",
        nonBankCommitments: navParams?.nonBankCommitments ?? "",
        staffPfNo: navParams?.staffPfNo,
        staffName: navParams?.staffName,
    };
}

function getInterestRate(eligibilityResult) {
    console.log("[CEResult] >> [getInterestRate]");

    const interestRate = eligibilityResult?.interestRate
        ? parseFloat(eligibilityResult.interestRate).toFixed(2)
        : "";
    const spreadRate = eligibilityResult?.spreadRate
        ? parseFloat(eligibilityResult.spreadRate).toFixed(2)
        : "";
    const baseRate = eligibilityResult?.baseRate
        ? parseFloat(eligibilityResult.baseRate).toFixed(2)
        : "";

    return { interestRate, spreadRate, baseRate };
}

export {
    getEligibilityRequestParams,
    getResultScreenParams,
    getTenure,
    getDownpayment,
    getPropertyPrice,
    getResultStatus,
    getFormData,
    getInterestRate,
};
