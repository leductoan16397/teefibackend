import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Constant } from '../database/schema/constant.schema';
import { Model } from 'mongoose';
import { detectCountryViaIP } from 'src/common/clientHelper';
import { Membership } from '../database/schema/membership.schema';
import { MEMBER_TYPE } from 'src/common/constant';
import { convertAmountVNDByCurrency, formatMoneyVN } from 'src/common/utils';
import { DynamicError } from 'src/common/error';

@Injectable()
export class HomeService {
  constructor(
    @InjectModel(Constant.name) private readonly constantModel: Model<Constant>,
    @InjectModel(Membership.name)
    private readonly membershipModel: Model<Membership>,
  ) {}

  async landingPageData() {
    try {
      let result = {
        seoMeta: {
          title: 'Financial Education for Teens 7-18',
          description:
            "Investing in your teen's financial literacy today will create a legacy of financial independence for their future",
          ogImage: 'https://d2csac8bc0t9gj.cloudfront.net/publics/home/home-thumb.jpg',
        },
        sectionGalleries: {},
        sectionPrivatePlan: [],
        sectionFinanciallySmartGeneration: {},
        contentTitle: {
          value: '',
          highlight: [],
        },
        contentDescription: {
          value: '',
          isEnable: 0,
        },
        headerNotify: {
          isEnable: 0,
          value: '',
          actionTxt: '',
        },
        mailCollectionTxt: '',
      };

      const list = await this.constantModel
        .find({
          $or: [{ key: 'homeSections' }, { key: 'homeDynamic' }],
        })
        .lean();

      if (list) {
        for (const i in list) {
          switch (list[i].key) {
            case 'homeSections':
              const homeSections = list[i].value;

              for (const section in homeSections) {
                switch (section) {
                  case 'sectionTryUnlimitedForFree':
                    const privatePlan = await this.privatePlan({});

                    result[section] = {
                      ...homeSections[section],
                      ...{
                        data: privatePlan['commitmentLevel'],
                      },
                    };
                    break;
                  default:
                    result[section] = homeSections[section];
                    break;
                }
              }
              break;

            case 'homeDynamic':
              const data = list[i].value;
              result = {
                ...result,
                ...{
                  contentTitle: data.contentTitle,
                  contentDescription: data.contentDescription,
                  headerNotify: data.headerNotify,
                  mailCollectionTxt: data.mailCollectionTxt,
                  slogan: data.slogan,
                  elearningImg: data.elearningImg,
                },
              };
              break;
          }
        }
      }

      result['sectionOurClientSay'] = {
        title: 'What Our Client Says?',
        content: 'Our mission is to help at least 10 million teens master financial education',
        data: [
          {
            content:
              "Teefi has been a game changer for my teenager's financial education. The interactive lessons are engaging and easy to follow, and my child now has a better understanding of budgeting, saving, and investing. I highly recommend Teefi to any parent looking to give their teen the tools they need to succeed in the real world.",
            image: 'https://d2csac8bc0t9gj.cloudfront.net/publics/home/Emily Johnson.png',
            name: 'Emily Johnson',
          },
          {
            content:
              "As a busy parent, I don't always have the time to teach my teen about personal finance. That's why I'm grateful for Teefi - it's like having a personal finance tutor for my child. The platform is user-friendly and offers a variety of topics that are relevant to teenagers today. I've already noticed a positive change in my child's financial habits since they started using Teefi.",
            image: 'https://d2csac8bc0t9gj.cloudfront.net/publics/home/Sarah Patel.png',
            name: 'Sarah Patel',
          },
          {
            content:
              "Teefi has exceeded my expectations. My teenager is learning about money management in a fun and engaging way, and they're developing valuable skills that will benefit them for years to come. I appreciate how Teefi empowers teens to take control of their financial future and make smart decisions. Thank you, Teefi!",
            image: 'https://d2csac8bc0t9gj.cloudfront.net/publics/home/James Rodriguez.png',
            name: 'James Rodriguez',
          },
          {
            content:
              "As a parent, I'm always looking for ways to help my children learn about finances and develop good money habits. That's why I was so impressed with TeeFi's financial education curriculum for kids and teens. The lessons are engaging and interactive, with a mix of quizzes, stories, and games that keep my kids interested and motivated to learn. I've seen a noticeable improvement in their understanding of money concepts and their ability to manage their own finances since we started using TeeFi. The platform is also user-friendly and easy to navigate, which has made it a stress-free experience for me as a parent. I highly recommend TeeFi to any parents looking for a fun and effective way to teach their kids about finances.",
            image: 'https://d2csac8bc0t9gj.cloudfront.net/publics/home/James.jpg',
            name: 'Michael Chen',
          },
        ],
      };

      return result;
    } catch (err) {
      throw new DynamicError(err);
    }
  }

