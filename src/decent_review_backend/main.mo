import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Types "./types";

actor {
  let normalReviewsDB : Types.NormalReviewDatabase = Buffer.Buffer<Types.NormalReview>(0);
  let premiumReviewsDB : Types.PremiumReviewDatabase = Buffer.Buffer<Types.PremiumReview>(0);
  let premiumReviewersDB : Types.PremiumReviewers = Buffer.Buffer<Principal>(0);

  public query (msg) func whoAmI() : async Principal {
    msg.caller;
  };

  public shared (msg) func createNormalReview(review : Types.NormalReview) {
    normalReviewsDB.add({
      url = review.url;
      author = msg.caller;
      opinion = review.opinion;
      category = review.category;
    });
  };

  private func isPremiumReviewer(caller : Principal) : Bool {
    var isPremium = false;
    Buffer.iterate<Principal>(
      premiumReviewersDB,
      func(id : Principal) {
        if (id == caller) isPremium := true;
      },
    );

    return isPremium;
  };

  public query (msg) func isPremium() : async Bool {
    isPremiumReviewer(msg.caller);
  };

  public shared (msg) func createPremiumReview(review : Types.PremiumReview) {
    if (isPremiumReviewer(msg.caller)) premiumReviewsDB.add(review);
  };

  public query (msg) func getReviewOf(url : Text) : async ?Types.Opinion {
    var tempOpinion : ?Types.Opinion = null;
    Buffer.iterate<Types.NormalReview>(
      normalReviewsDB,
      func(review) {
        if (review.url == url and review.author == msg.caller) {
          tempOpinion := ?review.opinion;
        };
      },
    );

    return tempOpinion;
  };

  public query func obtainReviewsOf(url : Text) : async Types.ReviewAggregation {
    var totalVotes : Int32 = 0;
    let categoryCount = HashMap.HashMap<Types.ReviewCategory, Int32>(
      Types.reviewCategoryList.size(),
      Text.equal,
      Text.hash,
    );
    let comments = Buffer.Buffer<Types.PremiumReview>(0);

    func aggregateNormalReview(review : Types.NormalReview) {
      if (review.url != url) return;

      var vote : Int32 = 0;
      if (review.opinion) {
        vote := 1;
      } else {
        vote := -1;
      };

      totalVotes += vote;

      let originalCategoryVotes : Int32 = switch (categoryCount.get(review.category)) {
        case (?n) { n };
        case null { 0 };
      };
      let _ = categoryCount.replace(review.category, originalCategoryVotes + vote);
    };

    Buffer.iterate<Types.NormalReview>(
      normalReviewsDB,
      aggregateNormalReview,
    );

    Buffer.iterate<Types.PremiumReview>(
      premiumReviewsDB,
      func(review) {
        if (review.url != url) return;
        comments.add({
          url = url;
          opinion = review.opinion;
          comment = review.comment;
        });
      },
    );

    {
      totalVotes = totalVotes;
      categoryCount = Iter.toArray<Int32>(categoryCount.vals());
      comments = Buffer.toArray<Types.PremiumReview>(comments);
    };
  };
};
