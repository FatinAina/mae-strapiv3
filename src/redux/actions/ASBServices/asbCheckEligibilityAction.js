export const ASB_CHECK_ELIGIBILITY_LOADING = () => ({});

export const ASB_CHECK_ELIGIBILITY_ERROR = (error) => ({
    error,
});

export const ASB_CHECK_ELIGIBILITY_SUCCESS = (
    overallValidationResult,
    dataType,
    checkEligibilityResponse
) => ({
    overallValidationResult,
    dataType,
    checkEligibilityResponse,
});
