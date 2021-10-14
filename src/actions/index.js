import * as actionTypes from "./types";

/* User Actions */
export const setUser = user => {
  return {
    type: actionTypes.SET_USER,
    payload: {
      currentUser: user
    }
  };
};

export const clearUser = () => {
  return {
    type: actionTypes.CLEAR_USER
  };
};

/* Issue Actions */
export const setCurrentIssue = issue => {
  return {
    type: actionTypes.SET_CURRENT_ISSUE,
    payload: {
      currentIssue: issue
    }
  };
};

export const setPrivateIssue = isPrivateIssue => {
  return {
    type: actionTypes.SET_PRIVATE_ISSUE,
    payload: {
      isPrivateIssue
    }
  };
};

export const setUserPosts = userPosts => {
  return {
    type: actionTypes.SET_USER_POSTS,
    payload: {
      userPosts
    }
  };
};

/* Project Actions */
export const setCurrentProject = project => {
  return {
    type: actionTypes.SET_CURRENT_PROJECT,
    payload: {
      currentProject: project
    }
  };
};

/* navigation Actions */
export const setActiveIndex = activeIndex => {
  return {
    type: actionTypes.SET_ACTIVE_INDEX,
    payload: {
      activeIndex
    }
  };
};

export const setSectionType = isSectionType => {
  return {
    type: actionTypes.SET_SECTION_TYPE,
    payload: {
      isSectionType
    }
  };
};


/* Colors Actions */
export const setColors = (primaryColor, secondaryColor) => {
  return {
    type: actionTypes.SET_COLORS,
    payload: {
      primaryColor,
      secondaryColor
    }
  };
};
