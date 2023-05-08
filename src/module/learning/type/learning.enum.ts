import { registerEnumType } from '@nestjs/graphql';

export enum SubmitLessonEnum {
  introduction = 'introduction',
  story = 'story',
  question = 'question',
  game = 'game',
}

registerEnumType(SubmitLessonEnum, {
  name: 'SubmitLessonEnum',
  description: 'Submit Lesson Types',
});
