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
  codeContext: string,
  selectedCode: string
): reqType[] => {
  return [
    {
      role: "system",
      content: `I want you to act as a Senior ${languageId} Developer. \n I will provide some code about ${languageId} smart contract, \n and it will be your job to audit provided ${languageId} smart contract code, refine provided smart contract code`,
    },
    {
      role: "user",
      content: `Question: is ${selectedCode} safe at ${codeContext} in the ${languageId} code? Please explain like a professional solidity smart contract auditor and pay special attention to whether there are security issues. Do not repeat your role in your reply, it is unnecessary.`,
    },
  ];
};

// export const getAuditRequestMsg = (
//   languageId: string,
//   previousanswer: string,
//   selectedCode: string
// ): reqType[] => {
//   return [
//     {
//       role: "system",
//       content: `You are a helpful coding tutor master in ${languageId}.`,
//     },
//     {
//       role: "user",
//       content: `The original given ${languageId} code is as follows: ${selectedCode} \n We have provided code that after refine and audit : ${previousanswer}\n We have the opportunity to refine and audit this code again \n Please think carefully. And audit this code to be better. \n If it is already quite secure and efficient, \n return provided code and explain original given problem and why modify to provided code.`,
//     },
//   ];
// };

export const CustomizePrompt = (
  userinput: string,
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
      content: `Give question : ${userinput} \n And given code : ${selectedCode} \n Please answer ${userinput} as detail as possible `,
    },
  ];
};
