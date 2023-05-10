import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { LoggedUser } from '../auth/passport/auth.type';
import * as moment from 'moment';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Parent, ParentDocument } from '../database/schema/parent.schema';
import { Connection, Model, Types } from 'mongoose';
import { Kid, KidDocument } from '../database/schema/kid.schema';
import { User } from '../database/schema/user.schema';
import { EnrollHistory } from '../database/schema/enrollHistory.schema';
import { Constant } from '../database/schema/constant.schema';
import { getDayNameInWeek } from 'src/common/utils';
import { Status, UserRole } from 'src/common/enum';
import { CurriculumLevel } from '../database/schema/curriculumLevel.schema';
import { CurriculumLevelTracking } from '../database/schema/curriculumLevelTracking.schema';
import {
  CurriculumLessonTracking,
  CurriculumLessonTrackingDocument,
} from '../database/schema/curriculumLessonsTracking.schema';
import { CurriculumLesson, CurriculumLessonDocument } from '../database/schema/curriculumLesson.schema';
import { LearningService } from '../learning/learning.service';
import { DynamicError } from 'src/common/error';

@Injectable()
export class KidService {
  constructor(
    @InjectModel(Parent.name) private readonly parentModel: Model<Parent>,
    @InjectModel(Kid.name) private readonly kidModel: Model<Kid>,
    @InjectModel(User.name)
    private readonly userModel: Model<User> & typeof User,
    @InjectModel(Constant.name) private readonly constantModel: Model<Constant>,

    @InjectModel(CurriculumLevel.name)
    private readonly curriculumLevelModel: Model<CurriculumLevel>,

    @InjectModel(CurriculumLevelTracking.name)
    private readonly curriculumLevelTrackingModel: Model<CurriculumLevelTracking>,

    @InjectModel(CurriculumLesson.name)
    private readonly curriculumLessonModel: Model<CurriculumLesson>,

    @InjectModel(CurriculumLessonTracking.name)
    private readonly curriculumLessonTrackingModel: Model<CurriculumLessonTracking>,

    @InjectModel(EnrollHistory.name)
    private readonly enrollHistoryModel: Model<EnrollHistory>,

    @InjectConnection() private readonly connection: Connection,

    private readonly learningService: LearningService,
  ) {}

  async kidsByManager({ user, i18n }: { user: LoggedUser; i18n: I18nContext }) {
    try {
      let manager: ParentDocument;
      switch (user.role) {
        case 'parent': {
          manager = await this.parentModel.findOne({ userId: user.id });
          break;
        }
        default:
          break;
      }

      if (!manager) {
        throw new Error('user not exist');
      }

      const kidIds = manager.kidIds;

      const kids = await this.kidModel
        .find({
          _id: {
            $in: kidIds,
          },
        })
        .lean();

      if (kids.length === 0) {
        return {
          childs: [],
          activeFor: null,
        };
      }

      const childs = await Promise.all(
        kids.map(async (kid) => {
          const kidUser = await this.userModel.findById(kid.userId);

          return {
            ...kid,
            birthday: moment(kid.birthday).format('YYYY-MM-DD'),
            username: kidUser?.username,
          };
        }),
      );

      const activeKid = childs.find((kid) => kid._id.toString() === manager.watchingKidId.toString());

      const enrollHistory = await this.enrollHistoryModel.findOne({
        parentId: manager._id,
        kidId: manager.watchingKidId,
      });
      const isRecurring = enrollHistory ? enrollHistory.isRecurring : 0;

      const result = {
        childs,
        activeFor: {
          _id: manager.watchingKidId,
          memberType: activeKid?.memberType,
          isEnroll: activeKid?.memberType ? 1 : 0,
          isRecurring,
          enrollExpireTime: enrollHistory ? moment(enrollHistory.expireTime).format('YYYY-MM-DD') : null,
          info: {
            name: activeKid?.name,
            avatar: activeKid?.avatar,
            gender: activeKid?.gender,
            birthday: activeKid?.birthday,
            username: activeKid?.username,
          },
        },
      };

      return result;
    } catch (error) {
      console.log(error.message);
      throw new DynamicError(error);
    }
  }

