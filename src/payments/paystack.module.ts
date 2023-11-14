import { Module } from "@nestjs/common";
import { Payments } from "./paystack.controllers.js";
import { PaystackAPI } from "../payments/paystack.sevices.js";

@Module({
  imports: [],
  controllers: [Payments],
  providers: [PaystackAPI]
})

export class PaymentsModule {}