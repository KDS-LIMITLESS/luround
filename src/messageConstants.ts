enum ResponseMessages {
  /**
   * The email provided does not exist in dataase
   */
  EmailDoesNotExist = 'A user with specified email not found',
  
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
  BadLoginDetails = 'Invalid login details'
}

export default ResponseMessages