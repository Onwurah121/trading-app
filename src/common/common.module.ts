import { Module, Global } from '@nestjs/common';
import { EmailService } from './services/email.service';

@Global() // Makes the module global so you don't need to import it everywhere
@Module({
  providers: [EmailService],
  exports: [EmailService], // Export so other modules can use it
})
export class CommonModule {}
