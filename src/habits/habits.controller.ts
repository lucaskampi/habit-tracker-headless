import { Controller, Post, Body, Param, Get, Query } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';

@Controller('users/:userId/habits')
export class HabitsController {
  constructor(private svc: HabitsService) {}

  @Post()
  async create(@Param('userId') userId: string, @Body() dto: CreateHabitDto) {
    return this.svc.createHabit(userId, dto);
  }

  @Get()
  async list(@Param('userId') userId: string) {
    return this.svc.getHabitsForUser(userId);
  }

  @Post(':habitId/complete')
  async complete(@Param('userId') userId: string, @Param('habitId') habitId: string, @Body('date') date?: string) {
    const d = date ? new Date(date) : new Date();
    return this.svc.markCompletion(habitId, d);
  }

  @Post(':habitId/uncomplete')
  async uncomplete(@Param('userId') userId: string, @Param('habitId') habitId: string, @Body('date') date?: string) {
    const d = date ? new Date(date) : new Date();
    return this.svc.unmarkCompletion(habitId, d);
  }

  @Get('/dashboard/heatmap')
  async heatmap(@Param('userId') userId: string, @Query('start') start?: string, @Query('end') end?: string) {
    const now = new Date();
    const e = end ? new Date(end) : now;
    const s = start ? new Date(start) : new Date(new Date().setMonth(now.getMonth() - 3));
    return this.svc.getHeatmapForUser(userId, s, e);
  }
}
