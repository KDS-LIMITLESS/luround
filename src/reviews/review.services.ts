import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import ResponseMessages from "../messageConstants.js";
import { ObjectId } from "mongodb";

@Injectable()
export class ReviewService {
  _rDB = this.dbManager.reviewsDB
  constructor(private dbManager: DatabaseService) {}

  async review(user_to_review_userId: string, reviewData: any) {
    // const { displayName, photoUrl, userId} = user
    // get service to write review for. 
    let get_user:any = await this.dbManager.findOneDocument(this._rDB, "_id", user_to_review_userId)
    // if (userId == user_to_review_userId) throw new BadRequestException({message: "Are you revewing yourself?"})
    
    let reviews = [{
      user_name: reviewData.user_name,
      userPhoto: reviewData.photoUrl,
      reviewText: reviewData.comment,
      rating: reviewData.rating,
      created_at: Date.now()
    }]
    
    if(get_user !== null ) {
      await this.dbManager.updateArr(this._rDB, '_id', new ObjectId(user_to_review_userId), 'reviews', reviews )
      return ResponseMessages.ReviewAdded
    }
    await this.dbManager.create(this._rDB, {"_id": new ObjectId(user_to_review_userId), "reviews": reviews} )
    return ResponseMessages.ReviewAdded
  }

  async get_user_reviews(userId: string) {
    let get_reviews = await this.dbManager.findOneDocument(this._rDB, "_id", userId)
    if (get_reviews === null) throw new NotFoundException({message: ResponseMessages.ServiceHasNoReviews})
    return get_reviews.reviews
  }
}
