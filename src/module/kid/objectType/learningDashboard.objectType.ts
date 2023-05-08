import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
class Level {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  _id?: string;

  @Field(() => String, { nullable: true })
  key?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  order?: number;
}

@ObjectType()
class LeaderBoard {
  @Field(() => String, { nullable: true })
  childId?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  avatar?: string;

  @Field(() => Int, { nullable: true })
  balance?: number;
}

@ObjectType()
class Summary {
  @Field(() => String, { nullable: true })
  earning?: string;

  @Field(() => Int, { nullable: true })
  dayInTraining?: number;

  @Field(() => Int, { nullable: true })
  completedLessons?: number;
}

@ObjectType()
class BalanceDetail {
  @Field(() => Int, { nullable: true })
  rate?: number;

  @Field(() => String, { nullable: true })
  balance?: string;
}

@ObjectType()
class EarningDetail {
  @Field(() => String, { nullable: true })
  balance?: string;

  @Field(() => BalanceDetail, { nullable: true })
  investments: BalanceDetail;

  @Field(() => BalanceDetail, { nullable: true })
  spending: BalanceDetail;

  @Field(() => BalanceDetail, { nullable: true })
  sharing: BalanceDetail;
}

@ObjectType()
class DailyActivity {
  @Field(() => String, { nullable: true })
  shortDay?: string;

  @Field(() => Float, { nullable: true })
  value?: number;

  @Field(() => String, { nullable: true })
  timeName?: string;

  @Field(() => String, { nullable: true })
  dateName?: string;
}

@ObjectType()
export class LearningDashboard {
  @Field(() => String, { nullable: true })
  currentLevel?: string;

  @Field(() => [String], { nullable: 'items' })
  availableLevels: string[];

  @Field(() => [Level], { nullable: true })
  levels: Level[];

  @Field(() => [LeaderBoard], { nullable: true })
  leaderBoard: LeaderBoard[];

  @Field(() => Summary, { nullable: true })
  summary: Summary;

  @Field(() => EarningDetail, { nullable: true })
  earningDetails: EarningDetail;

  @Field(() => [DailyActivity], { nullable: true })
  weeklyActivities: DailyActivity[];
}
