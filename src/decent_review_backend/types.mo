import Int32 "mo:base/Int32";
import Buffer "mo:base/Buffer";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";

module Types {
    public type Opinion = Bool;

    public type ReviewCategory = Text;
    public let reviewCategoryList : [ReviewCategory] = ["original", "informative", "entertaining", "useful"];

    public func getIndexOfCategory(category : Text) : ?Nat {
        for (i in Iter.range(0, reviewCategoryList.size() - 1)) {
            if (reviewCategoryList[i] == category) return ?i;
        };
        return null;
    };

    public type NormalReview = {
        url : Text;
        author : Principal;
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
    public type PremiumReviewers = Buffer.Buffer<Principal>;
};
