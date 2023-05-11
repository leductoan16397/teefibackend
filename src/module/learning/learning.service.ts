import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { LoggedUser } from '../auth/passport/auth.type';
import { I18nContext } from 'nestjs-i18n';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { Parent } from '../database/schema/parent.schema';
import { Kid, KidDocument } from '../database/schema/kid.schema';
import { Certificate } from '../database/schema/certificate.schema';
import { CurriculumLevel, CurriculumLevelDocument } from '../database/schema/curriculumLevel.schema';
import { CurriculumLesson, CurriculumLessonDocument } from '../database/schema/curriculumLesson.schema';
import {
  CurriculumLessonTracking,
  CurriculumLessonTrackingDocument,
  QuestionTracking,
} from '../database/schema/curriculumLessonsTracking.schema';
import { CurriculumLevelTracking } from '../database/schema/curriculumLevelTracking.schema';
import { SubmitLessonEnum } from './type/learning.enum';
import { Status } from 'src/common/enum';
import * as lodash from 'lodash';
import { DynamicError } from 'src/common/error';

@Injectable()
export class LearningService {
  constructor(
    @InjectConnection() private connection: Connection,

    @InjectModel(Parent.name) private readonly parentModel: Model<Parent>,
    @InjectModel(Kid.name) private readonly kidModel: Model<Kid>,

    @InjectModel(Certificate.name)
    private readonly certificateModel: Model<Certificate>,

    @InjectModel(CurriculumLevel.name)
    private readonly curriculumLevelModel: Model<CurriculumLevel>,

    @InjectModel(CurriculumLevelTracking.name)
    private readonly curriculumLevelTrackingModel: Model<CurriculumLevelTracking>,

    @InjectModel(CurriculumLesson.name)
    private readonly curriculumLessonModel: Model<CurriculumLesson>,

    @InjectModel(CurriculumLessonTracking.name)
    private readonly curriculumLessonTrackingModel: Model<CurriculumLessonTracking>,
  ) {}

  async levelCertifications({ loggedUser, i18n }: { loggedUser: LoggedUser; i18n: I18nContext }) {
    try {
      let kidId: Types.ObjectId;

      switch (loggedUser.role) {
        case 'parent': {
          const parent = await this.parentModel.findOne({
            userId: loggedUser.id,
          });
          kidId = parent.watchingKidId;
          break;
        }
        case 'kid': {
          const kid = await this.kidModel.findOne({ userId: loggedUser.id });
          kidId = kid._id;
          break;
        }

        default:
          break;
      }

      const levels = await this.curriculumLevelModel.find();

      const certificates = await this.certificateModel.find({ kidId });

      const levelCertifications = levels.map((level) => {
        const certificate = certificates.find((item) => item.levelId.toString() === level._id.toString());

        let keyName = level.key[0].toUpperCase() + level.key.substring(1);
        keyName = keyName.replace(/([a-z](?=([A-Z]|[0-9])))/g, '$1 ');

        return {
          key: level.key,
          keyName: keyName,
          name: level.name,
          image: level.certificateImage,
          note: certificate ? 'Great Work! You passed all Lessons' : 'You are almost done! Try your best!',
          status: certificate ? 'done' : 'comingSoon',
          fileUrl: certificate?.fileUrl,
        };
      });

      return levelCertifications;
    } catch (error) {
      throw new DynamicError(error);
    }
  }

  async canAccessLevel({
    kid,
    level,
    session,
    i18n,
  }: {
    kid: KidDocument;
    level: CurriculumLevelDocument;
    session?: ClientSession;
    i18n: I18nContext;
  }) {
    if (!level) {
      throw new BadRequestException(i18n.t('error.levelNotFound'));
    }

    if (level.order > 1) {
      const previousLevel = await this.curriculumLevelModel
        .findOne({ order: { $lt: level.order } })
        .sort({ order: -1 })
        .session(session);
      const previousLevelTracking = await this.curriculumLevelTrackingModel
        .findOne({
          kidId: kid._id,
          curriculumLevelId: previousLevel._id,
        })
        .session(session);

      if (!previousLevelTracking || previousLevelTracking.status !== Status.COMPLETED) {
        return false;
      }
    }

    // create level tracking
    const levelTracking = await this.curriculumLevelTrackingModel
      .countDocuments({ kidId: kid._id, curriculumLevelId: level._id })
      .session(session);
    if (!levelTracking) {
      const newLevelTracking = await new this.curriculumLevelTrackingModel({
        status: 'inProgress',
        kidId: kid._id,
        curriculumLevelId: level._id,
      }).save({ session });
      console.log(
        '🚀 ~ file: learning.js:511 ~ learningController ~ canAccessLevel ~ newLevelTracking:',
        newLevelTracking,
      );
    }

    return true;
  }

