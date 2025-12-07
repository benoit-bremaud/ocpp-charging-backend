/**
 * AuthorizeOutput DTO
 * 
 * Data Transfer Object pour la réponse d'autorisation
 * 
 * OCPP 1.6 § 3.5 - Authorize
 */
export class AuthorizeOutput {
  idTokenInfo: {
    status: 'Accepted' | 'Blocked' | 'Expired' | 'Invalid' | 'ConcurrentTx';
    expiryDate?: string;
    parentIdTag?: string;
  } = {
    status: 'Accepted'
  };
}