  async dailyInspiring({ loggedUser, i18n }: { loggedUser: LoggedUser; i18n: I18nContext }) {
    try {
      const dailyInspiring = await this.constantModel.findOne({
        key: 'kidDailyInspiring',
      });
      if (!dailyInspiring) {
        return [];
      }

      const { value } = dailyInspiring;

      if (!value.length) {
        return [];
      }

      const randomInt = Math.floor(Math.random() * (value.length - 0 + 1)) + 0;

      const newMess = value.slice(0, randomInt);

      value.splice(0, randomInt);

      const messAfter = [...value, ...newMess];

      return messAfter;
    } catch (error) {
      console.log(error.message);
      throw new DynamicError(error);
    }
  }

  async getLeaderBoard({ limit = 10 }: { limit?: number }) {
    const children = await this.kidModel
      .find({ isDeleted: false, balance: { $gte: 0 } })
      .sort({ balance: -1 })
      .limit(limit)
      .lean();

    const leaderBoard = children.map((child) => ({
      childId: child._id,
      balance: child.balance,
      name: child.name,
      avatar: child.avatar,
    }));

    return leaderBoard;
  }

  async getCurrentLevel({ kidId }: { kidId: Types.ObjectId }) {
    const levelTracking = await this.curriculumLevelTrackingModel.findOne({
      kidId,
      status: 'inProgress',
    });

    if (!levelTracking) {
      const firstLevel = (await this.curriculumLevelModel.find({}, null, { sort: { order: 1 }, limit: 1 }).lean())[0];
      return firstLevel;
    }

    const currentLevel = await this.curriculumLevelModel.findOne({ _id: levelTracking.curriculumLevelId }).lean();
    return currentLevel;
  }

  async getTotalEarned({ kid }: { kid: KidDocument }) {
    const lessonTrackings = await this.curriculumLessonTrackingModel.find({
      kidId: kid._id,
      $or: [{ status: 'completed' }, { status: 'inProgress' }],
    });

    if (!lessonTrackings) {
      return 0;
    }

    const totalEarned = lessonTrackings.reduce((accumulator, lessonTracking) => {
      const introductionEarned = lessonTracking.introduction.earned || 0;
      const storyEarned = lessonTracking.story.earned || 0;
      const gameEarned = lessonTracking.game.earned || 0;
      const questionEarned =
        lessonTracking.questions?.reduce(
          (accumulator, questionTracking) => accumulator + (questionTracking.earned || 0),
          0,
        ) || 0;

      return accumulator + introductionEarned + storyEarned + gameEarned + questionEarned;
    }, 0);

    return totalEarned;
  }

