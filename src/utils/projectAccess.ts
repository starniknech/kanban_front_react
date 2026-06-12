import axios from 'axios';

export const PROJECT_DELETED_MESSAGE = "Couldn't find the project. The project was deleted by the owner.";
export const PROJECT_ACCESS_DENIED_MESSAGE = "You don't have access to this project.";

export function getProjectAccessRedirectMessage(error: unknown) {
  if (!axios.isAxiosError(error)) return null;

  if (error.response?.status === 404) return PROJECT_DELETED_MESSAGE;
  if (error.response?.status === 403) return PROJECT_ACCESS_DENIED_MESSAGE;

  return null;
}
