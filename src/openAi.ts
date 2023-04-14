import { window } from "vscode";
import { Configuration, OpenAIApi } from "openai";
import { reqType } from "./utils";

export async function openAiIsActive(apiKey: string | undefined) {
  if (apiKey === undefined) {
    return false;
  }
  const openai = getOpenAI(apiKey);
  // console.log(openai);
  try {
    const response = await openai.listModels();
    return true;
  } catch (e: any) {
    if (e.message === "Request failed with status code 401") {
      return false;
    } else {
      throw e;
    }
  }
}

const getOpenAI = (apiKey: string) => {
  const configuration = new Configuration({
    // organization: "org-VNRWJBIZ9qvXzs7kstQrqF71",
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);
  return openai;
};

export const askOpenAi = async (apiKey: string, requestMsg: reqType[]) => {
  let openai: OpenAIApi = getOpenAI(apiKey);
  let request: any = {
    model: "gpt-3.5-turbo",
    messages: requestMsg,
  };
  let res = await openai.createChatCompletion(request);
  // console.log(res.data.usage?.total_tokens);

  let channel = window.createOutputChannel("AI Tutor");
  channel.append(`${res.data.choices[0].message?.content}`);
  window.showInformationMessage(`${res.data.choices[0].message?.content}`);
};