  async learningDashboard({ loggedUser, i18n }: { loggedUser: LoggedUser; i18n: I18nContext }) {
    try {
      let kid: KidDocument;
      if (loggedUser.role === UserRole.KID) {
        kid = await this.kidModel.findOne({ userId: loggedUser.id });
      } else {
        const parent = await this.parentModel.findOne({
          userId: loggedUser.id,
        });
        kid = await this.kidModel.findById(parent.watchingKidId);
      }

      const levels = await this.curriculumLevelModel.find({}, null, { sort: { order: 1 } }).lean();

      const leaderBoard = await this.getLeaderBoard({
        limit: 10,
      });

      let currentLevel;
      const availableLevels = [];

      if (!kid) {
        currentLevel = levels[0];
      } else {
        currentLevel = await this.getCurrentLevel({ kidId: kid._id });
      }

      const currentLevelOrder = currentLevel.order;

      for (const i in levels) {
        if (levels[i].order <= currentLevelOrder) {
          //temporary allow to access all level for demo
          availableLevels.push(levels[i].key);
        }
      }

      const summary = {
        earning: !!kid ? await this.getTotalEarned({ kid }) : 0,
        dayInTraining: 0,
        completedLessons: !!kid
          ? await this.curriculumLessonTrackingModel.countDocuments({
              kidId: kid._id,
              status: 'completed',
            })
          : 0,
      };

      const earningDetails = {
        balance: kid?.balance || 0,
        investments: {
          rate: kid?.asset?.investment?.ratio || 30,
          balance: kid?.asset?.investment?.balance || 0,
        },
        spending: {
          rate: kid?.asset?.spending?.ratio || 60,
          balance: kid?.asset?.spending?.balance || 0,
        },
        sharing: {
          rate: kid?.asset?.sharing?.ratio || 10,
          balance: kid?.asset?.sharing?.balance || 0,
        },
      };

      const weeklyActivities = [
        {
          shortDay: getDayNameInWeek(1),
          value: 2,
          timeName: '2h',
          dateName: moment().startOf('isoWeek').format('D MMM YYYY'),
        },
        {
          shortDay: getDayNameInWeek(2),
          value: 1,
          timeName: '1h',
          dateName: moment().startOf('isoWeek').add('days', 1).format('D MMM YYYY'),
        },
        {
          shortDay: getDayNameInWeek(3),
          value: 1.5,
          timeName: '1h 30 min',
          dateName: moment().startOf('isoWeek').add('days', 2).format('D MMM YYYY'),
        },
        {
          shortDay: getDayNameInWeek(4),
          value: 0,
          timeName: '',
          dateName: moment().startOf('isoWeek').add('days', 3).format('D MMM YYYY'),
        },
        {
          shortDay: getDayNameInWeek(5),
          value: 3,
          timeName: '3h',
          dateName: moment().startOf('isoWeek').add('days', 4).format('D MMM YYYY'),
        },
        {
          shortDay: getDayNameInWeek(6),
          value: 195 / 60,
          timeName: '3h 15 min',
          dateName: moment().startOf('isoWeek').add('days', 5).format('D MMM YYYY'),
        },
        {
          shortDay: getDayNameInWeek(7),
          value: 75 / 60,
          timeName: '1h 15 min',
          dateName: moment().startOf('isoWeek').add('days', 6).format('D MMM YYYY'),
        },
      ];

      const result = {
        currentLevel: currentLevel.key,
        availableLevels: availableLevels,
        levels: levels,
        leaderBoard: leaderBoard,
        summary: summary,
        earningDetails: earningDetails,
        weeklyActivities: weeklyActivities,
      };
      return result;
    } catch (ex) {
      console.log(ex.message);
      throw new DynamicError(ex);
    }
  }

  isCurrentLevel(levelTrackingInfos, currentLevelId) {
    let isCurrentLevel = false;

    for (let index = 0; index < levelTrackingInfos.length; index++) {
      const levelTrackingInfo = levelTrackingInfos[index];
      const previousLevel = levelTrackingInfos[index - 1];

      if (levelTrackingInfo._id.toString() === currentLevelId) {
        if (levelTrackingInfo.status === Status.INPROGRESS) {
          isCurrentLevel = true;
          return isCurrentLevel;
        }

        if (!previousLevel || previousLevel.status === Status.COMPLETED) {
          isCurrentLevel = true;
          return isCurrentLevel;
        }
      }
    }
    return isCurrentLevel;
  }

