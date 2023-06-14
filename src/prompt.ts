import * as fs from "fs";

export type reqType = {
  role: string;
  content: string;
};

export interface GPTutorPromptType {
  languageId: string;
  selectedCode: string;
  codeContext?: string;
  auditContext?: string;
}
