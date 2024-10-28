import { PartialType, PickType } from "@nestjs/mapped-types";
import { IsEnum, IsMongoId, IsNotEmpty } from "class-validator";

enum ProductCategory {
  eBook = "eBook",
  Course = "Course",
  Music = "Music"
}


export class ProductDTO {

  @IsNotEmpty()
  product_name: string

  @IsNotEmpty()
  description: string

  @IsNotEmpty()
  @IsEnum(ProductCategory)
  category: string

  @IsNotEmpty()
  photoURL: string

  @IsNotEmpty()
  price: string

  links: string
  
}

export class EProductDTO extends PartialType(ProductDTO) {}
export class ProductCategoryDTO extends PickType(ProductDTO, ['category']) {}

export class ProductIdDTO {

  @IsMongoId()
  productId: string
}

export class ProductPurchseDTO {

  @IsNotEmpty()
  full_name: string

  @IsNotEmpty()
  email: string

  @IsNotEmpty()
  phone_number: string

  @IsNotEmpty()
  price: string
}