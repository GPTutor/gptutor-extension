import { commands, window } from "vscode";

export type reqType = {
  role: string;
  content: string;
};

export const sleep = (second: number) => {
  return new Promise((resolve) => setTimeout(resolve, second * 1000));
};


export const getTutorRequestMsg = (
  languageId: string,
  definitionContextPrompt: string,
  codeContext: string,
  question: string
): reqType[] => {
  return [
    {
      role: "system",
      content: `You are a helpful coding tutor master in ${languageId}.`,
    },
    {
      role: "user",
      content: `${definitionContextPrompt}\n\nThe following is the ${languageId} code:\n${codeContext}\n\n${question}`,
    },
  ];
};

//! Eason plz content
export const getAuditRequestMsg = (
  languageId: string,
  definitionContextPrompt: string,
  codeContext: string,
  question: string
): reqType[] => {
  return [
    {
      role: "system",
      content: `You are a helpful coding tutor master in ${languageId}.`,
    },
    {
      role: "user",
      content: `${definitionContextPrompt}\n\nThe following is the ${languageId} code:\n${codeContext}\n\n${question}`,
    },
  ];
};
