import { OpenAI } from '@langchain/openai';
import { LLMChain, ConversationalRetrievalQAChain, loadQAChain } from 'langchain/chains';
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { PromptTemplate } from '@langchain/core/prompts';
import { SupabaseHybridSearch } from "@langchain/community/retrievers/supabase";


const CONDENSE_PROMPT =
  PromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`);

const QA_PROMPT = PromptTemplate.fromTemplate(
  `You are an AI assistant and a Nanyang Technological University(NTU) undergraduate programme admission consultant. You are given the following extracted parts of a long document and a question. Provide a conversational answer based on the context provided.
You should only use hyperlinks as references that are explicitly listed as a source in the context below. Do NOT make up a hyperlink that is not listed below.
If you can't find the answer in the context below, just say "Hmm, I'm not sure." Don't try to make up an answer.
If the question is not related to undergraduate programme in NTU, admission criterion or the context provided, politely inform them that you are tuned to only answer questions that are related to NTU undergraduate programme.
Choose the most relevant link from the links given that matches the context provided:

Question: {question}
=========
{context}
=========
Answer in Markdown:`,
);

export const makeChain = (
  retriever: SupabaseHybridSearch,
  onTokenStream?: (token: string) => void,
) => {
  const questionGenerator = new LLMChain({
    llm: new OpenAI({ temperature: 0 , modelName : 'gpt-3.5-turbo'}),
    prompt: CONDENSE_PROMPT,
  });
  
  const docChain = loadQAChain(
    new OpenAI({
      temperature: 0,
      modelName: 'gpt-3.5-turbo',
      streaming: Boolean(onTokenStream),
      callbacks: [
        {
          handleLLMNewToken(token) {
            if (onTokenStream) {
              onTokenStream(token);
            }
          }  
        }
      ]        
    }),
    { 
      type: 'stuff',
      prompt: QA_PROMPT,
    }
  );

  return new ConversationalRetrievalQAChain({
    retriever: retriever,
    combineDocumentsChain: docChain,
    questionGeneratorChain: questionGenerator,
    returnSourceDocuments: true
  });
};
