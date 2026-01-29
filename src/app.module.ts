import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { HabitsModule } from './habits/habits.module';

@Module({
  imports: [HabitsModule],
  providers: [PrismaService]
})
export class AppModule {}
