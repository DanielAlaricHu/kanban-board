import { configureStore } from '@reduxjs/toolkit';
import columnsReducer from '../features/columnsSlice';

const store = configureStore({
  reducer: {
    columns: columnsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;