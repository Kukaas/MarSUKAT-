import axios from 'axios';

/**
 * Verifies a reCAPTCHA token
 * @param {string} token - The reCAPTCHA token from the client
 * @returns {Promise<boolean>} - Returns true if verification succeeded
 */
export const verifyRecaptcha = async (token) => {
  if (!token) return false;
  
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY is not defined in environment variables');
      return false;
    }
    
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: secretKey,
          response: token
        }
      }
    );
    
    return response.data.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
};