import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), VocabularyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
