import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../database.js";

console.log("Initializing Reminder model");

export type ReminderData = InferAttributes<Reminder, {omit: "id"}>

export class Reminder extends Model<
  InferAttributes<Reminder>,
  InferCreationAttributes<Reminder>
> {
  declare id: CreationOptional<number>;
  declare channelId: string;
  declare target: string;
  declare message: string;
  declare time: number;
  declare createdBy: string;
}

Reminder.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    channelId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    target: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    time: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize },
);
