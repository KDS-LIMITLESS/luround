enum ResponseMessages {
  /**
   * The email provided does not exist in dataase
   */
  EmailDoesNotExist = 'User not found',

  /**
   * Email found in database
   */
  EmailExists = 'Email already exists',
  
  /**
   * The custom luround link has been changed by the user or email pointing to the link does not exist
   */
  BrokenLinkUrl = 'Broken link or url does not exist in database',

  /**
   * Some errors encountered while generating user qrcdode or the email specified does not exist
   */
  QRCodeError = 'Error generating qrcode.',

  /**
   * Username specified does not exist or password does not match
   */
  BadLoginDetails = 'Invalid login details',
  
  /**
   * The user service requested for does not exist
   */
  SeviceNotFound = 'Service not found',

  ServiceDeleted = 'Service Deleted Successfully',

  ServiceUpdated = 'Service Updated Successfully'
  
}

export default ResponseMessages