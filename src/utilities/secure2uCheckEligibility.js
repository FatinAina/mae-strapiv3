export const secure2uCheckEligibility = (amount, secure2uValidateData) => {
    const thresholdAmt = amount && typeof secure2uValidateData?.s2uFavTxnLimit === "string" 
        ? parseFloat(secure2uValidateData?.s2uFavTxnLimit) 
        : secure2uValidateData?.s2uFavTxnLimit || 0.0;
    return (
        secure2uValidateData?.s2uFavTxnFlag === "Y" &&
        parseFloat(amount) >= thresholdAmt
    );
};

export const getTwoFAFlow = (amount, secure2uValidateData) => {
    const thresholdAmt = parseFloat(secure2uValidateData?.s2uFavTxnLimit) || 0.0;
    const lesserThenThreshold = parseFloat(amount) < thresholdAmt;
    if (secure2uCheckEligibility(amount, secure2uValidateData)) return "S2U";
    if (lesserThenThreshold) return "";
    return "TAC";
};
