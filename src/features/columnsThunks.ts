import { collection, doc, getDoc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { setColumns } from './columnsSlice';
import { firestore } from '../firebase/firebaseConfig';
import { addColumnToFirestore, addTaskToFirestore } from '../firebase/firestoreUtils';
import { v4 as uuidv4 } from 'uuid';

const defaultColumns = [
  {
    name: 'To Do',
    themeColor: '#AEC6CF', // Pastel blue
    tasks: [
      { name: 'Pick up Angel from work' },
    ],
    order: 1,
  },
  {
    name: 'Doing',
    themeColor: '#77DD77', // Pastel green
    tasks: [
      { name: 'Prepare for the pitch' },
    ],
    order: 2,
  },
  {
    name: 'Urgent',
    themeColor: '#FF6961', // Pastel red
    tasks: [
      { name: 'Withdraw the bond' },
    ],
    order: 3,
  },
];

let isFetchingColumns = false;

export const fetchColumns = (uid: string) => async (dispatch: any) => {
  if (isFetchingColumns) return;
  isFetchingColumns = true;
  
  try {
    const userDocRef = doc(firestore, `users/${uid}`);
    const userDocSnapshot = await getDoc(userDocRef);

    // Check if the user document exists
    // If user document does not exist, assume user is a new user
    // In that case, initialize the columns with default values
    if (!userDocSnapshot.exists()) {
      defaultColumns.forEach(async (column, index) => {
        const columnID = uuidv4(); // Generate a new UUID for the column ID
        await addColumnToFirestore(uid, columnID, {
          id: columnID, 
          name: column.name,
          themeColor: column.themeColor,
          tasks: [],
          order: column.order,
        });

        // Add tasks to the column
        for (const task of column.tasks) {
          await addTaskToFirestore(uid, columnID, {
            id: uuidv4(),     // Generate a new UUID for the task ID
            title: task.name, // Map 'name' to 'title'
            description: '',  // Default empty description
          });
        }
      });

      // Initialize the user document
      await setDoc(userDocRef, { columnCount: defaultColumns.length });
    }

    // Fetch columns from Firestore
    const columnsRef = collection(firestore, `users/${uid}/columns`);
    const columnsQuery = query(columnsRef, orderBy('order'));
    const snapshot = await getDocs(columnsQuery);

    const columns = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Store columns data to redux
    dispatch(setColumns(columns));

    isFetchingColumns = false; 
  } catch (error) {
    console.error('Error fetching columns:', error);
    isFetchingColumns = false; 
  }
};