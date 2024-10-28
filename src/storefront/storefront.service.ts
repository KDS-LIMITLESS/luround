import { BadRequestException, Injectable } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import { EProductDTO, ProductDTO, ProductIdDTO, ProductPurchseDTO } from "./storefrontDTO.js";
import { ObjectId } from "mongodb";
import { generateRandomAlphabets } from "../utils/mail.services.js";
import { TransactionsManger } from "../transaction/tansactions.service.js";

@Injectable()
export class StoreFrontService {
  _productsDB = this.databaseManager.storefrontDB

  constructor(private databaseManager: DatabaseService, /*private trnx: TransactionsManger*/) {}
  
  async addProduct(userId: string, product_details: ProductDTO) {
    await this.databaseManager.create(this._productsDB, {
      userId: new ObjectId(userId), 
      ...product_details, 
      status: "ACTIVE",
      product_link: `https://luround.com/${await generateRandomAlphabets(6)}`
    })
    return product_details
  }

  async getProduct(productId: string) {
    let product = await this.databaseManager.findOneDocument(this._productsDB, "_id", productId.toString())
    if (product === undefined) throw new BadRequestException({message: "ProductId not found"})
    return product
  }

  async getAllProducts(item_category: string) {
    return this._productsDB.find({"category": item_category}).toArray()
  }

  async editProduct(userId: string, productId: string, product_details: EProductDTO) {
    const FIND_PRODUCT = await this.databaseManager.findOneDocument(this._productsDB, "_id", productId.toString())
    if (FIND_PRODUCT !== null && FIND_PRODUCT.userId.toString() === userId) {
      await this.databaseManager.updateDocument(this._productsDB, productId.toString(), { ...product_details })
      return product_details;
    }
    throw new BadRequestException({message: "Product Not Found!"})
  }

  async suspendProduct(userId:string, productId: string) {
    try {
      let product = await this.databaseManager.findOneDocument(this._productsDB, "_id", productId)
      
      await this.isUser(userId, product.userId)
      
      if (product === null) throw new BadRequestException({
        message: "Invalid product Id"
      })

      if (product.status === 'ACTIVE') {
        await this.databaseManager.updateDocument(this._productsDB, productId, {status: "SUSPENDED"})
        return product
      }

      await this.databaseManager.updateDocument(this._productsDB, productId, {status: "ACTIVE"})
      return product
    } catch (err: any){
      throw new BadRequestException({message: err.message})
    }
  }

  async deleteProduct(userId: string, productId: string) {
    let product = await this.databaseManager.findOneDocument(this._productsDB, "_id", productId)
    await this.isUser(userId, product.userId)
    let item = await this.databaseManager.delete(this._productsDB, productId)
    return item.value
  }

  async isUser(userId: string, uid:string) {
    const CHECK_USER = userId === uid.toString() ? true : false
    if (CHECK_USER === false) throw new BadRequestException({message: "Item does not belong to this user"})
    return CHECK_USER
  }

  // PRODUCT INSIGHT EMBEDDED WITH THE PRODUCT 


  // @Internal - No endpoint for this function
  async storeProductPurchaseHistory(productId: string, 
    price: string, date_purchased: string, customer_name: string, customer_email: string,
    customer_phone, tx_ref: string ) 
  {
    let FIND_PRODUCT = await this .databaseManager.findOneDocument(this._productsDB, "_id", productId)
    // FIND THE SERVICE WITH SPECIFIED ID 
    // let find_service_id = await this.databaseManager.findOneDocument(this._productsDB, "_id", productId)
    let purchaseHistory = {date_purchased, customer_name, price, customer_email, customer_phone, tx_ref  }
    // if (find_service_id === null) {
    //   return await this.databaseManager.create(this._productsDB, {"_id": new ObjectId(productId), purchaseHistory: [purchaseHistory]})
    // }
    return await this.databaseManager.updateArr(this._productsDB, "_id", new ObjectId(productId), "insights", [purchaseHistory])
    
  }

  // RETURN THE BOOKINGS MADE FOR A PARTICULAR SERVICE
  async getProductInsight(userId: string, productId: string) {
    try {
      const PRODUCT_INSIGHT = await this.databaseManager.findOneDocument(this._productsDB, "_id", productId)
      if (PRODUCT_INSIGHT === null || PRODUCT_INSIGHT.purchaseHistory === undefined) return []

      await this.isUser(userId, PRODUCT_INSIGHT.userId)

      let purchaseLength = PRODUCT_INSIGHT.purchaseHistory.length || 0
      let purchaseHistory = PRODUCT_INSIGHT.purchaseHistory
      return { purchaseLength, purchaseHistory }

      // const product = new ObjectId(productId);
    
      // const serviceInsights = await this._productsDB.find({ "_id": product }).toArray();
      // if(serviceInsights.length === 0) return []
      // if (!serviceInsights[0].purchaseHistory) return [
      //   {clicks: serviceInsights[0].clicks || 0},
      //   { booking_count: 0 }, 
      //   { purchaseHistory: [] },
      // ]

      // let totalBookingCount = 0;
      // let serviceBookings = [];

      // serviceInsights.forEach((insight) => {
      //     serviceBookings.push(...insight.purchaseHistory);  // flatten purchaseHistory array wit spread
      //     totalBookingCount += insight.purchaseHistory.length;
      // });

      // // Return booking count and purchaseHistory as separate objects in a tuple
      // return [
      //    { booking_count: totalBookingCount }, 
      //    { purchaseHistory: serviceBookings },
      //    {clicks: serviceInsights[0].clicks || 0}
      // ];
    } catch(err: any) {
      throw new BadRequestException({message: err.essage})
    }
  }
  
  async recordProductClicks(productId: string) {
    try {
       // CHECK IF SERVICES HAS AN INSIGHTS DOCUMENT ON DB AND UPDATE
      let product = await this.databaseManager.findOneDocument(this._productsDB, "_id", productId)
      if (product === null ) throw new BadRequestException({message: "Product not found!"})
      let clicks = 0
      product.clicks === undefined ? clicks = Number(product.clicks ?? 0) : clicks = Number(product.clicks)
      await this.databaseManager.updateDocument(this._productsDB, productId, {clicks: clicks += 1})
      return product

    } catch (err: any) {
      throw new BadRequestException({message: "Invalid service id or service link not found."})
    }
  }

  async purchaseProduct(productId: string, purchaseDetails: ProductPurchseDTO, tx_ref: string) {
    let dt = new Date()
    let product = await this.getProduct(productId)
    await this.storeProductPurchaseHistory(
      productId,
      dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds(),
      product.price,
      purchaseDetails.email,
      purchaseDetails.full_name,
      purchaseDetails.email,
      tx_ref   
    )
  }

  // async recordProductTransaction(purchaseDetails: ProductPurchseDTO) {
  //   let product = 
  //   await this.trnx.recordUserProductTransactions(product.userId, {
  //     productId: new ObjectId(productId), product_name: product.product_name, price: product.price,
  //     customer_name: purchaseDetails.full_name, customer_email: purchaseDetails.email,
  //     transaction_status: "RECEIVED", transaction_ref: tx_ref
  //   })

  //   return {"message": "Product purchase successful!"}
  // }
}