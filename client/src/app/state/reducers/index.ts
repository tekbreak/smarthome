import HomeReducer, { initialState as homeInitialState } from './home';
import { combineReducers } from '@reduxjs/toolkit';

export const initialState = {
  home: homeInitialState,
};

export default combineReducers({ home: HomeReducer });
