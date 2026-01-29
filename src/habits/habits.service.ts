import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { addDays, startOfDay } from 'date-fns';

@Injectable()
export class HabitsService {
  constructor(private prisma: PrismaService) {}

  async createHabit(userId: string, dto: CreateHabitDto) {
    return this.prisma.habit.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        frequencyType: dto.frequencyType,
        frequencySpec: dto.frequencySpec,
        goal: dto.goal ?? 1,
      },
    });
  }

  async getHabitsForUser(userId: string) {
    return this.prisma.habit.findMany({ where: { userId } });
  }

  async markCompletion(habitId: string, date: Date) {
    const day = startOfDay(date);
    return this.prisma.habitCompletion.upsert({
      where: { habitId_date: { habitId, date: day } },
      update: { count: { increment: 1 } as any },
      create: { habitId, date: day, count: 1 },
    });
  }

  async unmarkCompletion(habitId: string, date: Date) {
    const day = startOfDay(date);
    // remove the record
    return this.prisma.habitCompletion.deleteMany({ where: { habitId, date: day } });
  }

  // Heatmap: returns map of date string (YYYY-MM-DD) -> number of habits completed that day
  async getHeatmapForUser(userId: string, start: Date, end: Date) {
    // find user's habits
    const habits = await this.prisma.habit.findMany({ where: { userId } });
    const habitIds = habits.map(h => h.id);
    if (habitIds.length === 0) return {};
    const completions = await this.prisma.habitCompletion.findMany({
      where: { habitId: { in: habitIds }, date: { gte: start, lte: end } },
    });
    const map: Record<string, number> = {};
    for (let d = startOfDay(start); d <= end; d = addDays(d, 1)) {
      const key = d.toISOString().slice(0, 10);
      map[key] = 0;
    }
    completions.forEach(c => {
      const key = c.date.toISOString().slice(0, 10);
      map[key] = (map[key] ?? 0) + c.count;
    });
    return map;
  }
}
