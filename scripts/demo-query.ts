import { supabaseClient } from '@/utils/supabase-client';
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from '@langchain/openai';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { SupabaseHybridSearch } from "@langchain/community/retrievers/supabase";
import { openai } from '@/utils/openai-client';

const query = 'How do i create a notion database?';

const model = openai;

async function searchForDocs() {
  const vectorStore = await SupabaseVectorStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    {
      client: supabaseClient
    }
  );

  /*uncomment below to test similarity search */
  //   const results = await vectorStore.similaritySearch(query, 2);

  //   console.log("results", results);
  
  const retriever = new SupabaseHybridSearch(new OpenAIEmbeddings(), {
    client:supabaseClient,
    //  Below are the defaults, expecting that you set up your supabase table and functions according to the guide above. Please change if necessary.
    similarityK: 2,
    keywordK: 2,
    tableName: "documents",
    similarityQueryName: "match_documents",
    keywordQueryName: "kw_match_documents",
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(model, retriever);

  //Ask a question
  const response = await chain.invoke({
    question: query,
    chat_history:'',
  })
  console.log('response', response);
}

(async () => {
  await searchForDocs();
})();
