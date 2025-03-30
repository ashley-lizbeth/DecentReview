import Int32 "mo:base/Int32";
import Buffer "mo:base/Buffer";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Time "mo:base/Time";

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

    public type NormalReviewRequest = {
        url : Text;
        opinion : Opinion;
        categories : [Nat];
    };
    public type NormalReview = {
        url : Text;
        author : Principal;
        opinion : Opinion;
        categories : [Nat];
        timestamp : Time.Time;
    };

    public type PremiumReview = {
        url : Text;
        opinion : Opinion;
        comment : Text;
    };

    public type ReviewAggregation = {
        likes : Nat;
        dislikes : Nat;
        categoryCount : [Int32];
        comments : [PremiumReview];
    };

    public type NormalReviewDatabase = Buffer.Buffer<NormalReview>;
    public type PremiumReviewDatabase = Buffer.Buffer<PremiumReview>;
    public type PremiumReviewers = Buffer.Buffer<Principal>;
};
