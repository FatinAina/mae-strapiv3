import ApiManagerSSO from "@services/ApiManagerSSO";

import {
    METHOD_POST,
    METHOD_GET,
    TIMEOUT,
    TOKEN_TYPE_M2U,
    TOKEN_TYPE_MAYA,
    TOKEN_TYPE_MDIP,
} from "@constants/api";
import { STP_ENDPOINT_BASE, ENDPOINT_BASE } from "@constants/url";

import ApiManager from "./ApiManager";

export const cardsInquiryGET = async (body, subUrl, isEtb) => {
    const tokenType = isEtb ? TOKEN_TYPE_M2U : "PRELOGIN";

    return ApiManager.service({
        url: ENDPOINT_BASE + "/" + subUrl,
        data: body,
        reqType: METHOD_GET,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: true,
    });
};

export const cardsInquiry = async (body, subUrl, isEtb) => {
    const tokenType = isEtb ? TOKEN_TYPE_M2U : "PRELOGIN";
    const reqTyp = isEtb ? METHOD_POST : METHOD_GET;
    console.log(reqTyp);
    return ApiManager.service({
        url: ENDPOINT_BASE + "/" + subUrl,
        data: body,
        reqType: reqTyp,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: true,
    });
};

export const customerInquiry = async (body, subUrl, isEtb) => {
    const tokenType = isEtb ? TOKEN_TYPE_M2U : "PRELOGIN";

    return ApiManager.service({
        url: ENDPOINT_BASE + "/" + subUrl,
        data: body,
        reqType: METHOD_POST,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: true,
    });
};

export const cardsVerify = async (body, subUrl, isEtb) => {
    const tokenType = isEtb ? TOKEN_TYPE_M2U : "PRELOGIN";

    return ApiManager.service({
        url: ENDPOINT_BASE + "/" + subUrl,
        data: body,
        reqType: METHOD_POST,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: true,
    });
};

export const cardsUpdate = async (body, subUrl, isEtb) => {
    const tokenType = isEtb ? TOKEN_TYPE_M2U : "PRELOGIN";

    return ApiManager.service({
        url: ENDPOINT_BASE + "/" + subUrl,
        data: body,
        reqType: METHOD_POST,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: true,
    });
};

export const cardsResume = async (body, subUrl, isEtb) => {
    const tokenType = isEtb ? TOKEN_TYPE_M2U : "PRELOGIN";

    return ApiManager.service({
        url: ENDPOINT_BASE + "/" + subUrl,
        data: body,
        reqType: METHOD_GET,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: true,
    });
};

export const cardsResumeId = async (body, subUrl) => {
    const tokenType = "PRELOGIN";

    return ApiManager.service({
        url: ENDPOINT_BASE + "/" + subUrl,
        data: body,
        reqType: METHOD_POST,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const cardsUploadDoc = (body, subUrl, isMultipart = true) => {
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url: ENDPOINT_BASE + "/" + subUrl,
        data: body,
        reqType: METHOD_POST,
        tokenType,
        secondTokenType,
        isMultipart,
    });
};

export const cardsValidate = async (body, subUrl, isEtb) => {
    const tokenType = isEtb ? TOKEN_TYPE_M2U : "PRELOGIN";

    return ApiManager.service({
        url: ENDPOINT_BASE + "/" + subUrl,
        data: body,
        reqType: METHOD_POST,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: true,
    });
};

/* Ethical cards */
export const getCutomerPersonalDetails = (data, showPreloader = true) => {
    return ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/cards/ethical/etc/personal`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MDIP,
        promptError: false,
        showPreloader,
    });
};

export const getConsent = (data, showPreloader = true) => {
    return ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/cards/ethical/etc/consent`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MDIP,
        promptError: false,
        showPreloader,
    });
};

export const makeETCInquiry = (data, showPreloader = true) => {
    return ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/cards/ethical/etc/inquiry`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MDIP,
        promptError: false,
        showPreloader,
    });
};

export const makeETCSubmission = (data, showPreloader = true) => {
    return ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/cards/ethical/etc/submission`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MDIP,
        promptError: false,
        showPreloader,
    });
};

export const makeETCRequestTAC = (data, showPreloader = true) => {
    return ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/cards/ethical/etc/requestTAC`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MDIP,
        promptError: false,
        showPreloader,
    });
};

export const makeETCStatusInquiry = (data, showPreloader = true) => {
    return ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/cards/ethical/etc/statusInquiry`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MDIP,
        promptError: false,
        showPreloader,
    });
};
