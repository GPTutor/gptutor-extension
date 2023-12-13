import axios from "axios";

interface QueryRequest {
  query: string;
}

export async function getPromptByQuery(query: string): Promise<any> {
  const endpoint =
    "https://backend.suigpt.gptutor.tools/api/get_prompt_by_query";
  const requestBody: QueryRequest = { query };
  console.log(JSON.stringify(requestBody));

  try {
    const response = await axios.post(endpoint, JSON.stringify(requestBody), {
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error response:", error.response);
      throw new Error(`Error: ${error.response?.status}`);
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}
