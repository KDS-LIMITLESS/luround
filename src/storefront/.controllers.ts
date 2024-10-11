import { Body, Controller, Delete, Get, HttpStatus, Post, Put, Query, Req, Res } from "@nestjs/common";
import { StoreFrontService } from "./storefront.service.js";
import { ProductDTO, EProductDTO, ProductIdDTO } from "./storefrontDTO.js";

@Controller('api/v1/storefront')
export class StoreFrontController {

  constructor(private storeFrontService: StoreFrontService) {}

  @Post('new-product')
  async newProduct(@Req() req, @Res() res, @Body() payload: ProductDTO) {
    return res.status(HttpStatus.OK).json(await this.storeFrontService.addProduct(req.user.userId, payload))
  }

  @Post('purchase-product')
  async purchaseProduct(@Req() req, @Res() res, @Body() payload: any, @Query() query: ProductIdDTO) {
    return res.status(HttpStatus.OK).json(await this.storeFrontService.purchaseProduct(query.productId, payload, payload.tx_ref))
  }

  @Post('record-click')
  async recordProductClick(@Req() req, @Res() res, @Query() query: ProductIdDTO) {
    return res.status(HttpStatus.OK).json(await this.storeFrontService.recordProductClicks(query.productId))
  }

  @Get('get-product')
  async getProduct(@Req() req, @Res() res, @Query() query: ProductIdDTO) {
    return res.status(HttpStatus.OK).json(await this.storeFrontService.getProduct(query.productId))
  }

  @Get('get-all-products')
  async getAllProduct(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.storeFrontService.getAllProducts())
  }

  @Get('product-insight')
  async productInight(@Req() req, @Res() res, @Query() query: ProductIdDTO) {
    return res.status(HttpStatus.OK).json(await this.storeFrontService.getProductInsight(req.user.userId, query.productId))
  }


  @Put('edit-product')
  async editProduct(@Req() req, @Res() res, @Body() payload: EProductDTO, @Query() query: ProductIdDTO) {
    return res.status(HttpStatus.OK).json(await this.storeFrontService.editProduct(req.user.userId, query.productId, payload))
  }

  @Put('/suspend-product')
  async suspend_product(@Req() req, @Query() query: ProductIdDTO, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.storeFrontService.suspendProduct(req.user.userId, query.productId)) 
  }

  @Delete('/delete-product')
  async deleteBooking(@Req() req, @Query() query, @Res() res) {
    return res.status(200).json(await this.storeFrontService.deleteProduct(req.user.userId, query.productId))
  }

}