  async listLessons({
    loggedUser,
    i18n,
    level,
    levelId,
  }: {
    loggedUser: LoggedUser;
    i18n: I18nContext;
    level: string;
    levelId?: string;
  }) {
    const levelKey = level;

    const levelDoc = await this.curriculumLevelModel.findOne({
      $or: [{ _id: levelId }, { key: levelKey }],
    });

    if (!levelDoc) {
      throw new Error(i18n.t('error.levelNotFound'));
    }

    levelId = levelDoc.id;

    const result = [];

    try {
      let forChildId: Types.ObjectId;

      switch (loggedUser.role) {
        case 'parent': {
          const parent = await this.parentModel.findOne({
            userId: loggedUser.id,
          });
          forChildId = parent.watchingKidId;
          break;
        }
        case 'kid': {
          const kid = await this.kidModel.findOne({ userId: loggedUser.id });
          forChildId = kid._id;
          break;
        }

        default:
          break;
      }

      const [levels, levelTrackings, lessons] = await Promise.all([
        this.curriculumLevelModel.find().sort({ order: 1 }),
        this.curriculumLevelTrackingModel.find({
          kidId: forChildId,
        }),
        this.curriculumLessonModel
          .find({
            curriculumLevelId: levelId,
          })
          .sort({ order: 1 }),
      ]);

      const lessonIds = lessons.map((lesson) => lesson._id);

      const lessonTrackings = await this.curriculumLessonTrackingModel.find({
        kidId: forChildId,
        curriculumLessonId: { $in: lessonIds },
      });

      const levelTrackingInfos = levels.map((level) => {
        const levelTracking = levelTrackings.find((item) => item.curriculumLevelId.toString() === level.toString());

        return {
          _id: level._id,
          key: level.key,
          name: level.name,
          order: level.order,
          certificateImage: level.certificateImage,
          lessonIds: level.lessonIds,
          status: levelTracking?.status,
        };
      });

      const isCurrentLevel = this.isCurrentLevel(levelTrackingInfos, levelId);

      if (!isCurrentLevel) {
        for (let index = 0; index < lessons.length; index++) {
          const lesson = lessons[index];
          const lessonTracking = lessonTrackings.find(
            (item) => item.curriculumLessonId.toString() === lesson._id.toString(),
          );

          result.push({
            _id: lesson._id,
            name: lesson.name,
            status: lessonTracking?.status || Status.UPCOMING,
            order: lesson.order,
            level: levelId,
          });
        }
      } else {
        if (lessonTrackings.length > 0) {
          let completedIndex: number;
          // get status from tracking
          for (let index = 0; index < lessons.length; index++) {
            const lesson = lessons[index];
            const lessonTracking = lessonTrackings.find(
              (item) => item.curriculumLessonId.toString() === lesson._id.toString(),
            );

            result.push({
              _id: lesson._id,
              name: lesson.name,
              status: lessonTracking?.status || (index === completedIndex + 1 ? Status.INPROGRESS : Status.UPCOMING),
              order: lesson.order,
              level: levelId,
            });

            if (!!lessonTracking && lessonTracking.status === Status.COMPLETED) {
              completedIndex = index;
            }
          }
        } else {
          // mark first lesson status is inProgress
          result.push({
            _id: lessons[0]._id,
            name: lessons[0].name,
            status: Status.INPROGRESS,
            order: lessons[0].order,
            level: levelId,
          });

          for (let index = 1; index < lessons.length; index++) {
            const lesson = lessons[index];

            result.push({
              _id: lesson._id,
              name: lesson.name,
              status: Status.UPCOMING,
              order: lesson.order,
              level: levelId,
            });
          }
        }
      }

      return {
        data: result,
      };
    } catch (ex) {
      console.log(ex.message);
      throw new DynamicError(ex);
    }
  }

  getCurrentPart(lessonTracking: CurriculumLessonTrackingDocument) {
    if (lessonTracking.status === Status.COMPLETED || lessonTracking.introduction.status === Status.INPROGRESS) {
      return 'introduction';
    }

    if (lessonTracking.questions.some((question) => question.status === Status.INPROGRESS)) {
      return 'question';
    }

    if (lessonTracking.story.status === Status.INPROGRESS) {
      return 'story';
    }

    if (lessonTracking.game.status === Status.INPROGRESS) {
      return 'game';
    }

    return '';
  }

