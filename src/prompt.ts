export type reqType = {
    role: string;
    content: string;
};

export interface GPTutorPromptType  {
  languageId: string,
  selectedcode: string
  codeContext?: string,
  auditContext?: string,
  
};

export const getExplainRequestMsg = (
    languageId: string,
    codeContext: string,
    selectedcode: string
): reqType[] => {
    return [
      {
        role: "system",
        content: `You are a Senior ${languageId} Developer \n I will provide a target ${languageId} code, and it will be your job to explain this target ${languageId} code.`,
      },
      {
        role: "user",
        content: `Here are target ${languageId} code : ${selectedcode}, please explain this code as detailed as possible, Here is some other information ${codeContext} if needed, Please focus on explain target ${languageId} code`,
      },
    ];
};

export const FirstAuditRequest = (
    languageId: string,
    selectedcode: string
): reqType[] => {
    return [
      {
        role: "system",
        content: `I want you to act as a Senior ${languageId} Developer. \n I will provide some code about ${languageId} smart contract, \n and it will be your job to audit provided ${languageId} smart contract code, refine provided smart contract code`,
      },
      {
        role: "user",
        content: `Here are ${languageId} code : ${selectedcode}, \n if there is a problem with this ${languageId} code or if there is a security concern, modify this ${languageId} code. \n Please only provide code that after modify`,
      },
    ];
};

export const getAuditRequestMsg = (
    languageId: string,
    previousanswer: string,
    selectedcode: string
): reqType[] => {
    return [
      {
        role: "system",
        content: `I want you to act as a Senior ${languageId} Developer. \n I will provide some code about ${languageId} smart contract,\n and it will be your job to audit provided ${languageId} smart contract code, refine provided smart contract code`,
      },
      {
        role: "user",
        content: `The original given ${languageId} code is as follows: ${selectedcode} \n We have provided code that after refine and audit : ${previousanswer}\n We have the opportunity to refine and audit this code again \n Please think carefully. And audit this code to be better. \n If it is already quite secure and efficient, return original answer.`,
      },
    ];
};


export const CustomizePrompt = (
  userinput : string, 
  languageId : string,
  selectedcode: string
): reqType[] => {
  return [
    {
      role: "system",
      content: `I want you to act as a Senior ${languageId} Developer. \n Expertise in analyzing ${languageId} code and solving smart contract problems`,
    },
    {
      role: "user",
      content: `Give question : ${userinput} \n And given code : ${selectedcode} \n Please answer ${userinput} as detail as possible `,
    },
  ];
};
  