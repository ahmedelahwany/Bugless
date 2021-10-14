import { combineReducers } from "redux";
import * as actionTypes from "../actions/types";

const initialUserState = {
  currentUser: null,
  isLoading: true,
};

const user_reducer = (state = initialUserState, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        currentUser: action.payload.currentUser,
        isLoading: false,
      };
    case actionTypes.CLEAR_USER:
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialIssueState = {
  currentIssue: null,
  isPrivateIssue: false,
  userPosts: null,
  isSectionType: true,
};

const issue_reducer = (state = initialIssueState, action) => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_ISSUE:
      return {
        ...state,
        currentIssue: action.payload.currentIssue,
      };
    case actionTypes.SET_PRIVATE_ISSUE:
      return {
        ...state,
        isPrivateIssue: action.payload.isPrivateIssue,
      };
    case actionTypes.SET_USER_POSTS:
      return {
        ...state,
        userPosts: action.payload.userPosts,
      };
    case actionTypes.SET_SECTION_TYPE:
      return {
        ...state,
        isSectionType: action.payload.isSectionType,
      };
    default:
      return state;
  }
};

const initialProjectState = {
  currentProject: null,
};

const project_reducer = (state = initialProjectState, action) => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_PROJECT:
      return {
        ...state,
        currentProject: action.payload.currentProject,
      };

    default:
      return state;
  }
};

const initialColorsState = {
  primaryColor: "#4c3c4c",
  secondaryColor: "#eee",
};

const colors_reducer = (state = initialColorsState, action) => {
  switch (action.type) {
    case actionTypes.SET_COLORS:
      return {
        primaryColor: action.payload.primaryColor,
        secondaryColor: action.payload.secondaryColor,
      };
    default:
      return state;
  }
};

const initialActiveIndexState = {
  activeIndex: "Collaboration Tool",
};

const active_index_reducer = (state = initialActiveIndexState, action) => {
  switch (action.type) {
    case actionTypes.SET_ACTIVE_INDEX:
      return {
        activeIndex: action.payload.activeIndex,
      };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  user: user_reducer,
  issue: issue_reducer,
  colors: colors_reducer,
  Navigation: active_index_reducer,
  project: project_reducer,
});

export default rootReducer;
