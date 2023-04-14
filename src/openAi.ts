import { window } from "vscode";
import { Configuration, OpenAIApi } from "openai";
import { getAuditRequestMsg, reqType } from "./utils";
import axios from "axios";

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
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);
  return openai;
};

interface GptutorApiStep1Request {
  question: string;
  code_context: string;
  program_language: string;
  definitionContextPrompt?: string;
}
interface GptutorApiStep2Request extends GptutorApiStep1Request {
  previous_answer: string;
}
export async function askGptutor(apiKey:string, req: GptutorApiStep1Request) {
  const result = await axios.post('https://api.collectsight.com/single_respond/', req);
  const { data } = result.data;
  if(!data) {
    throw new Error('No data returned from GPTutor API');
  }

  const answer = await askOpenAi(apiKey, data);
  
  const step2Req: GptutorApiStep2Request = {
    ...req,
    previous_answer: answer,
  }
  const finalResult = await axios.post('https://api.collectsight.com/second_respond/', step2Req);
  return finalResult.data;
};

export async function askOpenAi(apiKey: string, requestMsg: reqType[]) {
  let openai: OpenAIApi = getOpenAI(apiKey);
  let request: any = {
    model: "gpt-3.5-turbo",
    messages: requestMsg,
  };
  let res = await openai.createChatCompletion(request);
  // console.log(res.data.usage?.total_tokens);

  
  // TODO: handle ERROR
  return res.data.choices[0].message?.content || '';
};

export async function showAnswer(apiKey:string, req: GptutorApiStep1Request) {
  // const answer = await askGptutor(apiKey, req)
  const reqtypes = getAuditRequestMsg(
    req.program_language,
    req.definitionContextPrompt || '',
    req.code_context,
    req.question,
  );;
  const answer = await askOpenAi(apiKey, reqtypes);

  let channel = window.createOutputChannel("AI Tutor");
  channel.append(`${answer}`);
  window.showInformationMessage(`${answer}`);
}
