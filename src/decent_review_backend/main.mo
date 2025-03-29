import Text "mo:base/Text";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Types "./types";

actor {
  let normalReviewsDB : Types.NormalReviewDatabase = Buffer.Buffer<Types.NormalReview>(0);
  let premiumReviewsDB : Types.PremiumReviewDatabase = Buffer.Buffer<Types.PremiumReview>(0);
  let premiumReviewersDB : Types.PremiumReviewers = Buffer.Buffer<Principal>(0);

  public query (msg) func whoAmI() : async Principal {
    msg.caller;
  };

  public shared (msg) func createNormalReview(review : Types.NormalReviewRequest) {
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
    var countedVotes : Int32 = 0;
    var totalVotes : Nat = 0;
    let categoryCount = Array.init<Int32>(4, 0);
    let comments = Buffer.Buffer<Types.PremiumReview>(0);

    func aggregateNormalReview(review : Types.NormalReview) {
      if (review.url != url) return;

      totalVotes += 1;

      var vote : Int32 = 0;
      if (review.opinion) {
        vote := 1;
      } else {
        vote := -1;
      };

      countedVotes += vote;

      switch (Types.getIndexOfCategory(review.category)) {
        case (?index) {
          categoryCount[index] += 1;
        };
        case null {};
      };
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
      countedVotes;
      totalVotes;
      categoryCount = Iter.toArray<Int32>(categoryCount.vals());
      comments = Buffer.toArray<Types.PremiumReview>(comments);
    };
  };
};
