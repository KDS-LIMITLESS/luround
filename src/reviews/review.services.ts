import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import ResponseMessages from "../messageConstants.js";

@Injectable()
export class ReviewService {
  _rDB = this.dbManager.reviewsDB
  _sDB = this.dbManager.serviceDB
  constructor(private dbManager: DatabaseService) {}

  async review(user: any, serviceId: string, reviewData: any) {
    const { displayName, photoUrl } = user
    // get service to write review for. 
    let get_service:any = await this.dbManager.findOneDocument(this._rDB, "serviceId", serviceId)
    reviewData = {
      serviceId,
      reviews : [{
        userName: displayName,
        userPhoto: photoUrl,
        reviewText: reviewData.comment,
        rating: reviewData.rating
      }]
    }
    if(get_service !== null ) {
      await this.dbManager.updateArr(this._rDB, 'serviceId', serviceId, 'reviews', reviewData.reviews )
      return ResponseMessages.ReviewAdded
    }
    await this.dbManager.create(this._rDB, reviewData )
    return ResponseMessages.ReviewAdded
  }

  async get_service_reviews(serviceId: string) {
    let get_reviews = await this.dbManager.findOneDocument(this._rDB, "serviceId", serviceId)
    if (get_reviews === null) throw new NotFoundException({message: ResponseMessages.ServiceHasNoReviews})
    return get_reviews.reviews
  }
}