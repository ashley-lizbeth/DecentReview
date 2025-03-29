import Int32 "mo:base/Int32";
import Buffer "mo:base/Buffer";
import Text "mo:base/Text";

module Types {
    public type Opinion = Bool;

    public type ReviewCategory = Text;
    public let reviewCategoryList : [ReviewCategory] = ["original", "informative", "entertaining", "useful"];
    public type CategoryCount = {
        original : Int32;
        informative : Int32;
        entertaining : Int32;
        useful : Int32;
    };

    public type NormalReview = {
        url : Text;
        id : Text;
        opinion : Opinion;
        category : ReviewCategory;
    };

    public type PremiumReview = {
        url : Text;
        opinion : Opinion;
        comment : Text;
    };

    public type ReviewAggregation = {
        totalVotes : Int32;
        categoryCount : [Int32];
        comments : [PremiumReview];
    };

    public type NormalReviewDatabase = Buffer.Buffer<NormalReview>;
    public type PremiumReviewDatabase = Buffer.Buffer<PremiumReview>;
};
