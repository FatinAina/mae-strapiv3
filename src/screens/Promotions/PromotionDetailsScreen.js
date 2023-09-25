import PropTypes from "prop-types";
import React from "react";
import { act } from "react-test-renderer";

import ContentDetailsScreenTemplate from "@components/ScreenTemplates/ContentDetailsScreenTemplate";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { getHomeDetailScreenData } from "@services";
import { getLike } from "@services";
import { FAArticleScreen } from "@services/analytics/analyticsArticles";
import { FAPromotionDetailsScreen } from "@services/analytics/analyticsPromotions";

import { ENDPOINT_BASE } from "@constants/url";

import CTAController from "./CTAController";

class PromotionDetailsScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object,
        getModel: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            contentData: {},
        };
    }

    componentDidMount() {
        const callPage = this.props.route?.params?.callPage ?? "";
        const { itemDetails } = this.props.route?.params;
        const page = this.props.route?.params?.page ?? "";
        if (page) {
            FAArticleScreen.onScreen(itemDetails?.title);
        } else {
            if (itemDetails?.title) {
                FAPromotionDetailsScreen.onScreen(itemDetails?.title);
            }
        }

        if (callPage === "Moments-Voucher") {
            this.getContentDataFromProps();
        } else {
            if (itemDetails?.id) {
                this.fetchContentData(itemDetails?.id);
            }
        }
    }

    getContentDataFromProps = () => {
        this.setState({ contentData: this.props.route?.params?.itemDetails });
    };

    _getLikeCount = async (contentId) => {
        try {
            const { getModel } = this.props;
            const userDetails = getModel("user");
            const userId = userDetails?.m2uUserId;
            const endpoint = `http://localhost:3001/v1/engagement`;
            const query = `/${contentId}?userId=${userId}&engagementTypes=like`;
            const data = await getLike(endpoint, query);
            return data;
        } catch (error) {
            console.log("error retrieving engagement service");
            throw error;
        }
    };

    fetchContentData = async (id) => {
        try {
            const { cmsUrl, cmsCloudEnabled } = this.props.getModel("cloud");
            const endpoint = cmsCloudEnabled ? cmsUrl : `${ENDPOINT_BASE}/cms/api/v1`;
            const response = await getHomeDetailScreenData(endpoint, id);

            if (response) {
                const { result } = response.data;

                const likeCountResponse = await this._getLikeCount(result.id);

                const likeCountData = likeCountResponse?.data?.data?.userEngagements || {};

                result.likeCount = likeCountData.like.count || 0;
                result.userContent = {
                    emotionStatus: likeCountData.like.userDidEngage ? "LIKE" : "",
                };

                this.setState({
                    contentData: result,
                });
            }
        } catch (error) {
            // go back to where ever it coming from
            showErrorToast({
                message: `Couldn't retrieve the content details.`,
            });

            this.props.navigation.goBack();
        }
    };

    render() {
        const { contentData } = this.state;
        const {
            route: {
                params: { callPage, onGoBack, index, page },
            },
        } = this.props;

        if (!contentData.id) return null;

        return (
            <ContentDetailsScreenTemplate
                callPage={callPage}
                itemDetails={contentData}
                onGoBack={onGoBack}
                index={index}
                navigation={this.props.navigation}
                onCTAPressed={CTAController}
                logTopMenuItem={FAPromotionDetailsScreen.onTopMenuIcon}
                logLikeButton={FAPromotionDetailsScreen.onLikePress}
                logItemTopMenuPress={FAPromotionDetailsScreen.onTopMenuItemPress}
                logCTAPressed={FAPromotionDetailsScreen.onCTAPress}
                isArticleMode={page}
            />
        );
    }
}

export default withModelContext(PromotionDetailsScreen);