  async canAccessLesson({
    kid,
    lesson,
    session,
    i18n,
  }: {
    kid: KidDocument;
    lesson: CurriculumLessonDocument;
    session?: ClientSession;
    i18n: I18nContext;
  }) {
    if (!lesson) {
      throw new BadRequestException(i18n.t('error.lessonNotFound'));
    }

    const levelOfLesson = await this.curriculumLevelModel.findById(lesson.curriculumLevelId).session(session);

    const canAccessLevel = await this.canAccessLevel({
      kid,
      level: levelOfLesson,
      session,
      i18n,
    });
    if (!canAccessLevel) {
      return false;
    }

    if (lesson.order > 1) {
      const previousLesson = await this.curriculumLessonModel
        .findOne({
          _id: { $in: levelOfLesson.lessonIds },
          order: { $lt: lesson.order },
        })
        .sort({ order: -1 })
        .session(session);

      const previousLessonTracking = await this.curriculumLessonTrackingModel
        .findOne({
          kidId: kid._id,
          curriculumLessonId: previousLesson?._id,
        })
        .session(session);

      if (!previousLessonTracking || previousLessonTracking.status !== Status.COMPLETED) {
        return false;
      }
    }

    // create lesson tracking
    const lessonTracking = await this.curriculumLessonTrackingModel
      .countDocuments({ kidId: kid._id, curriculumLessonId: lesson._id })
      .session(session);
    if (!lessonTracking) {
      const newLessonTracking = await new this.curriculumLessonTrackingModel({
        status: 'inProgress',
        kidId: kid._id,
        curriculumLessonId: lesson._id,
        questions: lesson.questions.map((item) => ({
          questionId: item._id,
        })),
      }).save({ session });
      console.log(
        '🚀 ~ file: learning.js:550 ~ learningController ~ canAccessLesson ~ newLessonTracking:',
        newLessonTracking,
      );
    }

    return true;
  }

  async verifyAccessLessonAndGetLessonAndLessonTracking({
    lessonId,
    kid,
    session,
    i18n,
  }: {
    i18n: I18nContext;
    lessonId: Types.ObjectId | string;
    kid: KidDocument;
    session?: ClientSession;
  }) {
    const lesson = await this.curriculumLessonModel.findById(lessonId);

    // verify kid can access the lesson or not
    const canAccessLesson = await this.canAccessLesson({
      kid,
      i18n,
      lesson,
      session,
    });

    if (!canAccessLesson) {
      throw new UnauthorizedException(i18n.t('error.UnauthorizedAccess'));
    }

    const lessonTracking = await this.curriculumLessonTrackingModel
      .findOne({
        kidId: kid._id,
        curriculumLessonId: lesson._id,
      })
      .session(session);

    return { lessonTracking, lesson };
  }

