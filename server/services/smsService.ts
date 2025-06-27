import { Twilio } from 'twilio';

interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

interface SMSMessage {
  to: string;
  message: string;
  title?: string;
}

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  status?: string;
}

class SMSService {
  private twilioClient: Twilio | null = null;
  private config: SMSConfig | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeFromEnv();
  }

  private initializeFromEnv(): void {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && fromNumber) {
      this.configure({
        accountSid,
        authToken,
        fromNumber
      });
    }
  }

  configure(config: SMSConfig): void {
    try {
      this.config = config;
      this.twilioClient = new Twilio(config.accountSid, config.authToken);
      this.isConfigured = true;
      console.log('📱 SMS Service: Configured successfully');
    } catch (error) {
      console.error('❌ SMS Service: Configuration failed:', error);
      this.isConfigured = false;
    }
  }

  async sendSMS(smsMessage: SMSMessage): Promise<SMSResponse> {
    if (!this.isConfigured || !this.twilioClient || !this.config) {
      return {
        success: false,
        error: 'SMS service not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables.'
      };
    }

    try {
      // Validate phone number format
      if (!this.isValidPhoneNumber(smsMessage.to)) {
        return {
          success: false,
          error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)'
        };
      }

      // Format message with title if provided
      const messageBody = smsMessage.title 
        ? `${smsMessage.title}\n\n${smsMessage.message}`
        : smsMessage.message;

      // Truncate message if too long (SMS limit is 1600 characters)
      const truncatedMessage = messageBody.length > 1600 
        ? messageBody.substring(0, 1597) + '...'
        : messageBody;

      const result = await this.twilioClient.messages.create({
        body: truncatedMessage,
        from: this.config.fromNumber,
        to: smsMessage.to
      });

      console.log(`📱 SMS sent successfully to ${smsMessage.to}: ${result.sid}`);

      return {
        success: true,
        messageId: result.sid,
        status: result.status
      };

    } catch (error: any) {
      console.error('❌ SMS sending failed:', error);
      
      return {
        success: false,
        error: error.message || 'Unknown SMS sending error'
      };
    }
  }

  async sendBulkSMS(messages: SMSMessage[]): Promise<SMSResponse[]> {
    const results: SMSResponse[] = [];

    for (const message of messages) {
      const result = await this.sendSMS(message);
      results.push(result);
      
      // Add small delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic E.164 format validation
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  // Utility method to format phone numbers
  formatPhoneNumber(phoneNumber: string, countryCode: string = '+1'): string {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // If it starts with country code digits, don't add again
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    // If it's 10 digits (US/Canada), add +1
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    
    // If it already starts with +, return as is
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }
    
    // Otherwise, add the provided country code
    return `${countryCode}${digits}`;
  }

  getStatus(): { configured: boolean; provider: string; fromNumber?: string } {
    return {
      configured: this.isConfigured,
      provider: 'Twilio',
      fromNumber: this.config?.fromNumber
    };
  }

  // Test method to verify SMS configuration
  async testConfiguration(testPhoneNumber: string): Promise<SMSResponse> {
    return await this.sendSMS({
      to: testPhoneNumber,
      title: 'Waides KI Test',
      message: 'SMS service is configured correctly! You will receive trading alerts at this number.'
    });
  }
}

// Export singleton instance
export const smsService = new SMSService();
export default smsService;