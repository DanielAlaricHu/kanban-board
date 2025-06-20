import { doc, setDoc, getDoc, updateDoc, arrayRemove, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { firestore } from './firebaseConfig';
// Custom types
import { TaskType } from '../types/TaskType';
import { ColumnType } from '../types/ColumnType';

// --------------------------------------------------------------
// Tasks related 

export const addTaskToFirestore = async (uid: string, columnId: string, task: TaskType) => {
  try {
    const columnRef = doc(firestore, `users/${uid}/columns/${columnId}`);
    const columnSnapshot = await getDoc(columnRef);

    if (columnSnapshot.exists()) {
      const columnData = columnSnapshot.data();
      // Append new task to existing array
      const updatedTasks = [...(columnData.tasks || []), task]; 

      await updateDoc(columnRef, { tasks: updatedTasks });
    } else {
      throw new Error(`Column with ID ${columnId} does not exist.`);
    }
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

export const deleteTaskFromFirestore = async (uid: string, columnId: string, taskId: string) => {
  try {
    const columnRef = doc(firestore, `users/${uid}/columns/${columnId}`);
    const columnSnapshot = await getDoc(columnRef);

    if (!columnSnapshot.exists()) {
      throw new Error(`Column with ID ${columnId} does not exist.`);
    }

    const columnData = columnSnapshot.data();
    const taskToRemove = columnData.tasks.find((task: any) => task.id === taskId);

    if (!taskToRemove) {
      throw new Error(`Task with ID ${taskId} does not exist.`);
    }

    // arrayRemove is a utility function from Firestore
    // to remove element from an array field
    await updateDoc(columnRef, {
      tasks: arrayRemove(taskToRemove), 
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const updateTaskInFirestore = async (uid: string, columnId: string, task: TaskType) => {
  try {
    const columnRef = doc(firestore, `users/${uid}/columns/${columnId}`);
    const columnSnapshot = await getDoc(columnRef);

    if (columnSnapshot.exists()) {
      const columnData = columnSnapshot.data();
      const existingTasks = columnData.tasks || [];
      const taskIndex = existingTasks.findIndex((existingTask: any) => existingTask.id === task.id);

      if (taskIndex !== -1) {
        existingTasks[taskIndex] = task;
        await updateDoc(columnRef, { tasks: existingTasks });
      } else {
        throw new Error(`Task with ID ${task.id} does not exist.`);
      }
    } else {
      throw new Error(`Column with ID ${columnId} does not exist.`);
    }
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const moveTaskBetweenColumns = async (
  uid: string,
  sourceColumnId: string,
  targetColumnId: string,
  taskId: string
) => {
  try {
    // Get the source column document
    const sourceColumnRef = doc(firestore, `users/${uid}/columns/${sourceColumnId}`);
    const sourceColumnSnapshot = await getDoc(sourceColumnRef);

    if (!sourceColumnSnapshot.exists()) {
      throw new Error(`Source column with ID ${sourceColumnId} does not exist.`);
    }

    const sourceColumnData = sourceColumnSnapshot.data();
    const taskToMove = sourceColumnData.tasks.find((task: any) => task.id === taskId);

    if (!taskToMove) {
      throw new Error(`Task with ID ${taskId} does not exist in source column.`);
    }

    // Remove the task from the source column
    await updateDoc(sourceColumnRef, {
      tasks: arrayRemove(taskToMove),
    });

    // Get the target column document
    const targetColumnRef = doc(firestore, `users/${uid}/columns/${targetColumnId}`);
    const targetColumnSnapshot = await getDoc(targetColumnRef);

    if (!targetColumnSnapshot.exists()) {
      throw new Error(`Target column with ID ${targetColumnId} does not exist.`);
    }

    const targetColumnData = targetColumnSnapshot.data();
    const updatedTasks = [...(targetColumnData.tasks || []), taskToMove];

    // Add the task to the target column
    await updateDoc(targetColumnRef, {
      tasks: updatedTasks,
    });
  } catch (error) {
    console.error('Error moving task between columns:', error);
    throw error;
  }
};

// --------------------------------------------------------------
// Columns related

export const addColumnToFirestore = async (userId: string, columnId: string, columnData: ColumnType) => {
  try {
    const columnRef = doc(firestore, `users/${userId}/columns/${columnId}`);
    await setDoc(columnRef, columnData);
  } catch (error) {
    console.error('Error adding column to Firestore:', error);
    throw error;
  }
};

export const deleteColumnFromFirestore = async (userId: string, columnId: string) => {
  try {
    // Delete all tasks in the column
    const tasksCollection = collection(firestore, `users/${userId}/columns/${columnId}/tasks`);
    const tasksSnapshot = await getDocs(tasksCollection);
    const deletePromises = tasksSnapshot.docs.map((taskDoc) => deleteDoc(taskDoc.ref));
    await Promise.all(deletePromises);

    // Delete the column itself
    const columnDoc = doc(firestore, `users/${userId}/columns/${columnId}`);
    await deleteDoc(columnDoc);
  } catch (error) {
    console.error('Error deleting column from Firestore:', error);
    throw error;
  }
};

export const updateColumnInFirestore = async (
  uid: string,
  columnId: string,
  name: string,
  order: number,
  themeColor: string
) => {
  try {
    const columnRef = doc(firestore, `users/${uid}/columns/${columnId}`);
    const columnSnapshot = await getDoc(columnRef);

    if (!columnSnapshot.exists()) {
      throw new Error(`Column with ID ${columnId} does not exist.`);
    }

    await updateDoc(columnRef, { name, themeColor, order });
  } catch (error) {
    console.error('Error updating column in Firestore:', error);
    throw error;
  }
};