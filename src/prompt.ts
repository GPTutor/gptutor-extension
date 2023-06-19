import * as fs from "fs";

export type reqType = {
  role: string;
  content: string;
};

export interface GPTutorPromptType {
  languageId: string;
  selectedCode: string;
  codeContext?: string;
  entireDocument?: string;
  definitionContext: string;
  codeBefore: string;
  codeAfter: string;
  codeContextBefore: string;
  codeContextAfter: string;
}
