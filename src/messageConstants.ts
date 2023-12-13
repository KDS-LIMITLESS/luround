enum ResponseMessages {
  /**
   * The email provided does not exist in dataase
   */
  EmailDoesNotExist = 'User not found',
  USER_CREATED = "User created successfully",
  UserNotCreated = 'User Not Created',

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
  ServiceNotFound = 'Service not found',

  ServiceDeleted = 'Service Deleted Successfully',

  ServiceUpdated = 'Service Updated Successfully',

  InvalidServiceId = 'Invalid Service ID',
  BOOKING_ID_NOT_FOUND = 'Booking ID not found',
  WalletPinCreated = 'Your wallet pin has been created succesfully',
  Success = 'OK',
  InvalidWalletPin = "Invalid wallet pin",
  SetWalletPin = 'You have not set a wallet pin.',
  WalletDetailAdded = "Bank detail added",
  ReviewAdded = "Review added successfully",
  ServiceHasNoReviews = "This service has no reviews yet",
  WalletNotFound = "Wallet Not Found"
  
}

export default ResponseMessages