import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsersDocument = HydratedDocument<Users>;


@Schema({
    collection: 'users',
    timestamps: true
})
export class Users {

  @Prop({required: true})
  email: string | undefined;

  @Prop({required: true})
  phoneNumber: string | undefined;

}



export const UserSchema = SchemaFactory.createForClass(Users);