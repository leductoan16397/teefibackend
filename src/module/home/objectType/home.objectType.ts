import { Field, Int, ObjectType } from '@nestjs/graphql';
import { MemberType } from './type';

@ObjectType()
class SeoMeta {
  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  ogImage?: string;
}

@ObjectType()
class SectionLearningJourneyMapTitle {
  @Field(() => String, { nullable: true })
  subTitle?: string;

  @Field(() => String, { nullable: true })
  title?: string;
}

@ObjectType()
class LearningJourneyData {
  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  content?: string;

  @Field(() => String, { nullable: true })
  buttonTxt?: string;

  @Field(() => String, { nullable: true })
  image?: string;
}

@ObjectType()
class SectionLearningJourneyMap {
  @Field(() => SectionLearningJourneyMapTitle, { nullable: true })
  title?: SectionLearningJourneyMapTitle;

  @Field(() => [LearningJourneyData], { nullable: 'items' })
  data?: LearningJourneyData[];
}

@ObjectType()
class FinanciallySmartGenerationTitle {
  @Field(() => String, { nullable: true })
  value?: string;

  @Field(() => [String], { nullable: 'items' })
  highlight?: string[];
}

@ObjectType()
class SectionFinanciallySmartGeneration {
  @Field(() => FinanciallySmartGenerationTitle, { nullable: true })
  title?: FinanciallySmartGenerationTitle;

  @Field(() => String, { nullable: true })
  content?: string;

  @Field(() => String, { nullable: true })
  buttonTxt?: string;

  @Field(() => String, { nullable: true })
  image?: string;
}

@ObjectType()
class OurClientSayData {
  @Field(() => String, { nullable: true })
  content?: string;

  @Field(() => String, { nullable: true })
  image?: string;

  @Field(() => String, { nullable: true })
  name?: string;
}

@ObjectType()
class SectionOurClientSay {
  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  content?: string;

  @Field(() => [OurClientSayData], { nullable: 'items' })
  data?: OurClientSayData[];
}

@ObjectType()
class SectionTryUnlimited {
  @Field(() => FinanciallySmartGenerationTitle, { nullable: true })
  title?: FinanciallySmartGenerationTitle;

  @Field(() => String, { nullable: true })
  content?: string;

  @Field(() => [MemberType], { nullable: 'items' })
  data?: MemberType[];
}

@ObjectType()
class HeaderNotify {
  @Field(() => String, { nullable: true })
  value?: string;

  @Field(() => Int, { nullable: true })
  isEnable?: number;

  @Field(() => String, { nullable: true })
  actionTxt?: string;
}

@ObjectType()
class ContentDescription {
  @Field(() => String, { nullable: true })
  value?: string;

  @Field(() => Int, { nullable: true })
  isEnable?: number;
}

@ObjectType()
class SectionDidYouKnow {
  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  content?: string;

  @Field(() => String, { nullable: true })
  image?: string;
}

@ObjectType()
export class HomeType {
  @Field(() => String, { nullable: true })
  mailCollectionTxt?: string;

  @Field(() => String, { nullable: true })
  slogan?: string;

  @Field(() => String, { nullable: true })
  elearningImg?: string;

  @Field(() => SeoMeta, { nullable: true })
  seoMeta?: SeoMeta;

  @Field(() => SectionLearningJourneyMap, { nullable: true })
  sectionLearningJourneyMap?: SectionLearningJourneyMap;

  @Field(() => SectionFinanciallySmartGeneration, { nullable: true })
  sectionFinanciallySmartGeneration?: SectionFinanciallySmartGeneration;

  @Field(() => SectionFinanciallySmartGeneration, { nullable: true })
  sectionFinancialSuccess?: SectionFinanciallySmartGeneration;

  @Field(() => SectionFinanciallySmartGeneration, { nullable: true })
  sectionInteractiveAndFunLearning?: SectionFinanciallySmartGeneration;

  @Field(() => SectionOurClientSay, { nullable: true })
  sectionOurClientSay?: SectionOurClientSay;

  @Field(() => SectionTryUnlimited, { nullable: true })
  sectionTryUnlimitedForFree?: SectionTryUnlimited;

  @Field(() => SectionDidYouKnow, { nullable: true })
  sectionDidYouKnow?: SectionDidYouKnow;

  @Field(() => FinanciallySmartGenerationTitle, { nullable: true })
  contentTitle?: FinanciallySmartGenerationTitle;

  @Field(() => ContentDescription, { nullable: true })
  contentDescription?: ContentDescription;

  @Field(() => HeaderNotify, { nullable: true })
  headerNotify?: HeaderNotify;
}