  async combineLessonAndTracking({
    lesson,
    lessonTracking,
  }: {
    lesson: CurriculumLessonDocument;
    lessonTracking: CurriculumLessonTrackingDocument;
  }) {
    const lessonInfo = {
      _id: lesson._id,
      name: lesson.name,
      value: lesson.value,
      curriculumLevelId: lesson.curriculumLevelId,
      order: lesson.order,
      status: lessonTracking.status,
      introduction: {
        src: lesson.introduction.src,
        earning: lesson.introduction.earning,
        status: lessonTracking.introduction?.status,
        earned: lessonTracking.introduction?.earned,
      },
      story: {
        src: lesson.story.src,
        earning: lesson.story.earning,
        status: lessonTracking.story?.status,
        earned: lessonTracking.story?.earned,
      },
      game: {
        src: lesson.game.src,
        earning: lesson.game.earning,
        status: lessonTracking.game?.status,
        earned: lessonTracking.game?.earned,
      },
      questions: [],
      currentPart: '',
    };

    const questionTrackings = lessonTracking.questions;

    lessonInfo.questions = lesson.questions.map((question) => {
      const questionTracking = questionTrackings.find(
        (questionTracking) => questionTracking.questionId.toString() === question._id.toString(),
      );

      return {
        _id: question._id,
        question: question.question,
        earning: question.earning,
        order: question.order,
        answers: question.answers,
        earned: questionTracking?.earned,
        answerKey: questionTracking?.answerKey,
        status: questionTracking?.status,
      };
    });

    const currentPart = this.getCurrentPart(lessonTracking);

    lessonInfo.currentPart = currentPart;

    return lessonInfo;
  }

  async kidLessonInfo({ loggedUser, i18n, lessonId }: { loggedUser: LoggedUser; i18n: I18nContext; lessonId: string }) {
    const session = await this.connection.startSession();

    try {
      session.startTransaction();
      const kid = await this.kidModel.findOne({ userId: loggedUser.id });
      if (!kid) {
        throw new Error(i18n.t('error.errorUserExist'));
      }

      const { lesson, lessonTracking } = await this.learningService.verifyAccessLessonAndGetLessonAndLessonTracking({
        i18n,
        lessonId: new Types.ObjectId(lessonId),
        kid,
        session,
      });

      const lessonInfo = this.combineLessonAndTracking({
        lesson,
        lessonTracking,
      });

      await session.commitTransaction();

      return await lessonInfo;
    } catch (error) {
      console.log(error.message);
      await session.abortTransaction();
      throw new DynamicError(error);
    } finally {
      await session.endSession();
    }
  }

  async changePasswordByManager({
    i18n,
    loggedUser,
    newPassword,
    kidId,
  }: {
    i18n: I18nContext;
    loggedUser: LoggedUser;
    newPassword: string;
    kidId: string;
  }) {
    try {
      const parent = await this.parentModel.findOne({ user: loggedUser.id });

      const kid = await this.kidModel.findOne({ _id: kidId }).select('+hashPassword +salt');

      if (!kid) {
        throw new BadRequestException(i18n.t('error.kidNotFound'));
      }

      if (kid.parentId.toString() !== parent._id.toString()) {
        throw new Error(i18n.t('error.UnauthorizedAccess'));
      }

      const kidUser = await this.userModel.findById(kid.userId).select('+hashPassword +salt');

      kidUser.password = newPassword;

      await kidUser.save();

      return {
        isUpdated: true,
      };
    } catch (ex) {
      throw new DynamicError(ex);
    }
  }

