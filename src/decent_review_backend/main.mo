import Text "mo:base/Text";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Types "./types";

actor {
  let normalReviewsDB : Types.NormalReviewDatabase = Buffer.Buffer<Types.NormalReview>(0);
  let premiumReviewsDB : Types.PremiumReviewDatabase = Buffer.Buffer<Types.PremiumReview>(0);
  let premiumReviewersDB : Types.PremiumReviewers = Buffer.Buffer<Principal>(0);

  for (i in Iter.range(0, normalReviewsDB.size() - 1)) {
    normalReviewsDB.add({
      url = "www.netflix.com";
      author = Principal.fromText("aaaaa-aa");
      opinion = true;
      categories = [0, 2];
      timestamp = Time.now();
    });
  };

  public query (msg) func whoAmI() : async Principal {
    msg.caller;
  };

  public shared (msg) func upgradeToPremium() : async Text {
    if (isPremiumReviewer(msg.caller)) {
      return "Ya eres un usuario Premium.";
    };

    premiumReviewersDB.add(msg.caller);
    return "¡Ahora eres un usuario Premium!";
  };

  public shared (msg) func createNormalReview(review : Types.NormalReviewRequest) {
    normalReviewsDB.add({
      url = review.url;
      author = msg.caller;
      opinion = review.opinion;
      categories = review.categories;
      timestamp = Time.now();
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

  public shared (msg) func createPremiumReview(review : Types.PremiumReview) : async Text {
    if (isPremiumReviewer(msg.caller)) {
      premiumReviewsDB.add(review);
      return "Reseña premium agregada.";
    } else {
      return "No tienes acceso a las reseñas premium.";
    };
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
    var likes : Nat = 0;
    var dislikes : Nat = 0;
    let categoryCount = Array.init<Int32>(Types.reviewCategoryList.size() * 2, 0);
    let comments = Buffer.Buffer<Types.PremiumReview>(0);

    func aggregateNormalReview(review : Types.NormalReview) {
      if (review.url != url) return;

      var categoryIndex : Nat = 0;
      if (review.opinion) {
        likes += 1;
      } else {
        dislikes += 1;
        categoryIndex += Types.reviewCategoryList.size();
      };

      for (index in review.categories.vals()) {
        categoryCount[index + categoryIndex] += 1;
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
      likes;
      dislikes;
      categoryCount = Iter.toArray<Int32>(categoryCount.vals());
      comments = Buffer.toArray<Types.PremiumReview>(comments);
    };
  };
};