  async attackLesson({ i18n, loggedUser, lessonId }: { i18n: I18nContext; loggedUser: LoggedUser; lessonId: string }) {
    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      const kid = await this.kidModel.findOne({ userId: loggedUser.id });
      if (!kid) {
        throw new BadRequestException(i18n.t('error.errorUserExist'));
      }

      await this.verifyAccessLessonAndGetLessonAndLessonTracking({
        lessonId,
        kid,
        session,
        i18n,
      });

      await session.commitTransaction();

      return { created: true };
    } catch (error) {
      console.log(error.message);
      await session.abortTransaction();
      throw new DynamicError(error);
    } finally {
      await session.endSession();
    }
  }

  async increaseKidBalance({ earning, kid, session }: { earning: number; kid: KidDocument; session: ClientSession }) {
    if (!earning || earning === 0 || !lodash.isNumber(earning)) {
      return;
    }

    const balance = kid.balance + earning;

    const investmentBalance = kid.asset.investment.balance + earning * kid.asset.investment.ratio;

    const spendingBalance = kid.asset.spending.balance + earning * kid.asset.spending.ratio;

    const sharingBalance = kid.asset.sharing.balance + earning * kid.asset.sharing.ratio;

    await this.kidModel.updateOne(
      { _id: kid._id },
      {
        balance,
        'asset.investment.balance': investmentBalance,
        'asset.spending.balance': spendingBalance,
        'asset.sharing.balance': sharingBalance,
      },
      { session },
    );
  }

  async submitIntroduction({
    session,
    kid,
    lessonTracking,
    lesson,
  }: {
    session?: ClientSession;
    kid: KidDocument;
    lessonTracking: CurriculumLessonTrackingDocument;
    lesson: CurriculumLessonDocument;
  }) {
    if (lessonTracking.introduction.status === Status.INPROGRESS) {
      // update intro status to completed, add earned
      lessonTracking.introduction.status = Status.COMPLETED;
      lessonTracking.introduction.earned = lesson.introduction.earning;

      // update question 1 to inprogress
      lessonTracking.questions[0].status = Status.INPROGRESS;

      // add money to kid and save status
      await Promise.all([
        this.curriculumLessonTrackingModel.updateOne(
          { _id: lessonTracking._id },
          {
            introduction: lessonTracking.introduction,
            questions: lessonTracking.questions,
          },
          {
            session,
          },
        ),
        this.increaseKidBalance({
          earning: lesson.introduction.earning,
          kid,
          session,
        }),
      ]);

      return {
        earned: lesson.introduction.earning,
        success: true,
      };
    }

    return {
      success: true,
    };
  }

  async submitQuestion({
    i18n,
    session,
    kid,
    lessonTracking,
    lesson,
    questionId,
    answerKey,
  }: {
    i18n: I18nContext;
    session?: ClientSession;
    kid: KidDocument;
    lessonTracking: CurriculumLessonTrackingDocument;
    lesson: CurriculumLessonDocument;
    questionId: string | Types.ObjectId;
    answerKey: string;
  }) {
    if (lessonTracking.introduction.status !== Status.COMPLETED) {
      throw new BadRequestException(i18n.t('error.completePreviousPartFirst'));
    }

    if (!questionId) {
      throw new BadRequestException(i18n.t('error.missingField', { args: { fieldName: 'questionId' } }));
    }

    if (!answerKey) {
      throw new BadRequestException(i18n.t('error.missingField', { args: { fieldName: 'answerKey' } }));
    }

    const { questions } = lesson;

    if (!questions.some((question) => question._id.toString() === questionId)) {
      throw new BadRequestException(i18n.t('error.questionNotFound'));
    }

    const { questions: questionTrackings } = lessonTracking;

    const questionSubmitting = questions.find((question) => question._id.toString() === questionId);

    const questionsSorted = lodash.orderBy(questions, ['order'], ['asc']);

    const previousQuestion = lodash.filter(questionsSorted, (ele) => ele.order < questionSubmitting.order).pop();

    if (
      previousQuestion &&
      questionTrackings.find((ele) => ele.questionId.toString() === previousQuestion._id.toString()).status !=
        Status.COMPLETED
    ) {
      throw new BadRequestException(i18n.t('error.completePreviousQuestionFirst'));
    }

    // the index off questionSubmitting in lesson tracking
    const questionTrackingIndex = questionTrackings.findIndex(
      (questionTracking) => questionTracking.questionId.toString() === questionId,
    );

    let success, earned;

    if (lessonTracking.questions[questionTrackingIndex].status === Status.INPROGRESS) {
      // update story status to completed, add earned
      questionTrackings[questionTrackingIndex].status = Status.COMPLETED;
      questionTrackings[questionTrackingIndex].answerKey = answerKey;
      if (questionSubmitting.rightAnswerKey.toUpperCase().trim() !== answerKey.toUpperCase().trim()) {
        questionTrackings[questionTrackingIndex].earned = 0;
        earned = 0;
        success = false;
      } else {
        questionTrackings[questionTrackingIndex].earned = questions.find(
          (question) => question._id.toString() === questionTrackings[questionTrackingIndex].questionId.toString(),
        ).earning;
        earned = questionTrackings[questionTrackingIndex].earned;
        success = true;
      }

      // next question
      const nextQuestion = lodash.filter(questionsSorted, (ele) => ele.order > questionSubmitting.order).shift();

      let totalEarnedQuiz;
      if (!nextQuestion) {
        // update story to inProgress if questionSubmitting is the end of questions
        lessonTracking.story.status = Status.INPROGRESS;
        totalEarnedQuiz = questionTrackings.reduce((accumulator, currentValue) => accumulator + currentValue.earned, 0);
      } else {
        // update next question to inProgress
        questionTrackings[questionTrackingIndex + 1].status = Status.INPROGRESS;
      }

      // add money to kid and save status
      await Promise.all([
        this.curriculumLessonTrackingModel.updateOne(
          { _id: lessonTracking._id },
          {
            story: lessonTracking.story,
            questions: lessonTracking.questions,
          },
          {
            session,
          },
        ),
        this.increaseKidBalance({
          earning: questionTrackings[questionTrackingIndex].earned,
          kid,
          session,
        }),
      ]);

      const rightAnswerId = questionSubmitting.answers.find(
        (item) => item.key.toUpperCase().trim() === questionSubmitting.rightAnswerKey.toUpperCase().trim(),
      )?._id;

      return {
        rightAnswerKey: questionSubmitting.rightAnswerKey,
        rightAnswerId,
        earned,
        totalEarnedQuiz,
        success,
      };
    }

    if (questionSubmitting.rightAnswerKey.toUpperCase().trim() !== answerKey.toUpperCase().trim()) {
      success = false;
    } else {
      success = true;
    }

    return {
      rightAnswerId: questionSubmitting.answers.find(
        (item) => item.key.toUpperCase().trim() === questionSubmitting.rightAnswerKey.toUpperCase().trim(),
      )?._id,
      rightAnswerKey: questionSubmitting.rightAnswerKey,
      success,
    };
  }

  async submitStory({
    i18n,
    session,
    kid,
    lessonTracking,
    lesson,
  }: {
    i18n: I18nContext;
    session?: ClientSession;
    kid: KidDocument;
    lessonTracking: CurriculumLessonTrackingDocument;
    lesson: CurriculumLessonDocument;
  }) {
    if (lessonTracking.questions.some((question) => question.status !== Status.COMPLETED)) {
      throw new BadRequestException(i18n.t('error.completePreviousPartFirst'));
    }

    if (lessonTracking.story.status === Status.INPROGRESS) {
      // update story status to completed, add earned
      lessonTracking.story.status = Status.COMPLETED;
      lessonTracking.story.earned = lesson.story.earning;

      // update game to inprogress
      lessonTracking.game.status = Status.INPROGRESS;

      // add money to kid and save status
      await Promise.all([
        this.curriculumLessonTrackingModel.updateOne(
          { _id: lessonTracking._id },
          {
            story: lessonTracking.story,
            game: lessonTracking.game,
          },
          {
            session,
          },
        ),
        this.increaseKidBalance({
          earning: lesson.story.earning,
          kid,
          session,
        }),
      ]);

      return {
        earned: lesson.story.earning,
        success: true,
      };
    }

    return {
      success: true,
    };
  }

  async submitGame({ i18n, session, kid, lessonTracking, lesson, score }) {
    if (lessonTracking.story.status !== Status.COMPLETED) {
      throw new BadRequestException(i18n.t('error.completePreviousPartFirst'));
    }

    if (!score) {
      throw new BadRequestException(i18n.t('error.missingField', { fieldName: 'score' }));
    }

    if (lessonTracking.game.status === Status.INPROGRESS) {
      // update game status to completed, add earned
      lessonTracking.game.status = Status.COMPLETED;
      lessonTracking.game.earned = ((lesson.game.earning * score) / 100)?.toFixed(2);

      // update lessonTracking to completed
      lessonTracking.status = Status.COMPLETED;

      // add money to kid and save status
      await Promise.all([
        this.curriculumLessonTrackingModel.updateOne(
          { _id: lessonTracking._id },
          {
            game: lessonTracking.game,
            status: lessonTracking.status,
          },
          {
            session,
          },
        ),
        this.increaseKidBalance({
          earning: lessonTracking.game.earned,
          kid,
          session,
        }),
      ]);

      const { questions: questionTrackings } = lessonTracking;

      const totalEarnedQuiz: number = questionTrackings.reduce(
        (accumulator: number, currentValue: QuestionTracking) => accumulator + currentValue.earned,
        0,
      );
      const totalEarnedLevel =
        totalEarnedQuiz +
        (lessonTracking.introduction.earned || 0) +
        (lessonTracking.story.earned || 0) +
        (lessonTracking.game.earned || 0);

      return {
        earned: lessonTracking.game.earned,
        success: true,
        totalEarnedLevel,
      };
    }

    return {
      success: true,
    };
  }

  async submitLesson({
    i18n,
    loggedUser,
    lessonId,
    type,
    questionId,
    answerKey,
    score,
  }: {
    i18n: I18nContext;
    loggedUser: LoggedUser;
    lessonId: string;
    type: SubmitLessonEnum;
    questionId?: string;
    answerKey?: string;
    score?: number;
  }) {
    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      const kid = await this.kidModel.findOne({ userId: loggedUser.id });
      if (!kid) {
        throw new BadRequestException(i18n.t('error.errorUserExist'));
      }

      const { lesson, lessonTracking } = await this.verifyAccessLessonAndGetLessonAndLessonTracking({
        i18n,
        lessonId,
        kid,
        session,
      });

      let result;
      switch (type) {
        case 'introduction': {
          result = await this.submitIntroduction({
            session,
            lessonTracking,
            kid,
            lesson,
          });
          break;
        }
        case 'question': {
          result = await this.submitQuestion({
            i18n,
            session,
            lessonTracking,
            lesson,
            kid,
            questionId,
            answerKey,
          });
          break;
        }
        case 'story': {
          result = await this.submitStory({
            i18n,
            session,
            lessonTracking,
            kid,
            lesson,
          });
          break;
        }
        case 'game': {
          result = await this.submitGame({
            i18n,
            session,
            lessonTracking,
            kid,
            lesson,
            score,
          });
          break;
        }
      }

      await session.commitTransaction();
      return result;
    } catch (error) {
      console.log(error.message);
      await session.abortTransaction();
      throw new DynamicError(error);
    } finally {
      await session.endSession();
    }
  }
}