  async update({
    i18n,
    loggedUser,
    name,
    kidId,
    birthday,
    password,
    avatar,
  }: {
    i18n: I18nContext;
    loggedUser: LoggedUser;
    kidId: string;
    name?: string;
    birthday?: string;
    password?: string;
    avatar?: string;
  }) {
    let child: KidDocument;
    const parent = await this.parentModel.findOne({ userId: loggedUser.id });

    try {
      child = await this.kidModel.findOne({
        _id: kidId,
        parentId: parent._id,
      });

      if (!child) {
        throw new Error(i18n.t('error.kidNotFound'));
      }

      if (name) {
        child.name = name;
      }

      if (birthday) {
        child.birthday = new Date(birthday);
      }

      if (avatar) {
        child.avatar = avatar;
      }

      const kidUser = await this.userModel.findById(child.userId).select('+hashPassword +salt ');

      if (password) {
        kidUser.password = password;
      }

      await kidUser.save();
      await child.save();

      return {
        _id: child._id,
        name: child.name,
        avatar: child.avatar,
        status: kidUser.status,
        username: kidUser.username,
        birthday: moment(child.birthday).format('YYYY-MM-DD'),
      };
    } catch (err) {
      console.log(err.message);
      throw new DynamicError(err);
    }
  }

  async delete({ kidId, i18n, loggedUser }: { i18n: I18nContext; loggedUser: LoggedUser; kidId: string }) {
    let child: KidDocument;
    const parent = await this.parentModel.findOne({ userId: loggedUser.id });
    const session = await this.connection.startSession();

    try {
      session.startTransaction();
      child = await this.kidModel.findOne({ _id: kidId, parentId: parent._id }).session(session);

      if (!child) {
        throw new Error(i18n.t('error.kidNotFound'));
      }

      if (child.memberType) {
        throw new Error('Can not delete subscription child');
      }

      await this.userModel.deleteOne({ _id: child.userId }).session(session);

      await this.kidModel.deleteOne({ _id: child._id }).session(session);

      parent.kidIds = parent.kidIds.filter((kidId) => kidId.toString() !== child._id.toString());

      parent.watchingKidId = parent.kidIds[0];

      await parent.save({ session });
      await session.commitTransaction();

      return {
        success: 1,
      };
    } catch (err) {
      console.log(err.message);
      await session.abortTransaction();
      throw new DynamicError(err);
    } finally {
      await session.endSession();
    }
  }

  async create({
    i18n,
    loggedUser,
    name,
    birthday,
    username,
    password,
    avatar,
  }: {
    i18n: I18nContext;
    loggedUser: LoggedUser;
    name: string;
    birthday: string;
    username: string;
    password: string;
    avatar?: string;
  }) {
    let child: KidDocument;
    // const loggedUser = await this.users.getInfo(user, db);

    const parent = await this.parentModel.findOne({ userId: loggedUser.id });
    const birthdayMoment = moment(birthday);
    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      const checkUsername = await this.userModel.checkUsernameUnique(username);

      if (!checkUsername) {
        throw new Error(i18n.t('error.errorChildUsernameExist'));
      }

      // create user for kid
      const userData = {
        username: username,
        password: password,
        status: 'active',
        role: UserRole.KID,
      };

      const userKid = await new this.userModel({
        ...userData,
        createdBy: parent.userId,
        createdByUserType: UserRole.PARENT,
      }).save({ session });

      // create kid
      const childData = {
        parentId: parent._id,
        name: name,
        gender: '3',
        birthday: birthdayMoment,
        userId: userKid._id,
        avatar: avatar,
      };

      child = await new this.kidModel({
        ...childData,
        createdBy: parent.userId,
        createdByUserType: UserRole.PARENT,
      }).save({ session });

      await this.parentModel.findOneAndUpdate(
        {
          _id: parent._id,
        },
        {
          $addToSet: {
            kidIds: child._id,
          },
          watchingKidId: child._id,
        },
        { session },
      );

      await session.commitTransaction();

      return {
        _id: child._id,
        name: child.name,
        avatar: child.avatar,
        status: userKid.status,
        username: userKid.username,
        birthday: moment(child.birthday).format('YYYY-MM-DD'),
      };
    } catch (err) {
      await session.abortTransaction();
      console.log(err.message);
      throw new DynamicError(err);
    } finally {
      await session.endSession();
    }
  }
}
