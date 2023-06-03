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

export const getPrompt = (
  context: any,
  current_mode: string,
  current_config_provider: any,
  languageId: string,
  selectedCode: string,
  codeContext: string,
  sourceCodeContext: string
): reqType[] => {
  let src = context.workspaceState.get("src");
  let promptProfile = JSON.parse(
    fs.readFileSync(
      context.extensionPath + "/" + src + "/media/prompt_config.json",
      "utf8"
    )
  );
  if (
    promptProfile[promptProfile.currentProfile].specificLanguages.languageId
      .length
  ) {
  }
  let prompt;
  try {
    let provider = promptProfile.currentProvider;
    prompt = promptProfile[languageId][provider][current_mode];
  } catch (e) {
    prompt = prompt.default[current_mode];
  }
  prompt = JSON.stringify(prompt);
  prompt = prompt.replace("${languageId}", languageId);
  prompt = prompt.replace("${selectedCode}", selectedCode);
  prompt = prompt.replace("${codeContext}", codeContext);
  prompt = prompt.replace("${sourceCodeContext}", sourceCodeContext);
  prompt = Array(JSON.parse(prompt));
  return prompt;
};

export const getExplainRequestMsg = (
  languageId: string,
  codeContext: string,
  selectedCode: string
): reqType[] => {
  return [
    {
      role: "system",
      content: `You are a Senior ${languageId} Developer \n I will provide a target ${languageId} code, and it will be your job to explain this target ${languageId} code.`,
    },
    {
      role: "user",
      content: `Here are target ${languageId} code : ${selectedCode}, please explain this code as detailed as possible, Here is some other information ${codeContext} if needed, Please focus on explain target ${languageId} code`,
    },
  ];
};

export const FirstAuditRequest = (
  languageId: string,
  selectedCode: string,
  codeContext: string
): reqType[] => {
  let moveSpecialization = "";
  if (languageId.toLowerCase() === "move") {
    console.log("Audit Move!");
    moveSpecialization =
      "Move is an open source language for writing safe smart contracts. It's format is similar to Rust.";
  }
  return [
    {
      role: "system",
      content: `${moveSpecialization} I want you to act as a professional ${languageId} Auditor. \n I will provide some code about ${languageId} smart contract, \n and it will be your job to audit provided ${languageId} smart contract code, refine provided smart contract code`,
    },
    {
      role: "user",
      content: `Here are ${languageId} code : ${selectedCode}, \n if there is a problem with this ${languageId} code or if there is a security concern, \n modify this ${languageId} code. Here is the full code ${codeContext} if needed`,
    },
  ];
};

export const FirstReplyForGpt3 = (
  languageId: string,
  selectedCode: string,
  codeContext: string
): reqType[] => {
  return [
    {
      role: "system",
      content: `I want you to act as a professional ${languageId} Auditor. \n I will provide some code about ${languageId} smart contract, \n and it will be your job to audit provided ${languageId} smart contract code, refine provided smart contract code`,
    },
    {
      role: "user",
      content: `Here are ${languageId} code : ${selectedCode}, \n if there is a problem with this ${languageId} code or if there is a security concern, \n modify this ${languageId} code. Here is the full code ${codeContext} if needed \n Only return the code after modified`,
    },
  ];
};

export const getAuditRequestMsg = (
  languageId: string,
  previousAnswer: string,
  selectedCode: string
): reqType[] => {
  return [
    {
      role: "system",
      content: `I want you to act as a professional ${languageId} Auditor. \n I will provide some code about ${languageId} smart contract,\n and it will be your job to audit provided ${languageId} smart contract code, refine provided smart contract code`,
    },
    {
      role: "user",
      content: `The original given ${languageId} code is as follows: ${selectedCode} \n We have provided code that after refine and audit : ${previousAnswer}\n We have the opportunity to refine and audit this code again \n Please think carefully. And audit this code to be better. \n If it is already quite secure and efficient, \n return original answer`,
    },
  ];
};

export const CustomizePrompt = (
  userInput: string,
  languageId: string,
  selectedCode: string
): reqType[] => {
  return [
    {
      role: "system",
      content: `I want you to act as a Senior ${languageId} Developer. \n Expertise in analyzing ${languageId} code and solving smart contract problems`,
    },
    {
      role: "user",
      content: `Give question : ${userInput} \n And given code : ${selectedCode} \n Please answer ${userInput} as detail as possible `,
    },
  ];
};
