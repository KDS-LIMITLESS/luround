import { Module } from "@nestjs/common";
import { Payments } from "./paystack.controllers";
import { PaystackAPI } from "src/payments/paystack.sevices";

@Module({
  imports: [],
  controllers: [Payments],
  providers: [PaystackAPI]
})

export class BookServiceModule {}