  async privatePlan(params: { clientIp?: string; switchToStandardCurrency?: number | string }) {
    const result = {
      commitmentLevel: [],
      isStandardCurrency: 1,
    };

    const memberships = await this.membershipModel.find({}).lean();

    let totalDiscount: string | number;

    let rate = 1;

    let countryCurrency = detectCountryViaIP(params.clientIp);
    if (countryCurrency == 'vn') {
      result.isStandardCurrency = 0;
    }

    if (params.switchToStandardCurrency == 1) {
      countryCurrency = 'us';
    }

    const currencyExchange = await this.constantModel.findOne({ key: 'currencyExchange' }).lean();

    let billInfo = 'Billed Monthly';

    let price: string,
      totalPrice: string,
      defPrice = 0;

    switch (countryCurrency) {
      case 'vn':
        rate = currencyExchange.value.$_to_vnd;

        for (const i in memberships) {
          if (memberships[i].key == MEMBER_TYPE.yearly) {
            totalDiscount = (((memberships[i].price / 12) * memberships[i].discount) / 100) * 12 * rate;

            defPrice = convertAmountVNDByCurrency(memberships[i].totalPrice, rate, memberships[i].currency);

            totalPrice = `${formatMoneyVN(defPrice)} VND`;

            defPrice = convertAmountVNDByCurrency(memberships[i].price, rate, memberships[i].currency);

            price = `${formatMoneyVN(defPrice)} VND`;

            billInfo = `${totalPrice} Billed Annually`;
          } else {
            defPrice = convertAmountVNDByCurrency(memberships[i].totalPrice, rate, memberships[i].currency);

            price = totalPrice = `${formatMoneyVN(defPrice)} VND`;
          }

          result.commitmentLevel.push({
            key: memberships[i].key,
            name: memberships[i].key,
            price: price,
            totalPrice: totalPrice,
            billInfo: billInfo,
            discount: memberships[i].discount != 0 ? `Save ${memberships[i].discount}%` : '',
            freeTrial: `${memberships[i].freeTrialDays}-Day Free Trial`,
          });
        }
        break;
      default:
        for (const i in memberships) {
          if (memberships[i].key == MEMBER_TYPE.yearly) {
            totalDiscount = ((((memberships[i].price / 12) * memberships[i].discount) / 100) * 12).toFixed(2);

            billInfo = `$${memberships[i].totalPrice} Billed Annually`;
            price = `$${memberships[i].price}`;
            totalPrice = `$${memberships[i].totalPrice}`;
          } else {
            price = totalPrice = `$${memberships[i].totalPrice}`;
          }

          result.commitmentLevel.push({
            key: memberships[i].key,
            name: memberships[i].key,
            totalPrice: totalPrice,
            price: price,
            billInfo: billInfo,
            discount: memberships[i].discount != 0 ? `'Save ${memberships[i].discount}%` : '',
            freeTrial: `${memberships[i].freeTrialDays}-Day Free Trial`,
          });
        }
        break;
    }
    return result;
  }

  async deleteUserReasons() {
    try {
      const initDeleteUserInfo = await this.constantModel
        .findOne({
          key: 'initDeleteUserInfo',
        })
        .lean();
      return {
        reasons: initDeleteUserInfo.value.reasons,
      };
    } catch (ex) {
      console.log(ex.message);
      throw new DynamicError(ex);
    }
  }
}
