import { Injectable } from '@nestjs/common';
import axios from 'axios';
@Injectable()
export class EmailService {
  public async emailVerification(email: string, code: string): Promise<string>{
        try{
            const options = {
                method: 'post',
                url: 'https://api.useplunk.com/v1/track',
                headers: {
                  Authorization: `Bearer ${process.env.PLUNK_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                data: JSON.stringify({
                  event: `User-signup`,
                  email: `${email}`,
                  data: {
                    code: `${code}`
                  },
                }),
              };

            const response = await axios(options);

            console.log('Email sent');
            
            return 'Email sent'
        }catch(e){
            throw new Error(`${e}`);
        }
    }

}
