import { ValidateOpts, ValidatorProps } from 'mongoose';

export const uniqueValidator: ValidateOpts<any> = {
  propsParameter: true,
  validator: async function (value: string, props: ValidatorProps) {
    const filter = {
      [props.path]: value.toString(),
    };
    const count = await this.collection.countDocuments(filter);

    if (count) {
      return false;
    }
    return true;
  },
  message: (props: ValidatorProps) => {
    return `${props.value} already exists!`;
  },
};
