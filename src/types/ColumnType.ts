import { TaskType } from './TaskType';

export type ColumnType = {
  id: string;
  order: number;
  name: string;
  themeColor: string;
  tasks: TaskType[]; 
};

export interface EditableColumnType extends ColumnType {
  isChanged: boolean;
}