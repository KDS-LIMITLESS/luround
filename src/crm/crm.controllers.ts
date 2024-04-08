import { Body, Controller, Delete, Get, HttpStatus, Post, Query, Req, Res } from "@nestjs/common";
import { CRMService } from "./crm.service.js";
import { ContactDTO } from "./crmDto.js";

@Controller('api/v1/crm')
export class CRMController {
  constructor(private crmService: CRMService) {}

  @Post('new-contact')
  async addNewContact(@Req() req, @Res() res, @Body() payload: ContactDTO) {
    return res.status(HttpStatus.OK).json(await this.crmService.add_new_contact(req.user.userId, payload))
  }

  @Get('contacts')
  async getContacts(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.crmService.get_user_contacts(req.user.userId))
  }

  @Get('customer-transactions')
  async getCustomerTransactions(@Req() req, @Res() res, @Query() query) {
    return res.status(HttpStatus.OK).json(await this.crmService.get_customer_transaction_history( req.user.userId, query.customer_email ))
  }

  @Delete('delete-customer_contact')
  async deleteCustomerContact(@Req() req, @Res() res, @Body() payload: ContactDTO ) {
    return res.status(HttpStatus.OK).json(await this.crmService.delete_customer_contact(req.user.userId, payload))
  }
}