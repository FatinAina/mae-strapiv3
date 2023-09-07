export const GUARANTOR_SUBMIT_OTP_REQUEST_BODY = (requestBody) => ({
    requestBody,
});

export const GUARANTOR_REQUEST_OTP_SUCCESS = (data) => ({
    data,
});

export const GUARANTOR_REQUEST_OTP_ERROR = (error) => ({ error });

export const GUARANTOR_SUBMIT_OTP_SUCCESS = (isAgreeToBeContacted) => ({
    isAgreeToBeContacted,
});

export const GUARANTOR_SUBMIT_OTP_ERROR = () => ({});
